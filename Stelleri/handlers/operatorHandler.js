const { ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const { time } = require('@discordjs/formatters');
const config = require('../assets/config.js');
const modules = require('..');
const userUtils = require('../utils/user.js');
const logger = require('../utils/logger.js');
const editionUtils = require('../utils/edition.js');

/**
 * Handle Operator invite rejection.
 * @param {object} message Discord Message Object
 */
function handleDeclineInit(message) {
    modules.database.query("SELECT operator_invite.snowflake as inviter, edition, operator.username, operator_team.team_tag FROM operator_invite LEFT JOIN operator_team ON operator_invite.team_tag = operator_team.team_tag LEFT JOIN operator ON operator.snowflake = operator_invite.snowflake WHERE snowflake_recv = ?;", [message.author.id])
        .then((data) => {
            if (data.length === 0) return message.reply({
                content: `Hello there, <@${message.author.id}>! You do not have any pending Operator invites at the moment and/or you don't have an Operator account yet.`
            });

            const stringOptions = [];
            for (let i = 0; i < data.length; i++) {
                stringOptions.push(new StringSelectMenuOptionBuilder()
                    .setLabel(`Decline ${data[i].username}`)
                    .setDescription(`Edition: ${data[i].edition}, Owner: ${data[i].username}, Teamtag: ${data[i].team_tag}`)
                    .setValue(`operatorInviteDeclineTeamTag-${data[i].team_tag}-${data[i].inviter}`));
            }

            const select = new StringSelectMenuBuilder()
                .setCustomId('operatorInviteDeclineSelectMenu')
                .setPlaceholder('Make a selection.')
                .addOptions(stringOptions);

            return message.reply({
                content: `Hello there, <@${message.author.id}>! What invite would you like to decline?`,
                components: [new ActionRowBuilder().addComponents(select)]
            });
        }).catch((error) => {
            logger.error(error);
            return message.reply({
                content: `Something went wrong while loading your pending invites. Please try again later.`
            });
        });
}

/**
 * Handle the selected team.
 * @param {object} message Discord Message Object
 */
async function handleDeclineSelect(interaction) {
    const selectedTeamTag = interaction.values[0].split("-")[1];
    const inviterId = interaction.values[0].split("-")[2];

    const cancelButton = new ButtonBuilder()
        .setCustomId(`cancelOperatorInvite-${selectedTeamTag}`)
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary);

    const declineButton = new ButtonBuilder()
        .setCustomId(`declineOperatorInvite-${selectedTeamTag}`)
        .setLabel("Decline")
        .setStyle(ButtonStyle.Danger);

    await interaction.update({
        content: `Are you sure you want to decline this Operator invite? This action is irreversibele by you, and you must be invited again.\n\n Teamtag: \`${selectedTeamTag}\`, Inviter: <@${inviterId}>`,
        components: [new ActionRowBuilder().addComponents(cancelButton, declineButton)]
    });
}

/**
 * Handle the final rejection.
 * @param {object} message Discord Message Object
 */
function handleDeclineFinal(interaction) {
    const teamTag = interaction.customId.split("-")[1];
    modules.database.query("SELECT * FROM operator_member WHERE team_tag = ? AND team_owner = 1; DELETE FROM operator_invite WHERE snowflake_recv = ? AND team_tag = ?;", [teamTag, interaction.user.id, teamTag])
        .then(async (data) => {
            interaction.message.edit({
                content: `Alright, I declined the pending invite and sent a message to ${data[0][0] ? `<@${data[0][0].snowflake}>` : "the inviter"}.`,
                components: []
            });

            // Notify Team Owner
            if (data[0].length === 0) return;
            const teamOwnerUser = await userUtils.findUserById(data[0][0].snowflake);
            logger.log(`User '${interaction.user.username}'@'${interaction.user.id}' has declined '${teamOwnerUser.username}'@'${teamOwnerUser.id}' to join their Operator team '${teamTag}'.`, "info");
            teamOwnerUser.send({ content: `<@${interaction.user.id}> has declined the Operator invite to join your team (\`${teamTag}\`).` })
                .catch(() => {
                    logger.log(`Sending Operator invite decline message to team owner '${teamOwnerUser.username}'@'${teamOwnerUser.id}' was not succesful.`, "warning");
                });
        }).catch((error) => {
            logger.error(error);
            return interaction.message.reply({
                content: "Something went wrong while removing your invite. Please try again later.",
                components: []
            });
        });
}

/**
 * Cancel the final rejection.
 * @param {object} message Discord Message Object
 */
function handleDeclineCancel(interaction) {
    return interaction.message.edit({
        content: "Alright, I did not decline your Operator invitation. It will stay as pending untill you accept or decline it.",
        components: []
    });
}

/**
 * Handle the selection to modify/overview a team.
 * @param {object} message Discord Message Object
 */
async function handleSelectionMenu(interaction) {
    const teamTag = interaction.values[0].split("-")[1];
    const actionType = interaction.values[0].split("-")[2];
    let rawTargetMemberId = interaction.values[0].split("-")[3];
    const targetMemberId = rawTargetMemberId === "null" ? null : rawTargetMemberId;

    if (actionType === "modify") {
        const select = new StringSelectMenuBuilder()
            .setCustomId('operatorModifyMenu')
            .setPlaceholder('Make a selection.')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Invite')
                    .setDescription('Invite a new user to your team.')
                    .setValue(`operatorModify-invite-${teamTag}-${targetMemberId}`),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Remove')
                    .setDescription('Remove a current teammember from your team.')
                    .setValue(`operatorModify-remove-${teamTag}-${targetMemberId}`));

        await interaction.update({
            content: `Choose wheter you want to invite or remove <@${targetMemberId}> from \`${teamTag}\`.`,
            components: [new ActionRowBuilder().addComponents(select)],
            ephemeral: true
        });
    } else if (actionType === "overview") {
        modules.database.query("SELECT operator_member.*, edition, (SELECT COUNT(*) FROM guild WHERE team_tag = ?) AS server_count FROM operator_member LEFT JOIN operator_team ON operator_team.team_tag = operator_member.team_tag WHERE operator_member.team_tag = ?;", [teamTag, teamTag])
            .then((data) => {
                /**
                 * Convert Account Status to text.
                 * @param {string} input Account status.
                 */
                function getStatus(input) {
                    switch (input) {
                        case 0:
                            return "🟣 **Invite Pending**"
                        case 1:
                            return "🟠 **Unverified**"
                        case 2:
                            return "🟢 **Verified**"
                        default:
                            return "🔴 **Unknown**"
                    }
                }

                // Parse & Prepare Data
                let seats = [];
                for (let i = 0; i <= data.length; i++) {
                    if (i === data.length) {
                        seats.unshift({ name: 'Seats', value: "-----" });
                    } else {
                        const operator = data[i];
                        const operatorObject = {
                            name: `Seat ${i + 1}${operator.snowflake === interaction.user.id ? " (You)" : ""}`,
                            value: `<@${operator.snowflake}> ${getStatus(operator.account_status)}`,
                            inline: true
                        }

                        if (operator.team_owner) {
                            seats.unshift({
                                name: `Owner 👑${operator.snowflake === interaction.user.id ? " (You)" : ""}`, value: `<@${operator.snowflake}> ${getStatus(operator.account_status)}`, inline: true
                            });
                        } else seats.push(operatorObject);
                    }
                }

                // Reply
                let editionObject = editionUtils.getStatitistics(data[0].edition);
                if (!editionObject) return interaction.update({
                    content: "Something went wrong while retrieving the required information. Please try again later.",
                    components: [],
                    ephemeral: true
                });
                const embed = new EmbedBuilder()
                    .setColor(config.general.color)
                    .setTitle("Operator Overview")
                    .setDescription(`Here is an overview of your plan statistics and team members for your selected teamtag.`)
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
                    .addFields(seats)
                    .addFields(
                        { name: "Information", value: "-----" },
                        { name: 'Seats Used', value: `\`${data.length}/${editionObject.seats}\``, inline: true },
                        { name: 'Servers Used', value: `\`${data[0].server_count}/${editionObject.servers}\``, inline: true },
                        { name: 'Team Tag', value: `\`${data[0].team_tag}\``, inline: true },
                        { name: 'Edition', value: `\`${data[0].edition}\``, inline: true },
                        { name: 'Creation Date', value: time(data[0].date_creation), inline: true },
                        { name: 'Update Date', value: time(data[0].date_update), inline: true },
                        { name: 'Note', value: `Changing your subscription details and advanced settings can be done with the [Bot Commander](${config.urls.botCommanderWebsite}) application or the [website](${config.urls.website}). If you have any questions or concerns, don't hesitate to reach out to <@${config.general.authorSnowflake}>.` })
                    .setTimestamp()
                    .setFooter({ text: `Embed created by ${config.general.name}` });
                return interaction.update({
                    embeds: [embed],
                    components: [],
                    ephemeral: true
                });
            }).catch((error) => {
                logger.error(error);
                return interaction.update({
                    content: "Something went wrong while retrieving your information. Please try again later.",
                    components: [],
                    ephemeral: true
                });
            });
    }
}

/**
 * Handle the selection to modify a team.
 * @param {object} message Discord Message Object
 */
async function handleModifyMenu(interaction) {
    const actionType = interaction.values[0].split("-")[1];
    const teamTag = interaction.values[0].split("-")[2];
    const targetMember = await userUtils.findUserById(interaction.values[0].split("-")[3]);

    if (targetMember.bot) return interaction.update({
        content: `User <@${targetMember.id}> is a bot, and can therefore not be invited to your team.`,
        components: [],
        ephemeral: true
    });

    modules.database.query("SELECT edition, capacity_operator, capacity_server, COUNT(operator_member.team_tag) as operator_count, em.snowflake as owner_snowflake, IFNULL((SELECT 1 FROM operator_member WHERE snowflake = ? AND team_tag = ?), 0) as presence FROM operator_team LEFT JOIN operator_member ON operator_member.team_tag = operator_team.team_tag LEFT JOIN operator_member em ON em.team_tag = operator_team.team_tag WHERE operator_team.team_tag = ? AND em.team_owner = 1;", [targetMember.id, teamTag, teamTag])
        .then(async (data) => {
            if (data[0].owner_snowflake !== interaction.user.id) return interaction.update({
                content: `Only the owner of team \`${teamTag}\` can ${actionType === "invite" ? `invite <@${targetMember.id}> to this team.` : `remove <@${targetMember.id}> from this team.`}`,
                components: [],
                ephemeral: true
            });

            if (actionType === "invite") {
                // Presence
                if (data[0].presence === 1) return interaction.update({
                    content: `User <@${targetMember.id}> is already a member of team \`${teamTag}\`.`,
                    components: [],
                    ephemeral: true
                });

                // Capacity
                if (data[0].operator_count >= data[0].capacity_operator) return interaction.update({
                    content: `Your \`${data[0].edition}\` team does not have the capacity for another member (${data[0].operator_count}/${data[0].capacity_operator} seats used). Upgrade your current plan or request a custom solution on the [website](${config.urls.website}).`,
                    components: [],
                    ephemeral: true
                });

                // Finalize
                modules.database.query("INSERT INTO operator_invite (snowflake, snowflake_recv, team_tag) VALUES (?, ?, ?)", [interaction.user.id, targetMember.id, teamTag])
                    .then(() => {
                        const registerLink = `${config.urls.website}/login?team=${teamTag}&owner=${interaction.user.id}&target=${targetMember.id}`;
                        const embed = new EmbedBuilder()
                            .setColor(config.general.color)
                            .setTitle("New Operator Invite")
                            .setDescription(`Hello <@${targetMember.id}>! <@${interaction.user.id}> has invited **you** to join his Operator team.`)
                            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
                            .addFields(
                                { name: "Instructions", value: "-----" },
                                { name: 'Accept', value: `If you decide to join them, you can click on this [link](${registerLink}). It will direct you to my website, where you can create an Operator account if you don't have one yet, and finalize registration..` },
                                { name: 'Decline', value: `If you do not want to join their team, please send me \`/operatorDecline\`, and I will remove your record & notify <@${interaction.user.id}>.` },
                                { name: 'Safety', value: `If I have spammed you with invites and/or you do not know about any of this, please contact <@${config.general.authorSnowflake}> to get this fixed!` },
                                { name: 'Information', value: `If you want to know more about this whole 'Operator' thing, you can read more about it [here](${config.urls.website}).` },
                                { name: 'Meta', value: "-----" })
                            .addFields(
                                { name: 'Teamtag', value: `\`${teamTag}\``, inline: true },
                                { name: 'Edition', value: `\`${data[0].edition}\``, inline: true },
                                { name: 'Date', value: time(), inline: true })
                            .setTimestamp()
                            .setFooter({ text: `Embed created by ${config.general.name}` });
                        targetMember.send({ embeds: [embed] })
                            .then(() => {
                                logger.log(`User '${interaction.user.username}'@'${interaction.user.id}' has invited '${targetMember.username}'@'${targetMember.id}' to join their Operator team '${teamTag}' in Guild '${interaction.guild.name}'@'${interaction.guild.id}'. Instructions sent directly.`, "info");
                                return interaction.update({
                                    content: `So far so good! I need some additional information like email and password from <@${targetMember.id}>, so I DM'd them with futher instructions. I will send you a notification (if you have allowed this) when this user has accepted or declined your invite. That's all for now!`,
                                    components: [],
                                    ephemeral: true
                                });
                            }).catch(() => {
                                logger.log(`User '${interaction.user.username}'@'${interaction.user.id}' has invited '${targetMember.username}'@'${targetMember.id}' to join their Operator team '${teamTag}' in Guild '${interaction.guild.name}'@'${interaction.guild.id}'. Instructions must be send by the inviter.`, "info");
                                return interaction.update({
                                    content: `All checks passed, but I couldn't reach your soon-to-be teammate. They might have DM's from applications like myself disabled. Can you please them this link instead?\n\n\`${registerLink}\``,
                                    components: [],
                                    ephemeral: true
                                });
                            });
                    }).catch((error) => {
                        if (error.message.includes("operator_invite_unique")) {
                            return interaction.update({
                                content: `You have already invited <@${targetMember.id}>, and your request is now pending. Please be patient while they consider your request, or DM them to hurry up.`,
                                components: [],
                                ephemeral: true
                            });
                        } else {
                            logger.error(error);
                            return interaction.update({
                                content: "Something went wrong while updating your information. Please try again later.",
                                components: [],
                                ephemeral: true
                            });
                        }
                    });
            } else if (actionType === "remove") {
                const select = new StringSelectMenuBuilder()
                    .setCustomId('operatorModifyRemoveMenu')
                    .setPlaceholder('Make a selection.')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Cancel Pending Invite')
                            .setDescription(`Cancel invites to ${targetMember.username} from team ${teamTag}.`)
                            .setValue(`operatorModifyRemove-invite-${teamTag}-${targetMember.id}`),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Team Removal')
                            .setDescription(`Remove ${targetMember.username} from team ${teamTag}.`)
                            .setValue(`operatorModifyRemove-team-${teamTag}-${targetMember.id}`));

                await interaction.update({
                    content: `Choose wheter you want to remove <@${targetMember.id}> from a pending invite or remove them from your team. Selected team: \`${teamTag}\`.`,
                    components: [new ActionRowBuilder().addComponents(select)],
                    ephemeral: true
                });
            }
        }).catch((error) => {
            logger.error(error);
            return interaction.update({
                content: `Something went wrong while retrieving the required information. Please try again later.`,
                components: [],
                ephemeral: true
            });
        });
}

/**
 * Handle the selection to remove a user from an invite or team.
 * @param {object} message Discord Message Object
 */
async function handleModifyRemoveMenu(interaction) {
    const actionType = interaction.values[0].split("-")[1];
    const teamTag = interaction.values[0].split("-")[2];
    const targetMember = await userUtils.findUserById(interaction.values[0].split("-")[3]);

    if (actionType === "invite") {
        modules.database.query("DELETE FROM operator_invite WHERE team_tag = ? AND snowflake_recv = ?;", [teamTag, targetMember.id])
            .then(() => {
                logger.log(`User '${interaction.user.username}'@'${interaction.user.id}' has cancelled any pending invites to '${targetMember.username}'@'${targetMember.id}' from their Operator team '${teamTag}' in Guild '${interaction.guild.name}'@'${interaction.guild.id}'.`, "warning");
                return interaction.update({
                    content: `Cancelled any pending invites from team \`${teamTag}\` to <@${targetMember.id}>.`,
                    components: [],
                    ephemeral: true
                });
            }).catch((error) => {
                logger.error(error);
                return interaction.update({
                    content: "Something went wrong while cancelling the invite. Please try again later.",
                    components: [],
                    ephemeral: true
                });
            });
    } else if (actionType === "team") {
        modules.database.query("DELETE FROM operator_member WHERE team_tag = ? AND snowflake = ?;", [teamTag, targetMember.id])
            .then(() => {
                logger.log(`User '${interaction.user.username}'@'${interaction.user.id}' has removed '${targetMember.username}'@'${targetMember.id}' from their Operator team '${teamTag}' in Guild '${interaction.guild.name}'@'${interaction.guild.id}'.`, "warning");
                return interaction.update({
                    content: `Removed <@${targetMember.id}> from team \`${teamTag}\`. One new seat available.`,
                    components: [],
                    ephemeral: true
                });
            }).catch((error) => {
                logger.error(error);
                return interaction.update({
                    content: "Something went wrong while removing this user from your team. Please try again later.",
                    components: [],
                    ephemeral: true
                });
            });
    }
}

module.exports = {
    "handleDeclineInit": handleDeclineInit,
    "handleDeclineSelect": handleDeclineSelect,
    "handleDeclineFinal": handleDeclineFinal,
    "handleDeclineCancel": handleDeclineCancel,
    "handleSelectionMenu": handleSelectionMenu,
    "handleModifyMenu": handleModifyMenu,
    "handleModifyRemoveMenu": handleModifyRemoveMenu
}
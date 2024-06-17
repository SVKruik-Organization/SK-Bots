const { ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
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
    modules.database.query("SELECT om_owner.*, username, edition FROM operator_member om_member JOIN operator_member om_owner ON om_member.team_tag = om_owner.team_tag LEFT JOIN user_general ON user_general.snowflake = om_owner.snowflake LEFT JOIN operator_team ON operator_team.team_tag = om_owner.team_tag WHERE om_member.snowflake = ? AND om_member.invite_pending = 1 AND om_owner.team_owner = 1;", [message.author.id])
        .then((data) => {
            if (data.length === 0) return message.reply({
                content: `Hello there, <@${message.author.id}>! You do not have any pending Operator invites at the moment.`
            });

            const stringOptions = [];
            for (let i = 0; i < data.length; i++) {
                stringOptions.push(new StringSelectMenuOptionBuilder()
                    .setLabel(`Decline ${data[i].username}`)
                    .setDescription(`Edition: ${data[i].edition}, Owner: ${data[i].username}`)
                    .setValue(`operatorInviteDeclineTeamTag-${data[i].team_tag}`));
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
    const declineButton = new ButtonBuilder()
        .setCustomId(`declineOperatorInvite-${selectedTeamTag}`)
        .setLabel("Decline")
        .setStyle("Danger");

    await interaction.message.reply({
        content: "Are you sure you want to decline this Operator invite? This action is irreversibele by you, and you must be invited again.",
        components: [new ActionRowBuilder().addComponents(declineButton)]
    });
    interaction.message.delete();
}

/**
 * Handle the final rejection.
 * @param {object} message Discord Message Object
 */
function handleDeclineFinal(interaction) {
    const teamTag = interaction.customId.split("-")[1];
    modules.database.query("SELECT * FROM operator_member WHERE team_tag = ? AND team_owner = 1; DELETE FROM operator_member WHERE snowflake = ? AND invite_pending = 1 AND team_tag = ?;", [teamTag, interaction.user.id, teamTag])
        .then(async (data) => {
            interaction.message.edit({
                content: `Alright, I declined the pending invite and sent a message to ${data[0][0] ? `<@${data[0][0].snowflake}>` : "the inviter"}.`,
                components: []
            });

            // Notify Team Owner
            if (data[0].length === 0) return;
            const teamOwnerUser = await userUtils.findUserById(data[0][0].snowflake);
            teamOwnerUser.send({ content: `<@${interaction.user.id}> has declined the Operator invite to join your team.` })
                .catch(() => {
                    logger.log(`Sending Operator invite decline message to team owner was not succesful.`);
                });
        }).catch((error) => {
            logger.error(error);
            return interaction.message.reply({
                content: `Something went wrong while removing your invite. Please try again later.`,
                components: []
            });
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
                    .setLabel('Add')
                    .setDescription('A')
                    .setValue(`operatorModify-add-${teamTag}-${targetMemberId}`),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Remove')
                    .setDescription('B')
                    .setValue(`operatorModify-remove-${teamTag}-${targetMemberId}`));

        await interaction.update({
            content: `Choose wheter you want to add or remove <@${targetMemberId}> from \`${teamTag}\`.`,
            components: [new ActionRowBuilder().addComponents(select)],
            ephemeral: true
        });
    } else if (actionType === "overview") {
        modules.database.query("SELECT operator_member.*, edition, (SELECT COUNT(*) FROM guild WHERE team_tag = ?) as server_count FROM operator_member LEFT JOIN operator_team ON operator_team.team_tag = operator_member.team_tag WHERE operator_member.team_tag = ?;", [teamTag, teamTag])
            .then((data) => {
                // Parse & Prepare Data
                let seats = [];
                for (let i = 0; i <= data.length; i++) {
                    if (i === data.length) {
                        seats.unshift({ name: 'Seats', value: "-----" });
                    } else {
                        const operator = data[i];
                        const operatorObject = {
                            name: `Seat ${i + 1}${operator.snowflake === interaction.user.id ? " (You)" : ""}`,
                            value: `<@${operator.snowflake}>${operator.verified ? " 🟢 **Verified**" : (operator.invite_pending ? " 🟣 **Invite Pending**" : " 🟠 **Unverified**")}`,
                            inline: true
                        }

                        if (operator.team_owner) {
                            seats.unshift({
                                name: `Owner 👑${operator.snowflake === interaction.user.id ? " (You)" : ""}`, value: `<@${operator.snowflake}> ${operator.verified ? " 🟢 **Verified**" : (operator.invite_pending ? " 🟣 **Invite Pending**" : " 🟠 **Unverified**")}`, inline: true
                            });
                        } else seats.push(operatorObject);
                    }
                }

                // Reply
                const editionObject = editionUtils.getStatitistics(data[0].edition);
                const embed = new EmbedBuilder()
                    .setColor(config.general.color)
                    .setTitle("Operator Overview")
                    .setDescription(`Here is an overview of your plan statistics and team members for this specific server. An Operator team can manage multiple servers, so this overview applies to **${interaction.guild.name}**.`)
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

    if (actionType === "add") {
        console.log(`Received: Add, ${teamTag}, <@${targetMember.id}>`);
    } else if (actionType === "remove") {
        console.log(`Received: Remove, ${teamTag}, <@${targetMember.id}>`);
    }

    return interaction.update({
        content: `Received: ${actionType}, ${teamTag}, <@${targetMember.id}>`,
        components: [],
        ephemeral: true
    });
}

module.exports = {
    "handleDeclineInit": handleDeclineInit,
    "handleDeclineSelect": handleDeclineSelect,
    "handleDeclineFinal": handleDeclineFinal,
    "handleSelectionMenu": handleSelectionMenu,
    "handleModifyMenu": handleModifyMenu
}
import { ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ButtonStyle, StringSelectMenuInteraction, ChatInputCommandInteraction, ButtonInteraction, User, InteractionResponse } from 'discord.js';
import { time } from '@discordjs/formatters';
import { general, colors, urls } from '../config.js';
import { database } from '../index.js';
import { findUserById } from '../utils/user.js';
import { logError, logMessage } from '../utils/logger.js';
import { getStatitistics } from '../utils/edition.js';

/**
 * Handle Operator invite rejection.
 * @param interaction Discord Interaction Object
 */
export async function handleDeclineInit(interaction: ChatInputCommandInteraction): Promise<InteractionResponse> {
    try {
        const data: Array<{ inviter: string, edition: string, username: string, team_tag: string }> = await database.query("SELECT operator_invite.snowflake as inviter, edition, operator.username, operator_team.team_tag FROM operator_invite LEFT JOIN operator_team ON operator_invite.team_tag = operator_team.team_tag LEFT JOIN operator ON operator.snowflake = operator_invite.snowflake WHERE snowflake_recv = ?;", [interaction.user.id])
        if (data.length === 0) return await interaction.reply({
            content: "You do not have any pending Operator invites at the moment and/or you don't have an Operator account yet.",
            ephemeral: true
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

        return await interaction.reply({
            content: "What invite would you like to decline?",
            components: [new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(select)],
            ephemeral: true
        });
    }
    catch (error: any) {
        logError(error);
        return await interaction.reply({
            content: `Something went wrong while loading your pending invites. Please try again later.`
        });
    }
}

/**
 * Handle the selected team.
 * @param interaction Discord Interaction Object
 */
export async function handleDeclineSelect(interaction: StringSelectMenuInteraction): Promise<InteractionResponse> {
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

    return await interaction.update({
        content: `Are you sure you want to decline this Operator invite? This action is irreversibele by you, and you must be invited again.\n\n Teamtag: \`${selectedTeamTag}\`, Inviter: <@${inviterId}>`,
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(cancelButton, declineButton)]
    });
}

/**
 * Handle the final rejection.
 * @param interaction Discord Interaction Object
 */
export async function handleDeclineFinal(interaction: ButtonInteraction) {
    try {
        const teamTag: string = interaction.customId.split("-")[1];
        const data: Array<Array<{ snowflake: string }>> = await database.query("SELECT snowflake FROM operator_member WHERE team_tag = ? AND team_owner = 1; DELETE FROM operator_invite WHERE snowflake_recv = ? AND team_tag = ?;", [teamTag, interaction.user.id, teamTag]);
        await interaction.update({
            content: `Alright, I declined the pending invite and sent a interaction to ${data[0][0] ? `<@${data[0][0].snowflake}>` : "the inviter"}.`,
            components: []
        });

        // Notify Team Owner
        if (data[0].length === 0) return;
        const teamOwnerUser = await findUserById(data[0][0].snowflake);
        logMessage(`User '${interaction.user.username}'@'${interaction.user.id}' has declined '${teamOwnerUser.username}'@'${teamOwnerUser.id}' to join their Operator team '${teamTag}'.`, "info");
        try {
            await teamOwnerUser.send({ content: `<@${interaction.user.id}> has declined the Operator invite to join your team (\`${teamTag}\`).` });
        } catch (error: any) {
            logMessage(`Sending Operator invite decline interaction to team owner '${teamOwnerUser.username}'@'${teamOwnerUser.id}' was not succesful.`, "warning");
        }
    } catch (error: any) {
        logError(error);
        return await interaction.reply({
            content: "Something went wrong while removing your invite. Please try again later.",
            components: []
        });
    }
}

/**
 * Cancel the final rejection.
 * @param interaction Discord Interaction Object
 */
export async function handleDeclineCancel(interaction: ButtonInteraction) {
    return await interaction.update({
        content: "Alright, I did not decline your Operator invitation. It will stay as pending untill you accept or decline it.",
        components: []
    });
}

/**
 * Handle the selection to modify/overview a team.
 * @param interaction Discord Interaction Object
 */
export async function handleSelectionMenu(interaction: StringSelectMenuInteraction) {
    const teamTag: string = interaction.values[0].split("-")[1];
    const actionType: string = interaction.values[0].split("-")[2];
    let rawTargetMemberId: string = interaction.values[0].split("-")[3];
    const targetMemberId: string | null = rawTargetMemberId === "null" ? null : rawTargetMemberId;

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

        return await interaction.update({
            content: `Choose wheter you want to invite or remove <@${targetMemberId}> from \`${teamTag}\`.`,
            components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)]
        });
    } else if (actionType === "overview") {
        try {
            const data: Array<{ snowflake: string, account_status: number, team_owner: boolean, edition: string, server_count: string, team_tag: string, date_creation: Date, date_update: Date }> = await database.query("SELECT operator_member.*, edition, (SELECT COUNT(*) FROM guild WHERE team_tag = ?) AS server_count FROM operator_member LEFT JOIN operator_team ON operator_team.team_tag = operator_member.team_tag WHERE operator_member.team_tag = ?;", [teamTag, teamTag]);
            /**
             * Convert Account Status to text.
             * @param input Account status.
             */
            function getStatus(input: number) {
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
            let editionObject = getStatitistics(data[0].edition);
            if (!editionObject) return await interaction.update({
                content: "Something went wrong while retrieving the required information. Please try again later.",
                components: []
            });
            const embed = new EmbedBuilder()
                .setColor(colors.bot)
                .setTitle("Operator Overview")
                .setDescription(`Here is an overview of your plan statistics and team members for your selected teamtag.`)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() as string })
                .addFields(seats)
                .addFields(
                    { name: "Information", value: "-----" },
                    { name: 'Seats Used', value: `\`${data.length}/${editionObject.seats}\``, inline: true },
                    { name: 'Servers Used', value: `\`${data[0].server_count}/${editionObject.servers}\``, inline: true },
                    { name: 'Team Tag', value: `\`${data[0].team_tag}\``, inline: true },
                    { name: 'Edition', value: `\`${data[0].edition}\``, inline: true },
                    { name: 'Creation Date', value: time(data[0].date_creation), inline: true },
                    { name: 'Update Date', value: data[0].date_update ? time(data[0].date_update) : "Never", inline: true },
                    { name: 'Note', value: `Changing your subscription details and advanced settings can be done with the [SK Commander](${urls.skCommander}) application or the [website](${urls.website}). If you have any questions or concerns, don't hesitate to reach out to <@${general.authorId}>.` })
                .setTimestamp()
                .setFooter({ text: `Embed created by ${general.name}` });
            return await interaction.update({
                embeds: [embed],
                components: []
            });
        } catch (error: any) {
            logError(error);
            return await interaction.update({
                content: "Something went wrong while retrieving your information. Please try again later.",
                components: []
            });
        }
    }
}

/**
 * Handle the selection to modify a team.
 * @param interaction Discord Interaction Object
 */
export async function handleModifyMenu(interaction: StringSelectMenuInteraction) {
    try {
        const actionType: string = interaction.values[0].split("-")[1];
        const teamTag: string = interaction.values[0].split("-")[2];
        const targetMember: User = await findUserById(interaction.values[0].split("-")[3]);

        if (targetMember.bot) return await interaction.update({
            content: `User <@${targetMember.id}> is a bot, and can therefore not be invited to your team.`,
            components: []
        });

        const data: Array<{ owner_snowflake: string, presence: number, edition: string, operator_count: number, capacity_operator: number }> = await database.query("SELECT edition, capacity_operator, capacity_server, COUNT(operator_member.team_tag) as operator_count, em.snowflake as owner_snowflake, IFNULL((SELECT 1 FROM operator_member WHERE snowflake = ? AND team_tag = ?), 0) as presence FROM operator_team LEFT JOIN operator_member ON operator_member.team_tag = operator_team.team_tag LEFT JOIN operator_member em ON em.team_tag = operator_team.team_tag WHERE operator_team.team_tag = ? AND em.team_owner = 1;", [targetMember.id, teamTag, teamTag]);
        if (data[0].owner_snowflake !== interaction.user.id) return await interaction.update({
            content: `Only the owner of team \`${teamTag}\` can ${actionType === "invite" ? `invite <@${targetMember.id}> to this team.` : `remove <@${targetMember.id}> from this team.`}`,
            components: []
        });

        if (actionType === "invite") {
            try {
                // Presence
                if (data[0].presence === 1) return await interaction.update({
                    content: `User <@${targetMember.id}> is already a member of team \`${teamTag}\`.`,
                    components: []
                });

                // Capacity
                if (data[0].operator_count >= data[0].capacity_operator) return await interaction.update({
                    content: `Your \`${data[0].edition}\` team does not have the capacity for another member (${data[0].operator_count}/${data[0].capacity_operator} seats used). Upgrade your current plan or request a custom solution on the [website](${urls.website}).`,
                    components: []
                });

                // Finalize
                await database.query("INSERT INTO operator_invite (snowflake, snowflake_recv, team_tag) VALUES (?, ?, ?)", [interaction.user.id, targetMember.id, teamTag]);
                // TODO - Register Link Handling
                const registerLink = `${urls.website}/login?team=${teamTag}&owner=${interaction.user.id}&target=${targetMember.id}`;
                const embed = new EmbedBuilder()
                    .setColor(colors.bot)
                    .setTitle("New Operator Invite")
                    .setDescription(`Hello <@${targetMember.id}>! <@${interaction.user.id}> has invited **you** to join his Operator team.`)
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() as string })
                    .addFields(
                        { name: "Instructions", value: "-----" },
                        { name: 'Accept', value: `If you decide to join them, you can click on this [link](${registerLink}). It will direct you to my website, where you can create an Operator account if you don't have one yet, and finalize registration..` },
                        { name: 'Decline', value: `If you do not want to join their team, please send me \`/operatorDecline\`, and I will remove your record & notify <@${interaction.user.id}>.` },
                        { name: 'Safety', value: `If I have spammed you with invites and/or you do not know about any of this, please contact <@${general.authorId}> to get this fixed!` },
                        { name: 'Information', value: `If you want to know more about this whole 'Operator' thing, you can read more about it [here](${urls.website}).` },
                        { name: 'Meta', value: "-----" })
                    .addFields(
                        { name: 'Teamtag', value: `\`${teamTag}\``, inline: true },
                        { name: 'Edition', value: `\`${data[0].edition}\``, inline: true },
                        { name: 'Date', value: time(), inline: true })
                    .setTimestamp()
                    .setFooter({ text: `Embed created by ${general.name}` });

                try {
                    await targetMember.send({ embeds: [embed] });
                    logMessage(`User '${interaction.user.username}'@'${interaction.user.id}' has invited '${targetMember.username}'@'${targetMember.id}' to join their Operator team '${teamTag}' in Guild '${interaction.guild?.name}'@'${interaction.guild?.id}'. Instructions sent directly.`, "info");
                    return await interaction.update({
                        content: `So far so good! I need some additional information like email and password from <@${targetMember.id}>, so I DM'd them with futher instructions. I will send you a notification (if you have allowed this) when this user has accepted or declined your invite. That's all for now!`,
                        components: []
                    });
                } catch (error: any) {
                    logMessage(`User '${interaction.user.username}'@'${interaction.user.id}' has invited '${targetMember.username}'@'${targetMember.id}' to join their Operator team '${teamTag}' in Guild '${interaction.guild?.name}'@'${interaction.guild?.id}'. Instructions must be send by the inviter.`, "info");
                    return await interaction.update({
                        content: `All checks passed, but I couldn't reach your soon-to-be teammate. They might have DM's from applications like myself disabled. Can you please them this link instead?\n\n\`${registerLink}\``,
                        components: []
                    });
                }
            } catch (error: any) {
                if (error.sqlMessage && error.sqlMessage.includes("operator_invite_unique")) {
                    return await interaction.update({
                        content: `You have already invited <@${targetMember.id}>, and your request is now pending. Please be patient while they consider your request, or DM them to hurry up.`,
                        components: []
                    });
                } else {
                    logError(error);
                    return await interaction.update({
                        content: "Something went wrong while updating your information. Please try again later.",
                        components: []
                    });
                }
            }
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

            return await interaction.update({
                content: `Choose wheter you want to StringSelectMenuBuilder <@${targetMember.id}> from a pending invite or remove them from your team. Selected team: \`${teamTag}\`.`,
                components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)]
            });
        }
    } catch (error: any) {
        logError(error);
        return await interaction.update({
            content: `Something went wrong while retrieving the required information. Please try again later.`,
            components: []
        });
    }
}

/**
 * Handle the selection to remove a user from an invite or team.
 * @param interaction Discord Interaction Object
 */
export async function handleModifyRemoveMenu(interaction: StringSelectMenuInteraction) {
    const actionType = interaction.values[0].split("-")[1];
    const teamTag = interaction.values[0].split("-")[2];
    const targetMember = await findUserById(interaction.values[0].split("-")[3]);

    if (actionType === "invite") {
        try {
            await database.query("DELETE FROM operator_invite WHERE team_tag = ? AND snowflake_recv = ?;", [teamTag, targetMember.id])
            logMessage(`User '${interaction.user.username}'@'${interaction.user.id}' has cancelled any pending invites to '${targetMember.username}'@'${targetMember.id}' from their Operator team '${teamTag}' in Guild '${interaction.guild?.name}'@'${interaction.guild?.id}'.`, "warning");
            return await interaction.update({
                content: `Cancelled any pending invites from team \`${teamTag}\` to <@${targetMember.id}>.`,
                components: []
            });
        } catch (error: any) {
            logError(error);
            return await interaction.update({
                content: "Something went wrong while cancelling the invite. Please try again later.",
                components: []
            });
        }
    } else if (actionType === "team") {
        try {
            await database.query("DELETE FROM operator_member WHERE team_tag = ? AND snowflake = ?;", [teamTag, targetMember.id])
            logMessage(`User '${interaction.user.username}'@'${interaction.user.id}' has removed '${targetMember.username}'@'${targetMember.id}' from their Operator team '${teamTag}' in Guild '${interaction.guild?.name}'@'${interaction.guild?.id}'.`, "warning");
            return await interaction.update({
                content: `Removed <@${targetMember.id}> from team \`${teamTag}\`. One new seat available.`,
                components: []
            });
        } catch (error: any) {
            logError(error);
            return await interaction.update({
                content: "Something went wrong while removing this user from your team. Please try again later.",
                components: []
            });
        }
    }
}

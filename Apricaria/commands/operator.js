const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { time } = require('@discordjs/formatters');
const config = require('../assets/config.js');
const modules = require('..');
const userUtils = require('../utils/user.js');
const logger = require('../utils/logger.js');
const editionUtils = require('../utils/edition.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('operator')
        .setNameLocalizations({
            nl: "operator"
        })
        .setDescription('Controls for the Operator system.')
        .setDescriptionLocalizations({
            nl: "Bediening voor het Operator systeem."
        })
        .addSubcommand(option => option
            .setName('add')
            .setNameLocalizations({
                nl: "toevoegen"
            })
            .setDescription("Add a new Operator to your team if your plan has enough seats.")
            .setDescriptionLocalizations({
                nl: "Voeg een Operator toe aan uw team als uw abonnement capaciteit heeft."
            })
            .addUserOption(option => option
                .setName('target')
                .setNameLocalizations({
                    nl: "gebruiker"
                })
                .setDescription('The target member.')
                .setDescriptionLocalizations({
                    nl: "De betreffende gebruiker."
                })
                .setRequired(true)))
        .addSubcommand(option => option
            .setName('remove')
            .setNameLocalizations({
                nl: "verwijderen"
            })
            .setDescription("Remove an Operator for your team.")
            .setDescriptionLocalizations({
                nl: "Verwijder een Operator uit uw team."
            })
            .addUserOption(option => option
                .setName('target')
                .setNameLocalizations({
                    nl: "gebruiker"
                })
                .setDescription('The target member.')
                .setDescriptionLocalizations({
                    nl: "De betreffende gebruiker."
                })
                .setRequired(true)))
        .addSubcommand(option => option
            .setName('overview')
            .setNameLocalizations({
                nl: "overzicht"
            })
            .setDescription("See an overview of members and current plan.")
            .setDescriptionLocalizations({
                nl: "Bekijk een overzicht aan leden en uw actieve abonnement."
            })),
    async execute(interaction) {
        try {
            // Permission Validation
            const operatorData = await userUtils.checkOperator(interaction.user.id, interaction.guild, interaction);
            if (!operatorData.hasPermissions) return;

            // Setup
            const actionType = interaction.options.getSubcommand();
            const targetMember = interaction.options.getUser("target");
            if (targetMember && targetMember.id === interaction.user.id) return interaction.reply({
                content: `You cannot ${actionType} yourself ${actionType === "add" ? "to" : "from"} a team that you are already a member of via commands. To transfer ownership and use other advanced operations, please use the [Bot Commander](${config.urls.botCommanderWebsite}) application.`,
                ephemeral: true
            });

            if (actionType === "add") {
                if (!operatorData.data.team_owner) return interaction.reply({
                    content: `Only the team owner can invite and remove Operators. Please contact them if you would like to have a new team member added.`,
                    ephemeral: true
                });
                modules.database.query("SELECT COUNT(operator_member.id) AS operator_count, edition, (SELECT GROUP_CONCAT(snowflake SEPARATOR ',') FROM operator_member WHERE team_tag = ?) AS operator_list FROM operator_member LEFT JOIN operator_team ON operator_team.team_tag = operator_member.team_tag WHERE operator_member.team_tag = ?;", [operatorData.data.team_tag, operatorData.data.team_tag])
                    .then(async (data) => {
                        // Capacity Validation
                        const editionObject = editionUtils.getStatitistics(data[0].edition);
                        if (parseInt(data[0].operator_count) + 1 > editionObject.seats) return interaction.reply({
                            content: `Your current plan (\`${data[0].edition}\`) does not support any new seats. Upgrade your plan or contact <@${config.general.authorSnowflake}> for a custom solution.`,
                            ephemeral: true
                        });

                        // Presence Validation
                        const operatorList = data[0].operator_list.split(',');
                        if (operatorList.includes(targetMember.id)) return interaction.reply({
                            content: `Member <@${targetMember.id}> is already in your team. They might also be unverified or pending. Please try another user.`,
                            ephemeral: true
                        });

                        // User Type Validation
                        if (targetMember.bot) return interaction.reply({
                            content: `You cannot add bots like myself to your team. Please try another user.`,
                            ephemeral: true
                        });

                        // Finalize
                        const registerLink = `https://github.com/SVKruik-Organization/Discord-Bots`; // WIP - https://github.com/SVKruik-Organization/Discord-Bots/issues/69
                        const embed = new EmbedBuilder()
                            .setColor(config.general.color)
                            .setTitle("Operator Overview")
                            .setDescription(`Hello <@${targetMember.id}>! <@${interaction.user.id}> has invited **you** to join his Operator team.`)
                            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
                            .addFields(
                                { name: "Instructions", value: "-----" },
                                { name: 'Accept', value: `If you decide to join them, you can click on the link down below. It will direct you to my website, where you can finalize your registration.` },
                                { name: 'Decline', value: `If you do not want to join their team, please send me \`decline\`, and I will remove your record & notify <@${interaction.user.id}>.` },
                                { name: 'Safety', value: `If I have spammed you with invites and/or you do not know about any of this, please contact <@${config.general.authorSnowflake}> to get this fixed!` })
                            .setTimestamp()
                            .setFooter({ text: `Embed created by ${config.general.name}` });
                        targetMember.send({ embeds: [embed] })
                            .then(() => {
                                logger.log(`User '${interaction.user.username}'@'${interaction.user.id}' has invited '${targetMember.username}'@'${targetMember.id}' to join their Operator team in Guild '${interaction.guild.name}'@'${interaction.guild.id}'. Instructions sent directly.`, "info");
                                return interaction.reply({
                                    content: `So far so good! I need some additional information like email and password from <@${targetMember.id}>, so I DM'd them with futher instructions. I will send you a notification (if you have allowed this) when this user has accepted or declined your invite. That's all for now!`,
                                    ephemeral: true
                                });
                            }).catch(() => {
                                logger.log(`User '${interaction.user.username}'@'${interaction.user.id}' has invited '${targetMember.username}'@'${targetMember.id}' to join their Operator team in Guild '${interaction.guild.name}'@'${interaction.guild.id}'. Instructions must be send by the inviter.`, "info");
                                return interaction.reply({
                                    content: `All checks passed, but I couldn't reach your soon-to-be teammate. They might have DM's from applications like myself disabled. Can you please them this link instead?\n\n\`${registerLink}\``,
                                    ephemeral: true
                                });
                            });
                    }).catch((error) => {
                        logger.error(error);
                        return interaction.reply({
                            content: "Something went wrong while retrieving your information. Please try again later.",
                            ephemeral: true
                        });
                    });
            } else if (actionType === "remove") {
                if (!operatorData.data.team_owner) return interaction.reply({
                    content: `Only the team owner can invite and remove Operators. Please contact them if you would like to have a new team member removed.`,
                    ephemeral: true
                });
                modules.database.query("DELETE FROM operator_member WHERE snowflake = ? AND team_tag = ?; SELECT COUNT(operator_member.id) AS operator_count, edition FROM operator_member LEFT JOIN operator_team ON operator_team.team_tag = operator_member.team_tag WHERE operator_member.team_tag = ?;", [targetMember.id, operatorData.data.team_tag, operatorData.data.team_tag])
                    .then((data) => {
                        const responseData = data[1][0];
                        const editionData = editionUtils.getStatitistics(responseData.edition);
                        logger.log(`User '${interaction.user.username}'@'${interaction.user.id}' has removed '${targetMember.username}'@'${targetMember.id}' from their Operator team in Guild '${interaction.guild.name}'@'${interaction.guild.id}'.`, "info");
                        return interaction.reply({
                            content: `Successfully removed <@${targetMember.id}> from your Operator team. This also cancelled any ongoing verification processes and pending invites. You now have \`${editionData.seats - parseInt(responseData.operator_count)}\` available seats.`,
                            ephemeral: true
                        });
                    }).catch((error) => {
                        logger.error(error);
                        return interaction.reply({
                            content: "Something went wrong while removing this user. Please try again later.",
                            ephemeral: true
                        });
                    });
            } else if (actionType === "overview") {
                modules.database.query("SELECT operator_member.*, edition, (SELECT COUNT(*) FROM guild WHERE team_tag = ?) as server_count FROM operator_member LEFT JOIN operator_team ON operator_team.team_tag = operator_member.team_tag WHERE operator_member.team_tag = ?;", [operatorData.data.team_tag, operatorData.data.team_tag])
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
                                { name: 'Note', value: `Changing your subscription details and advanced settings can be done with the [Bot Commander](${config.urls.botCommanderWebsite}) application. If you have any questions or concerns, don't hesitate to reach out to <@${config.general.authorSnowflake}>.` })
                            .setTimestamp()
                            .setFooter({ text: `Embed created by ${config.general.name}` });
                        return interaction.reply({
                            embeds: [embed],
                            ephemeral: true
                        });
                    }).catch((error) => {
                        logger.error(error);
                        return interaction.reply({
                            content: "Something went wrong while retrieving your information. Please try again later.",
                            ephemeral: true
                        });
                    });
            }
        } catch (error) {
            logger.error(error);
        }
    },
    guildSpecific: true
};
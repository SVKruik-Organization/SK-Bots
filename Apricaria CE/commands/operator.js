const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const userUtils = require('../utils/user.js');
const logger = require('../utils/logger.js');
const modules = require('..');

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
        .setDMPermission(false)
        .addSubcommand(option => option
            .setName('modify')
            .setNameLocalizations({
                nl: "modificeren"
            })
            .setDescription("Add or remove Operators from your team(s).")
            .setDescriptionLocalizations({
                nl: "Operators toevoegen aan of verwijderen uit uw team(s)."
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
            const operatorData = await userUtils.checkOperator(interaction);
            if (!operatorData.hasPermissions) return;

            // Setup
            const actionType = interaction.options.getSubcommand();
            const targetMember = interaction.options.getUser("target");
            if (targetMember && targetMember.id === interaction.user.id) return interaction.reply({
                content: `You cannot ${actionType} yourself ${actionType === "add" ? "to" : "from"} a team that you are already a member of via commands. To transfer ownership and use other advanced operations, please use the [SK Commander](${config.urls.skCommander}) application or the [website](${config.urls.website}).`,
                ephemeral: true
            });

            modules.database.query("SELECT et.team_tag, et.edition, username FROM operator_team et LEFT JOIN operator_member em ON et.team_tag = em.team_tag LEFT JOIN operator_member em2 ON em.team_tag = em2.team_tag LEFT JOIN operator ON em2.snowflake = operator.snowflake WHERE em.snowflake = ? AND em2.team_owner = 1;", interaction.user.id)
                .then(async (data) => {
                    if (!data.length) return interaction.reply({
                        content: `You are not in any teams right now. You can join a team when you get invited, or create a new one yourself on the [website](${config.urls.website}).`,
                        ephemeral: true
                    });

                    const stringOptions = [];
                    for (let i = 0; i < data.length; i++) {
                        stringOptions.push(new StringSelectMenuOptionBuilder()
                            .setLabel(`Team ${data[i].team_tag}`)
                            .setDescription(`Edition: ${data[i].edition}, Owner: ${data[i].username}`)
                            .setValue(`operatorTeamSelect-${data[i].team_tag}-${actionType}-${targetMember ? targetMember.id : null}`));
                    }

                    const select = new StringSelectMenuBuilder()
                        .setCustomId('operatorSelectMenu')
                        .setPlaceholder('Make a selection.')
                        .addOptions(stringOptions);

                    const replyContent = (actionType === "overview" ? "Select which team you want to view the overview of." : `Select for which team you want to manage <@${targetMember.id}>.`);
                    await interaction.deferReply({ ephemeral: true });
                    await interaction.editReply({
                        content: `${replyContent} Note that you have to be the owner of the team in order to perform this action.`,
                        components: [new ActionRowBuilder().addComponents(select)],
                        ephemeral: true
                    });
                }).catch((error) => {
                    logger.error(error);
                    return interaction.reply({
                        content: "Something went wrong while retrieving your teams. Please try again later.",
                        ephemeral: true
                    });
                })
        } catch (error) {
            logger.error(error);
        }
    }
};
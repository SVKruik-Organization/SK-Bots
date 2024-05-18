const { SlashCommandBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const dateUtils = require('../utils/date.js');
const embedConstructor = require('../utils/embed.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setNameLocalizations({
            nl: "inventaris"
        })
        .setDescription('Check your inventory & active XP-Boosters.')
        .setDescriptionLocalizations({
            nl: "Bekijk je inventaris & actieve XP-Boosters."
        })
        .addSubcommand(option => option
            .setName('activate')
            .setNameLocalizations({
                nl: "activeren"
            })
            .setDescription("Activate a XP-Booster.")
            .setDescriptionLocalizations({
                nl: "Activeer een XP-Booster."
            }))
        .addSubcommand(option => option
            .setName('disable')
            .setNameLocalizations({
                nl: "deactiveren"
            })
            .setDescription("Disable the currently activated XP-Booster. You will not get refunded.")
            .setDescriptionLocalizations({
                nl: "Deactiveer een actieve XP-Booster. U zult geen terugbetaling ontvangen."
            }))
        .addSubcommand(option => option
            .setName('overview')
            .setNameLocalizations({
                nl: "overzicht"
            })
            .setDescription("Check your resources.")
            .setDescriptionLocalizations({
                nl: "Bekijk uw grondstoffen."
            })),
    async execute(interaction) {
        try {
            const actionType = interaction.options.getSubcommand();

            if (actionType === "activate") {
                modules.database.query('SELECT xp15, xp50, xp_active, xp_active_expiry as expiry FROM user_inventory WHERE snowflake = ?', [interaction.user.id])
                    .then(async (data) => {
                        if (data.length === 0) {
                            return interaction.reply({
                                content: "You do not have an account yet. Create an account with the `/register` command.",
                                ephemeral: true
                            });
                        } else if (data[0].xp_active !== "None") {
                            const dateDifference = dateUtils.difference(data[0].expiry, dateUtils.getDate(null, null).today);
                            return interaction.reply({
                                content: `You have already activated a XP-Booster (\`${data[0].xp_active}\`), and it expires in approximately \`${dateDifference.remainingHours}\` hours and \`${dateDifference.remainingMinutes}\` minutes.`,
                                ephemeral: true
                            });
                        }
                        const select = new StringSelectMenuBuilder()
                            .setCustomId('activateBoosterMenu')
                            .setPlaceholder('Make a selection.')
                            .addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('XP +15%')
                                    .setDescription('Activate a 24H 15% XP-Boost on all gained Experience.')
                                    .setValue(`xp15-${data[0].xp15}`),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('XP +50%')
                                    .setDescription('Activate a 24H 50% XP-Boost on all gained Experience.')
                                    .setValue(`xp50-${data[0].xp50}`));

                        await interaction.deferReply({ ephemeral: true });
                        await interaction.editReply({
                            content: 'Choose what XP-Booster to activate.',
                            components: [new ActionRowBuilder().addComponents(select)],
                            ephemeral: true
                        });
                    }).catch((error) => {
                        logger.error(error);
                        return interaction.reply({
                            content: 'Something went wrong while retrieving the required information. Please try again later.',
                            ephemeral: true
                        });
                    });
            } else if (actionType === "disable") {
                modules.database.query('UPDATE user_inventory SET xp_active = "None", xp_active_expiry = NULL WHERE snowflake = ?', [interaction.user.id])
                    .then((data) => {
                        // Validation
                        if (!data.affectedRows) return interaction.reply({
                            content: "You do not have an account yet. Create an account with the `/register` command.",
                            ephemeral: true
                        });

                        return interaction.reply({
                            content: "Successfully removed the active XP-Booster, if there was any. To activate a XP-Booster use the \`/inventory active\` command.",
                            ephemeral: true
                        });
                    }).catch((error) => {
                        logger.error(error);
                        return interaction.reply({
                            content: 'Something went wrong while retrieving the required information. Please try again later.',
                            ephemeral: true
                        });
                    });
            } else if (actionType === "overview") {
                modules.database.query("SELECT * FROM user_inventory WHERE snowflake = ?;", [interaction.user.id])
                    .then((data) => {
                        if (data.length === 0) return interaction.reply({
                            content: "This command requires you to have an account. Create an account with the `/register` command.",
                            ephemeral: true
                        });

                        const embed = embedConstructor.create("Inventory Overview", "Your XP-Boosters and other items.", interaction.user,
                            [
                                { name: 'Role Colors', value: `\`${data[0].role_cosmetic}\`` },
                                { name: 'XP +15%', value: `\`${data[0].xp15}\`` },
                                { name: 'XP +50%', value: `\`${data[0].xp50}\`` }
                            ], ["shop", "economy", "tier"]);
                        interaction.reply({ embeds: [embed], ephemeral: true });
                    }).catch((error) => {
                        logger.error(error);
                        return interaction.reply({
                            content: 'Something went wrong while retrieving the required information. Please try again later.',
                            ephemeral: true
                        });
                    });
            }
        } catch (error) {
            logger.error(error);
        }
    },
    guildSpecific: false
};
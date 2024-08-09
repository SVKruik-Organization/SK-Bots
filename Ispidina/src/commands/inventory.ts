import { SlashCommandBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { cooldowns } from '../config.js';
import { database } from '../index.js';
import { Difference, difference, getDate } from '../utils/date.js';
import { create } from '../utils/embed.js';
import { logError } from '../utils/logger.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setNameLocalizations({
            nl: "inventaris"
        })
        .setDescription('Check your inventory & active XP-Boosters.')
        .setDescriptionLocalizations({
            nl: "Bekijk je inventaris & actieve XP-Boosters."
        })
        .setDMPermission(true)
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
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const actionType: string = interaction.options.getSubcommand();

            if (actionType === "activate") {
                try {
                    const data: Array<{ xp15: number, xp50: number, xp_active: string, xp_active_expiry: Date }> = await database.query("SELECT xp15, xp50, xp_active, xp_active_expiry FROM user_inventory WHERE snowflake = ?", [interaction.user.id]);
                    if (data.length === 0) {
                        return await interaction.reply({
                            content: "You do not have an account yet. Create an account with the `/register` command.",
                            ephemeral: true
                        });
                    } else if (data[0].xp_active !== "None") {
                        const dateDifference: Difference = difference(data[0].xp_active_expiry, getDate(null, null).today);
                        return await interaction.reply({
                            content: `You have already activated a XP-Booster (\`${data[0].xp_active}\`), and it expires in approximately \`${dateDifference.remainingHours}\` hours and \`${dateDifference.remainingMinutes}\` minutes.`,
                            ephemeral: true
                        });
                    }
                    const select: StringSelectMenuBuilder = new StringSelectMenuBuilder()
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
                        components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)]
                    });
                } catch (error: any) {
                    logError(error);
                    return await interaction.reply({
                        content: 'Something went wrong while retrieving the required information. Please try again later.',
                        ephemeral: true
                    });
                }
            } else if (actionType === "disable") {
                try {
                    const data: { affectedRows: number } = await database.query("UPDATE user_inventory SET xp_active = 'None', xp_active_expiry = NULL WHERE snowflake = ?", [interaction.user.id]);
                    // Validation
                    if (!data.affectedRows) return await interaction.reply({
                        content: "You do not have an account yet. Create an account with the `/register` command.",
                        ephemeral: true
                    });

                    return await interaction.reply({
                        content: "Successfully removed the active XP-Booster, if there was any. To activate a XP-Booster use the \`/inventory active\` command.",
                        ephemeral: true
                    });
                } catch (error: any) {
                    logError(error);
                    return await interaction.reply({
                        content: 'Something went wrong while retrieving the required information. Please try again later.',
                        ephemeral: true
                    });
                }
            } else if (actionType === "overview") {
                try {
                    const data: Array<{ role_cosmetic: number, xp15: number, xp50: number }> = await database.query("SELECT role_cosmetic, xp15, xp50 FROM user_inventory WHERE snowflake = ?;", [interaction.user.id]);
                    if (data.length === 0) return await interaction.reply({
                        content: "This command requires you to have an account. Create an account with the `/register` command.",
                        ephemeral: true
                    });

                    const embed: EmbedBuilder = create("Inventory Overview", "Your XP-Boosters and other items.", interaction.user,
                        [
                            { name: 'Role Colors', value: `\`${data[0].role_cosmetic}\``, inline: false },
                            { name: 'XP +15%', value: `\`${data[0].xp15}\``, inline: false },
                            { name: 'XP +50%', value: `\`${data[0].xp50}\``, inline: false }
                        ], ["shop", "economy", "tier"]);
                    return await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error: any) {
                    logError(error);
                    return await interaction.reply({
                        content: 'Something went wrong while retrieving the required information. Please try again later.',
                        ephemeral: true
                    });
                }
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
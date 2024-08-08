import { EmbedBuilder, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { cooldowns, tier } from '../config';
import { database } from '..';
import { create } from '../utils/embed';
import { difference, getDate } from '../utils/date';
import { findGuildById } from '../utils/guild';
import { logError } from '../utils/logger';
import { Command, GuildFull } from "../types";

export default {
    cooldown: cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('tier')
        .setNameLocalizations({
            nl: "tier"
        })
        .setDescription('Information and statistics about your Tier progression.')
        .setDescriptionLocalizations({
            nl: "Informatie en statistieken over uw Tier progressie."
        })
        .setDMPermission(true),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.guild) return;
            const snowflake: string = interaction.user.id;
            const targetGuild: GuildFull | undefined = findGuildById(interaction.guild.id);
            let xpReward: number = tier.slashCommand;
            if (targetGuild && targetGuild.xp_increase_slash) xpReward = targetGuild.xp_increase_slash;

            database.query("SELECT level, xp, xp15, xp50, xp_active, xp_active_expiry FROM tier LEFT JOIN user_inventory ON user_inventory.snowflake = tier.snowflake WHERE tier.snowflake = ?;", [snowflake])
                .then(async (data) => {
                    if (data.length === 0) return await interaction.reply({
                        content: "You do not have an account yet. Create an account with the `/register` command.",
                        ephemeral: true
                    });
                    const currentXp: number = data[0].xp + xpReward;

                    let hoursLeft: string = "";
                    if (data[0].xp_active_expiry) hoursLeft = ` (${difference(data[0].xp_active_expiry, getDate(null, null).today).remainingHours} hours remaining)`;
                    const embed: EmbedBuilder = create("Tier Overview", "Level System Progression", interaction.user,
                        [
                            { name: 'Level', value: `\`${data[0].level}\``, inline: false },
                            { name: 'Experience', value: `\`${currentXp}\``, inline: false },
                            { name: "-----", value: `Summary`, inline: false },
                            { name: 'XP Needed', value: `\`${20 * (data[0].level + 1) + 300 - currentXp}\``, inline: false },
                            { name: 'Active Booster', value: `\`${data[0].xp_active}\`${hoursLeft}`, inline: false },
                            { name: '+15% Boosters', value: `\`${data[0].xp15}\``, inline: false },
                            { name: '+50% Boosters', value: `\`${data[0].xp50}\``, inline: false }
                        ], ["inventory"]);
                    return await interaction.reply({ embeds: [embed], ephemeral: true });
                }).catch(async (error: any) => {
                    logError(error);
                    return await interaction.reply({
                        content: "Something went wrong while retrieving the required information. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
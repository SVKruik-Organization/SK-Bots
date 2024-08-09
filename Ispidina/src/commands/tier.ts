import { EmbedBuilder, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { cooldowns, tier } from '../config.js';
import { database } from '../index.js';
import { create } from '../utils/embed.js';
import { difference, getDate } from '../utils/date.js';
import { findGuildById } from '../utils/guild.js';
import { logError } from '../utils/logger.js';
import { Command, GuildFull } from '../types.js';

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

            try {
                const data: Array<{ level: number, xp: number, xp15: number, xp50: number, xp_active: string, xp_active_expiry: Date }> = await database.query("SELECT level, xp, xp15, xp50, xp_active, xp_active_expiry FROM tier LEFT JOIN user_inventory ON user_inventory.snowflake = tier.snowflake WHERE tier.snowflake = ?;", [snowflake]);
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
            } catch (error: any) {
                logError(error);
                return await interaction.reply({
                    content: "Something went wrong while retrieving the required information. Please try again later.",
                    ephemeral: true
                });
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
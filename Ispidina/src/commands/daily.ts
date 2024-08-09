import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { database } from '../index.js';
import { cooldowns } from '../config.js';
import { logError, logMessage } from '../utils/logger.js';
import { findGuildById } from '../utils/guild.js';
import { dueAdd, dueDates } from '../utils/due.js';
import { Difference, difference, getDate } from '../utils/date.js';
import { Command, DueDate, GuildFull } from '../types.js';

export default {
    cooldown: cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('dailyreward')
        .setNameLocalizations({
            nl: "dagelijksebeloning"
        })
        .setDescription('Collect your daily Bits reward.')
        .setDescriptionLocalizations({
            nl: "Haal uw dagelijkse Bits beloning op."
        })
        .setDMPermission(false),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Cooldown Checking
            if (!interaction.guild) return;
            const dueDate: Array<DueDate> = dueDates.filter(dueDate => dueDate.description === "daily" && dueDate.snowflake === interaction.user.id);
            if (dueDate.length > 0) {
                const dateDifference: Difference = difference(dueDate[0].expiry, getDate(null, null).today);
                return await interaction.reply({
                    content: `I appreciate your enthousiasm, but I am afraid you have already collected your Daily Reward for this day. Come back in approximately \`${dateDifference.remainingHours}\` hours and \`${dateDifference.remainingMinutes}\` minutes.`,
                    ephemeral: true
                });
            }

            // Jackpot Value Determining
            let jackpotValue: number = 10000;
            const targetGuild: GuildFull | undefined = findGuildById(interaction.guild.id);
            if (targetGuild && targetGuild.jackpot) jackpotValue = targetGuild.jackpot;

            // Jackpot Boolean
            let dailyreward: number = Math.floor(Math.random() * (801 - 200) + 200);
            const jackpotBoolean: boolean = Math.floor(Math.random() * (51 - 1) + 1) === 25;
            if (jackpotBoolean) dailyreward += jackpotValue;

            // Process
            try {
                const data: { affectedRows: number } = await database.query("UPDATE economy SET wallet = wallet + ? WHERE snowflake = ?;", [dailyreward, interaction.user.id]);
                if (!data.affectedRows) return await interaction.reply({
                    content: "This command requires you to have an account. Create an account with the `/register` command.",
                    ephemeral: true
                });

                // + 24 Hours
                const newDate: Date = getDate(null, null).today;
                newDate.setDate(newDate.getDate() + 1);
                dueAdd(interaction, "daily", newDate, null);
                if (jackpotBoolean) {
                    await interaction.reply({ content: `💎 You hit the JACKPOT! 💎 You received a grand total of \`${dailyreward}\` Bits. Congratulations! 🎉` });
                    logMessage(`'${interaction.user.username}@${interaction.user.id}' hit the daily reward jackpot worth ${jackpotValue}. Their dailyreward was worth ${dailyreward - jackpotValue}. They received a total of ${dailyreward} Bits.\n`, "warning");
                } else return await interaction.reply({
                    content: `Successfully collected your daily reward: \`${dailyreward}\` Bits. Be sure to come back tomorrow!`,
                    ephemeral: true
                });
            } catch (error: any) {
                logError(error);
                return await interaction.reply({
                    content: "Something went wrong while updating your information. Please try again later.",
                    ephemeral: true
                });
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
import { SlashCommandBuilder } from 'discord.js';
import modules from '..';
import config from '../config';
import logger from '../utils/logger';
import guildUtils from '../utils/guild';
import { dueAdd } from '../utils/due';
import dateUtils from '../utils/date';

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
            const dueDate = dueDates.filter(dueDate =>
                dueDate.description === "daily" && dueDate.snowflake === interaction.user.id);
            if (dueDate.length > 0) {
                const dateDifference = difference(dueDate[0].expiry, getDate(null, null).today);
                return interaction.reply({
                    content: `I appreciate your enthousiasm, but I am afraid you have already collected your Daily Reward for this day. Come back in approximately \`${dateDifference.remainingHours}\` hours and \`${dateDifference.remainingMinutes}\` minutes.`,
                    ephemeral: true
                });
            }

            // Jackpot Value Determining
            let jackpotValue = 10000;
            const targetGuild = findGuildById(interaction.guild.id);
            if (targetGuild && targetGuild.jackpot) jackpotValue = targetGuild.jackpot;

            // Jackpot Boolean
            let dailyreward = Math.floor(Math.random() * (801 - 200) + 200);
            const jackpotBoolean = Math.floor(Math.random() * (51 - 1) + 1) === 25;
            if (jackpotBoolean) dailyreward += jackpotValue;

            // Process
            database.query("UPDATE economy SET wallet = wallet + ? WHERE snowflake = ?;", [dailyreward, interaction.user.id])
                .then(async (data) => {
                    // Validation
                    if (!data.affectedRows) return interaction.reply({
                        content: "This command requires you to have an account. Create an account with the `/register` command.",
                        ephemeral: true
                    });

                    // + 24 Hours
                    const newDate = getDate(null, null).today;
                    newDate.setDate(newDate.getDate() + 1);
                    dueAdd(interaction, "daily", newDate, null);
                    if (jackpotBoolean) {
                        await return interaction.reply({ content: `💎 You hit the JACKPOT! 💎 You received a grand total of \`${dailyreward}\` Bits. Congratulations! 🎉` });
                        logMessage(`'${interaction.user.username}@${interaction.user.id}' hit the daily reward jackpot worth ${jackpotValue}. Their dailyreward was worth ${dailyreward - jackpotValue}. They received a total of ${dailyreward} Bits.\n`, "warning");
                    } else return interaction.reply({
                        content: `Successfully collected your daily reward: \`${dailyreward}\` Bits. Be sure to come back tomorrow!`,
                        ephemeral: true
                    });
                }).catch((error: any) => {
                    logError(error);
                    return interaction.reply({
                        content: "Something went wrong while updating your information. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error: any) {
            logError(error);
        }
    }
};
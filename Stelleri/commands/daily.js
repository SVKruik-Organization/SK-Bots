const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');
const guildUtils = require('../utils/guild.js');
const { dueAdd } = require('../utils/due.js');
const date = require('../utils/date.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('dailyreward')
        .setNameLocalizations({
            nl: "dagelijksebeloning"
        })
        .setDescription('Collect your daily Bits reward.')
        .setDescriptionLocalizations({
            nl: "Haal uw dagelijkse Bits beloning op."
        }),
    async execute(interaction) {
        try {
            // Cooldown Checking
            const dueDate = modules.dueDates.filter(dueDate =>
                dueDate.description === "daily" && dueDate.snowflake === interaction.user.id);
            if (dueDate.length > 0) {
                const dateDifference = date.difference(dueDate[0].expiry, date.getDate(null, null).today);
                return interaction.reply({
                    content: `I appreciate your enthousiasm, but I am afraid you have already collected your Daily Reward for this day. Come back in approximately \`${dateDifference.remainingHours}\` hours and \`${dateDifference.remainingMinutes}\` minutes.`,
                    ephemeral: true
                });
            }

            // Jackpot Value Determining
            let jackpotValue = 10000;
            const targetGuild = guildUtils.findGuildById(interaction.guild.id);
            if (targetGuild && targetGuild.jackpot) jackpotValue = targetGuild.jackpot;

            // Jackpot Boolean
            let dailyreward = Math.floor(Math.random() * (801 - 200) + 200);
            const jackpotBoolean = Math.floor(Math.random() * (51 - 1) + 1) === 25;
            if (jackpotBoolean) dailyreward += jackpotValue;

            // Process
            modules.database.query("UPDATE economy SET wallet = wallet + ? WHERE snowflake = ?;", [dailyreward, interaction.user.id])
                .then((data) => {
                    // Validation
                    if (!data.affectedRows) return interaction.reply({
                        content: "This command requires you to have an account. Create an account with the `/register` command.",
                        ephemeral: true
                    });

                    // + 24 Hours
                    const newDate = new Date();
                    newDate.setDate(newDate.getDate() + 1);
                    dueAdd(interaction.user.id, "daily", newDate, null, interaction.user.username);
                    if (jackpotBoolean) {
                        interaction.reply({ content: `💎 You hit the JACKPOT! 💎 You received a grand total of \`${dailyreward}\` Bits. Congratulations! 🎉` });
                        logger.log(`'${interaction.user.username}@${interaction.user.id}' hit the daily reward jackpot worth ${jackpotValue}. Their dailyreward was worth ${dailyreward - jackpotValue}. They received a total of ${dailyreward} Bits.\n`, "alert");
                    } else interaction.reply({
                        content: `Successfully collected your daily reward: \`${dailyreward}\` Bits. Be sure to come back tomorrow!`,
                        ephemeral: true
                    });
                }).catch((error) => {
                    logger.error(error);
                    return interaction.reply({
                        content: "Something went wrong while updating your information. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error) {
            logger.error(error);
        }
    }
};
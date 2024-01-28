const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');
const guildUtils = require('../utils/guild.js');

module.exports = {
    cooldown: config.cooldowns.E,
    data: new SlashCommandBuilder()
        .setName('dailyreward')
        .setDescription('Collect your daily reward. Can range from 200 to 800 Bits.')
        .addIntegerOption(option => option
            .setName('jackpot')
            .setDescription('There is a 1 in 50 chance you hit the jackpot.')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(50)),
    async execute(interaction) {
        let jackpotValue = 10000;
        const targetGuild = guildUtils.findGuildById(interaction.guild.id);
        if (targetGuild && targetGuild.jackpot) {
            modules.database.query("SELECT jackpot FROM guild_settings WHERE snowflake = ?;", [interaction.guild.id])
                .then((data) => {
                    if (data.length > 0) jackpotValue = data[0].jackpot;
                }).catch(() => {
                    interaction.reply({
                        content: "You do not have an account yet. Create an account with the `/register` command.",
                        ephemeral: true
                    });
                })
        };

        const jackpotInput = interaction.options.getInteger('jackpot');
        let dailyreward = Math.floor(Math.random() * (801 - 200) + 200);
        const jackpotBoolean = Math.floor(Math.random() * (51 - 1) + 1) === jackpotInput;
        if (jackpotBoolean) dailyreward += jackpotValue;

        modules.database.query("UPDATE economy SET wallet = wallet + ? WHERE snowflake = ?;", [dailyreward, interaction.user.id])
            .then(() => {
                if (jackpotBoolean) {
                    interaction.reply(`💎 You hit the JACKPOT! 💎 You received a grand total of \`${dailyreward}\` Bits. Congratulations! 🎉`);
                    logger.log(`'${interaction.user.username}@${interaction.user.id}' hit the daily reward jackpot worth ${jackpotValue}. Their dailyreward was worth ${dailyreward - jackpotValue}. They received a total of ${dailyreward} Bits.\n`, "alert");
                } else interaction.reply(`Successfully collected your daily reward: \`${dailyreward}\` Bits. Be sure to come back tomorrow!`);
            }).catch(() => {
                interaction.reply({
                    content: "You do not have an account yet. Create an account with the `/register` command.",
                    ephemeral: true
                });
            });
    }
};
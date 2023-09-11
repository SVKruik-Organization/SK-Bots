const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const modules = require('..');
const dateInfo = modules.getDate();
const date = dateInfo.date;
const time = dateInfo.time;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dailyreward')
        .setDescription('Collect your daily reward.')
        .addIntegerOption(option => option.setName('jackpot').setDescription('A number between 200 and 1000. There is a 1 in 800 chance you hit the jackpot.').setRequired(false).setMinValue(200).setMaxValue(1000)),
    async execute(interaction) {
        const modules = require('..');
        const username = interaction.user.username;
        const snowflake = interaction.user.id;
        let jackpot = interaction.options.getInteger('jackpot');
        if (jackpot == undefined) {
            jackpot == 199;
        };
        let dailyreward = Math.floor(Math.random() * (1001 - 200) + 200);

        let jackpotValue = undefined;
        let jackpotBoolean = false;
        if (jackpot == dailyreward) {
            jackpotBoolean = true;
            jackpotValue = 10000;
        } else {
            jackpotValue = 0;
        };

        let userId = undefined;
        await modules.database.promise()
            .execute(`SELECT id FROM user WHERE snowflake = ${snowflake};`)
            .then(async ([data]) => {
                userId = data[0].id
            }).catch(() => {
                return interaction.reply({ content: "This command requires you to have an account. Create an account with the `/register` command.", ephemeral: true });
            });

        if (userId == undefined) {
            return;
        };

        await modules.database.promise()
            .execute(`UPDATE economy SET wallet = wallet + ${jackpotValue} + ${dailyreward} WHERE user_id = '${userId}';`)
            .then(async () => {
                await interaction.reply(`Succesfully collected your daily reward: \`${dailyreward}\` Bits. Be sure to come back tomorrow!`);
                if (jackpotBoolean == true) {
                    await interaction.followUp(`💎 You hit the JACKPOT! 💎 You received \`${jackpotValue}\` more Bits. Congratulations! 🎉`);
                    const total = jackpotValue + dailyreward;
                    const data = `${time} [INFO] ${username} hit the daily reward jackpot. He/she received a total of ${total} Bits.\n`
                    console.log(data);
                    fs.appendFile(`./logs/${date}.log`, data, (err) => {
                        if (err) console.log(`${time} [ERROR] Error appending to log file.`);
                    });
                }
            }).catch(() => {
                return interaction.reply({ content: "You do not have an account yet. Create an account with the `/register` command.", ephemeral: true });
            });

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(() => {
                const data = `${time} [WARNING] Command usage increase unsuccessful, ${username} does not have an account yet.\n`;
                console.log(data);
                fs.appendFile(`./logs/${date}.log`, data, (err) => {
                    if (err) console.log(`${time} [ERROR] Error appending to log file.`);
                });
                return;
            });
    },
};
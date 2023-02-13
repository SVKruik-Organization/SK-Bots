const { SlashCommandBuilder } = require('discord.js');
const math = require('mathjs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dailyreward')
        .setDescription('Collect your daily reward.')
        .addIntegerOption(option => option.setName('jackpot').setDescription('A number between 200 and 1000. There is a 1 in 800 chance you hit the jackpot.').setRequired(false).setMinValue(200).setMaxValue(1000)),
    async execute(interaction) {
        const modules = require('..');
        const user = interaction.user;
        const name = user.username;
        const snowflake = user.id;
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
            }).catch(err => {
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
                    console.log(`[INFO] ${name} hit the daily reward jackpot. He/she received a total of ${total} Bits.\n`);
                }
            }).catch(err => {
                return interaction.reply({ content: "You do not have an account yet. Create an account with the `/register` command.", ephemeral: true });
            });

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(err => {
                return console.log("[WARNING] Command usage increase unsuccessful, user does not have an account yet.\n");
            });
    },
};
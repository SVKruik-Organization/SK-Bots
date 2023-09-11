const { SlashCommandBuilder } = require('discord.js');
const math = require('mathjs');
const fs = require("fs");
const modules = require('..');
const dateInfo = modules.getDate();
const date = dateInfo.date;
const time = dateInfo.time;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Evaluate a math expression.')
        .addStringOption(option => option.setName('expression').setDescription('The math expression to be solved. Example: 4 * 4.').setRequired(true)),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const expression = interaction.options.getString('expression');

        try {
            const answer = math.evaluate(expression).toString();
            await interaction.reply(`Expression: \`${expression}\`\n\nResult: \`${answer}\``);
        } catch (err) {
            await interaction.reply({ content: `Invalid expression.`, ephemeral: true });
        };

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
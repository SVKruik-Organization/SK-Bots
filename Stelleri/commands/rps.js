const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const modules = require('..');
const dateInfo = modules.getDate();
const date = dateInfo.date;
const time = dateInfo.time;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play a game of Rock, Paper, Scissors.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('What is your pick?')
                .setRequired(true)
                .addChoices(
                    { name: 'Rock', value: 'Rock' },
                    { name: 'Paper', value: 'Paper' },
                    { name: 'Scissors', value: 'Scissors' }
                )),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const type = interaction.options.getString('type');
        let reply = undefined;

        const choices = ["Rock", "Paper", "Scissors"];
        const random = choices[Math.floor(Math.random() * choices.length)];

        if (type == random) {
            reply = "🌟 - It's a tie!";
        } else if (random == "Rock") {
            if (type == "Scissors") {
                reply = "🪨 - You lose!";
            } else {
                reply = "🪨 - You win!";
            };
        } else if (random == "Paper") {
            if (type == "Rock") {
                reply = "📃 - You lose!";
            } else {
                reply = "📃 - You win!";
            };
        } else if (random == "Scissors") {
            if (type == "Paper") {
                reply = "✂ - You lose!";
            } else {
                reply = "✂ - You win!";
            };
        };

        await interaction.reply(`I chose: ${reply}`);

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
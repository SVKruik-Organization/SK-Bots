const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.B,
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
        const type = interaction.options.getString('type');
        let reply = undefined;

        const choices = ["Rock", "Paper", "Scissors"];
        const random = choices[Math.floor(Math.random() * choices.length)];

        if (type === random) {
            reply = "🌟 - It's a tie!";
        } else if (random === "Rock") {
            if (type === "Scissors") {
                reply = "🪨 - You lose!";
            } else reply = "🪨 - You win!";
        } else if (random === "Paper") {
            if (type === "Rock") {
                reply = "📃 - You lose!";
            } else reply = "📃 - You win!";
        } else if (random === "Scissors") {
            if (type === "Paper") {
                reply = "✂ - You lose!";
            } else reply = "✂ - You win!";
        }

        interaction.reply(`I chose: ${reply}`);
    }
};
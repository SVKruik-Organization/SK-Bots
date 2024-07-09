const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('rps')
        .setNameLocalizations({
            nl: "sps"
        })
        .setDescription('Play a game of rock, paper, scissors!')
        .setDescriptionLocalizations({
            nl: "Speel een spel van Steen, Papier, Schaar!"
        })
        .setDMPermission(true)
        .addStringOption(option => option
            .setName('type')
            .setNameLocalizations({
                nl: "type"
            })
            .setDescription('What is your pick?')
            .setDescriptionLocalizations({
                nl: "Wat is uw keuze?"
            })
            .setRequired(true)
            .addChoices(
                { name: 'Rock', value: 'rock' },
                { name: 'Paper', value: 'paper' },
                { name: 'Scissors', value: 'scissors' }
            )),
    async execute(interaction) {
        try {
            // Setup
            const userChoice = interaction.options.getString('type');
            let reply = "I chose: ";
            const choicesString = ["rock", "paper", "scissors"];
            const choicesEmoji = ["🪨", "📃", "✂️"];
            const botChoice = Math.floor(Math.random() * choicesString.length);

            // Tie
            if (userChoice === choicesString[botChoice]) return interaction.reply({ content: `I chose: ${choicesEmoji[botChoice]} - It's a tie!` });

            // Rock
            if (choicesString[botChoice] === "rock") {
                reply += "🪨 ";
                if (userChoice === "scissors") {
                    reply += "- You lose!";
                } else if (userChoice === "paper") reply += "- You win!";

                // Paper
            } else if (choicesString[botChoice] === "paper") {
                reply += "📃 ";
                if (userChoice === "rock") {
                    reply += "- You lose!";
                } else if (userChoice === "scissors") reply += "- You win!";

                // Scissors
            } else if (choicesString[botChoice] === "scissors") {
                reply += "✂️ ";
                if (userChoice === "paper") {
                    reply += "- You lose!";
                } else if (userChoice === "rock") reply += "- You win!";
            }

            interaction.reply({ content: reply });
        } catch (error) {
            logger.error(error);
        }
    }
};
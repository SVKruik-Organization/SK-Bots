import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { cooldowns } from '../config';
import { logError } from '../utils/logger';
import { Command } from '../types';

export default {
    cooldown: cooldowns.B,
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
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Setup
            const userChoice: string = interaction.options.getString("type") as string;
            let reply: string = "I chose: ";
            const choicesString: Array<string> = ["rock", "paper", "scissors"];
            const choicesEmoji: Array<string> = ["🪨", "📃", "✂️"];
            const botChoice: number = Math.floor(Math.random() * choicesString.length);

            // Tie
            if (userChoice === choicesString[botChoice]) return await interaction.reply({ content: `I chose: ${choicesEmoji[botChoice]} - It's a tie!` });

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

            return await interaction.reply({ content: reply });
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
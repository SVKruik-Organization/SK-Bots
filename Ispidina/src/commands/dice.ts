import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { cooldowns } from '../config.js';
import { logError } from '../utils/logger.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('dice')
        .setNameLocalizations({
            nl: "dobbelsteen"
        })
        .setDescription('Roll the dice!')
        .setDescriptionLocalizations({
            nl: "Gooi de dobbelsteen!"
        })
        .setDMPermission(true),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const { random, round } = await import('mathjs');
            return await interaction.reply({ content: `🎲 ${round(random(1, 7)) + "!"}` });
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
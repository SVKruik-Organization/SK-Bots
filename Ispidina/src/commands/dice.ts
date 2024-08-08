import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { cooldowns } from '../config';
import { logError } from '../utils/logger';
import { Command } from '../types';

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
            return await interaction.reply({ content: `🎲 ${Math.floor(Math.random() * 6) + "!"}` });
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { cooldowns } from '../config.js';
import { logError } from '../utils/logger.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('random')
        .setNameLocalizations({
            nl: "willekeurig"
        })
        .setDescription('Generate a random number.')
        .setDescriptionLocalizations({
            nl: "Genereer een willekeurig nummer."
        })
        .setDMPermission(true)
        .addIntegerOption(option => option
            .setName('maximum')
            .setNameLocalizations({
                nl: "maximum"
            })
            .setDescription('The highest allowed number.')
            .setDescriptionLocalizations({
                nl: "Het hoogste toegestane nummer."
            })
            .setRequired(true)
            .setMinValue(2)),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const bound: number = interaction.options.getInteger("maximum") as number;
            return await interaction.reply({ content: `Random number: \`${Math.floor(Math.random() * bound) + 1}\`.` });
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
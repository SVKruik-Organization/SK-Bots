const { SlashCommandBuilder } = require('discord.js');
const config = require('../config');
const logger = require('../utils/logger');

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
            const list = ["1!", "2!", "3!", "4!", "5!", "6!"];
            const random = list[Math.floor(Math.random() * list.length)];

            return interaction.reply({ content: `🎲 ${random}` });
        } catch (error: any) {
            logError(error);
        }
    }
};
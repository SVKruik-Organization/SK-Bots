const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('dice')
        .setNameLocalizations({
            nl: "dobbelsteen"
        })
        .setDescription('Roll the dice!')
        .setDescriptionLocalizations({
            nl: "Gooi de dobbelsteen!"
        }),
    async execute(interaction) {
        try {
            const list = ["1!", "2!", "3!", "4!", "5!", "6!"];
            const random = list[Math.floor(Math.random() * list.length)];

            interaction.reply({ content: `🎲 ${random}` });
        } catch (error) {
            logger.error(error);
        }
    },
    guildSpecific: false
};
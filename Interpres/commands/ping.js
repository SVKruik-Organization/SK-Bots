const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setNameLocalizations({
            nl: "ping"
        })
        .setDescription(`Test if ${config.general.name} responds.`)
        .setDescriptionLocalizations({
            nl: `Test of ${config.general.name} reageert.`
        }),
    async execute(interaction) {
        try {
            const list = ["Yep!", "Here!", "Ready!", "Awake!", "I'm here!", "Yes!", "Yeah!", "Sure!", "Hello!", "Hey!", "Sup!", "Hello there!", "Oi!"];
            const random = list[Math.floor(Math.random() * list.length)];

            interaction.reply({ content: `👋 ${random}` });
        } catch (error) {
            logger.error(error);
        }
    }
};
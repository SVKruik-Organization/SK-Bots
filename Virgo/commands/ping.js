const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Test if Virgo responds.'),
    async execute(interaction) {
        const list = ["Yep!", "Here!", "Ready!", "Awake!", "I'm here!", "Yes!", "Yeah!", "Sure!", "Hello!", "Hey!", "Sup!", "Hello there!", "Oi!"];
        const random = list[Math.floor(Math.random() * list.length)];

        interaction.reply({ content: `👋 ${random}` });
    }
};
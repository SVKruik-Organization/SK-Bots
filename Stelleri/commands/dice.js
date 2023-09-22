const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll the dice!'),
    async execute(interaction) {
        const list = ["1!", "2!", "3!", "4!", "5!", "6!"];
        const random = list[Math.floor(Math.random() * list.length)];

        interaction.reply(`🎲 ${random}`);
    },
};
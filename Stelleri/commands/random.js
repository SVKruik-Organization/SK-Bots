const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Generate a random number.')
        .addIntegerOption(option => option.setName('maximum').setDescription('Highest number.').setRequired(true).setMinValue(2)),
    async execute(interaction) {
        const bound = interaction.options.getInteger('maximum');
        const random = Math.floor(Math.random() * bound) + 1;

        await interaction.reply(`Random number: \`${random}\`.`);
    }
};
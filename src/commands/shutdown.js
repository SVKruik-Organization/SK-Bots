const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shutdown')
		.setDescription('Turn the bot off.'),
	async execute(interaction) {
		await interaction.reply('Shutting down.');
        process.exit();
	},
};
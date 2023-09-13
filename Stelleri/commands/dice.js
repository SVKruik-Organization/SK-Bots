const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dice')
		.setDescription('Roll the dice!'),
	async execute(interaction) {
		const list = ["1!", "2!", "3!", "4!", "5!", "6!"];
		const random = list[Math.floor(Math.random() * list.length)];

		await interaction.reply(`🎲 ${random}`);
	},
};
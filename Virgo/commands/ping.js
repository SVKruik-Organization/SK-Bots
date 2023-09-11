const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Test if the bot responds.'),
	async execute(interaction) {
		const list = ["Yep!", "Here!", "Ready!", "Awake!", "I'm here!", "Yes!", "Yeah!", "Sure!", "Hello!", "Hey!"];
		const random = list[Math.floor(Math.random() * list.length)];
		await interaction.reply(`👋 ${random}`);
	},
};
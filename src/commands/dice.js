const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dice')
		.setDescription('Roll the dice!'),
	async execute(interaction) {
		const modules = require('..');
		const snowflake = interaction.user.id;
		const list = ["1!", "2!", "3!", "4!", "5!", "6!"];
		const random = list[Math.floor(Math.random() * list.length)];
		
		await interaction.reply(`🎲 ${random}`);

		modules.database.promise()
			.execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
			.catch(err => {
				return console.log("[WARNING] Command usage increase unsuccessful, user does not have an account yet.\n");
			});
	},
};
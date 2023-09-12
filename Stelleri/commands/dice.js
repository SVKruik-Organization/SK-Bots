const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dice')
		.setDescription('Roll the dice!'),
	async execute(interaction) {
		const snowflake = interaction.user.id;
		const username = interaction.user.username;
		const list = ["1!", "2!", "3!", "4!", "5!", "6!"];
		const random = list[Math.floor(Math.random() * list.length)];

		await interaction.reply(`🎲 ${random}`);

		modules.database.promise()
			.execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
			.catch(() => {
				return modules.log(`Command usage increase unsuccessful, ${username} does not have an account yet.`, "warning");
			});
	},
};
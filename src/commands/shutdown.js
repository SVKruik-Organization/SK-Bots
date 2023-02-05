const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shutdown')
		.setDescription('Turn the bot off.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const modules = require('..');
		const snowflake = interaction.user.id;
		await interaction.reply('Logging off. Bye!');

		await modules.database.promise()
			.execute(`UPDATE user commands_used = commands_used + 1 WHERE snowflake = ${snowflake}`)
			.then(async () => {
				process.exit();
			}).catch(err => {
				return console.log("Command usage increase unsuccessful, user do not have an account yet.");
			});
	},
};
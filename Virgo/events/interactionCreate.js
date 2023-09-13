const { Events } = require('discord.js');
const modules = require('..');
const blockedUsers = modules.blockedUsers;

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;
		if (blockedUsers.includes(interaction.user.id)) {
			return await interaction.reply({ content: 'You are not allowed to use my commands. Contact the moderators to appeal if you think this is a mistake.', ephemeral: true });
		};

		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) return modules.log(`No command matching ${interaction.commandName} was found.`, "warning");

		try {
			await command.execute(interaction);
		} catch (error) {
			modules.log(`There was an error while executing || ${interaction.commandName} ||`, "error");
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			console.log(error);
		};

		modules.database.promise()
			.execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${interaction.user.snowflake}';`)
			.catch(() => {
				return log(`Command usage increase unsuccessful, ${interaction.user.username} does not have an account yet.`, "warning");
			});

		modules.log(`${interaction.user.username} used || ${interaction.commandName} ||`, "info");
	}
};
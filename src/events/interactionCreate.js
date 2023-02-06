const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		};

		// Timestamp
		var today = new Date();
		const m = String(today.getMinutes()).padStart(2, '0');
		const hh = String(today.getHours()).padStart(2, '0');
		today = `${hh}:${m}`;

		try {
			console.log(`${today}  ${interaction.user.username} used || ${interaction.commandName} ||`)
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}.`);
			console.error(error);
		};
	},
};
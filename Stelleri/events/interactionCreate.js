const { Events } = require('discord.js');
const fs = require('fs');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			const data = `${time} [WARNING] No command matching ${interaction.commandName} was found.`;
			console.log(data);
			fs.appendFile(`./logs/${date}.log`, data, (err) => {
				if (err) console.log(`${time} [ERROR] Error appending to log file.`);
			});
			return;
		};

		const modules = require('..');
		const dateInfo = modules.getDate();
		const date = dateInfo.date;
		const time = dateInfo.time;

		const data = `${time} [INFO] ${interaction.user.username} used || ${interaction.commandName} ||\n`;
		console.log(data);
		fs.appendFile(`./logs/${date}.log`, data, (err) => {
			if (err) console.log(`${time} [ERROR] Error appending to log file.`);
		});

		console.log("Test B");

	},
};
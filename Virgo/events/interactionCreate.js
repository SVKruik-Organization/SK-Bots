const { Events } = require('discord.js');
const fs = require('fs');
const modules = require('..');
const dateInfo = modules.getDate();
const date = dateInfo.date;
const time = dateInfo.time;

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		};

		const data = `${time} [INFO] ${interaction.user.username} used || ${interaction.commandName} ||`;
		console.log(data);
		fs.appendFile(`./logs/${date}.log`, `${data}\n`, (err) => {
			if (err) console.log("[ERROR] Error appending to log file.");
		});
	},
};
const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const modules = require('..');
const dateInfo = modules.getDate();
const date = dateInfo.date;
const time = dateInfo.time;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Test if the bot responds.'),
	async execute(interaction) {
		const modules = require('..');
		const snowflake = interaction.user.id;
		const username = interaction.user.username;
		const list = ["Yep!", "Here!", "Ready!", "Awake!", "I'm here!", "Yes!", "Yeah!", "Sure!", "Hello!", "Hey!"];
		const random = list[Math.floor(Math.random() * list.length)];

		await interaction.reply(`👋 ${random}`);

		modules.database.promise()
			.execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
			.catch(() => {
				const data = `${time} [WARNING] Command usage increase unsuccessful, ${username} does not have an account yet.\n`;
				console.log(data);
                fs.appendFile(`./logs/${date}.log`, data, (err) => {
					if (err) console.log(`${time} [ERROR] Error appending to log file.`);
				});
				return;
			});
	},
};
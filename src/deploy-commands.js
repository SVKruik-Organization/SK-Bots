const { REST, Routes } = require('discord.js');
const { general } = require('./assets/config.js');
const fs = require('node:fs');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Deploy
(async () => {
	try {
		const data = await rest.put(
			Routes.applicationGuildCommands(general.clientId, general.guildId),
			{ body: commands },
		);
		console.log(`\n	Successfully reloaded ${data.length} commands.\n`);
	} catch (error) {
		console.error(error);
	}
})();
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { general } = require('./assets/config.js');
const fs = require('node:fs');
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
};

// Deploy
(async () => {
	try {
		const data = await rest.put(
			Routes.applicationGuildCommands(general.clientId, general.guildId),
			{ body: commands },
		);
		console.log(`\n[INFO] Successfully reloaded ${data.length} commands.\n`);
	} catch (error) {
		console.error(error);
	};
})();
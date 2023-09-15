require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { general } = require('./assets/config.js');
const fs = require('node:fs');
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
const modules = require('.');

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
};

// Deploy
(async () => {
    try {
        console.log("\n");
        for (let i = 0; i < general.guildId.length; i++) {
            const data = await rest.put(
                Routes.applicationGuildCommands(general.clientId, general.guildId[i]),
                { body: commands },
            );
			modules.log(`Successfully loaded ${data.length} commands for guild ${general.guildId[i]}.`, "info");
        };
        console.log("\n");
    } catch (error) {
        console.error(error);
    };
})();
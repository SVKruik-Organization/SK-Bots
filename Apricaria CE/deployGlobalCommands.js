require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { general } = require('./config.js');
const fs = require('node:fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const logger = require('./utils/logger.js');

const commands = [];
for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    } catch (error) {
        logger.error(error);
    }
}

// Deploy
(async () => {
    try {
        console.log("\n");
        const data = await rest.put(
            Routes.applicationCommands(general.clientId),
            { body: commands })
        console.log(`Successfully loaded ${data.length} global commands.`);
        console.log("\n");
        process.exit(0);
    } catch (error) {
        console.error(error);
    }
})();
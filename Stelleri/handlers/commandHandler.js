const { Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const logger = require('../utils/logger.js');

/**
 * Initialise the Command Handler, and load all the commands.
 * @param {object} client Discord Client Object
 * @returns On error, else nothing.
 */
function init(client) {
    client.commands = new Collection();
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('cooldown' in command && 'data' in command && 'execute' in command && 'guildSpecific' in command) {
            client.commands.set(command.data.name, command);
        } else logger.log(`Updating error at ${filePath}`, "error");
    }
}

module.exports = {
    "init": init
}

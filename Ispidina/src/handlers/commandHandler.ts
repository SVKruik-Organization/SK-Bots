import fs from 'node:fs';
import path from 'node:path';
import { log } from '../utils/logger';
import { Command } from '../types';
import { customClient } from "..";

/**
 * Initialise the Command Handler, and load all the commands.
 * @param client Discord Client Object
 * @returns On error, else nothing.
 */
function initCommandHandler(client: typeof customClient) {
    const commandsPath: string = path.join(__dirname, '../commands');
    const commandFiles: string[] = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath: string = path.join(commandsPath, file);
        const command: Command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else return log(`Error at ${filePath}.`, "error");
    }
}

export { initCommandHandler }

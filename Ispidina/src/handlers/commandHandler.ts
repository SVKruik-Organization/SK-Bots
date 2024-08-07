import fs from 'node:fs';
import path from 'node:path';
import { logMessage } from '../utils/logger';
import { Command } from '../types';
import { customClient } from "..";

/**
 * Initialise the Command Handler, and load all the commands.
 * @param client Discord Client Object
 * @returns On error, else nothing.
 */
export function initCommandHandler(client: typeof customClient): void {
    const commandsPath: string = path.join(__dirname, '../commands');
    const commandFiles: string[] = fs.readdirSync(commandsPath).filter(file => file.endsWith(''));
    for (const file of commandFiles) {
        const filePath: string = path.join(commandsPath, file);
        const command: Command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else return logMessage(`Error at ${filePath}.`, "error");
    }
}

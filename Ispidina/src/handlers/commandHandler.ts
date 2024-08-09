import fs from 'node:fs';
import { CommandWrapper } from '../types.js';
import { customClient } from '../index.js';
import { getDirname } from '../utils/file.js';

/**
 * Initialise the Command Handler, and load all the commands.
 * @param client Discord Client Object
 * @returns On error, else nothing.
 */
export async function initCommandHandler(client: typeof customClient): Promise<void> {
    try {
        const dirName: string = getDirname(import.meta.url);
        const commandFiles: string[] = fs.readdirSync(`${dirName}/../commands`).filter(file => file.endsWith('.js'));
        for (const fileName of commandFiles) {
            const command: CommandWrapper = await import(`${dirName}/../commands/${fileName}`);
            if (!command.default) continue;
            client.commands.set(command.default.data.name, command.default);
        }
    } catch (error: any) {
        console.log(error);
    }
}
import fs from 'node:fs';
import { CommandWrapper } from '../types';
import { customClient } from "..";

/**
 * Initialise the Command Handler, and load all the commands.
 * @param client Discord Client Object
 * @returns On error, else nothing.
 */
export async function initCommandHandler(client: typeof customClient): Promise<void> {
    try {
        const commandFiles: string[] = fs.readdirSync(`${__dirname}/../commands`).filter(file => file.endsWith('.js'));
        for (const fileName of commandFiles) {
            const command: CommandWrapper = require(`${__dirname}/../commands/${fileName}`);
            if (!command.default) continue;
            client.commands.set(command.default.data.name, command.default);
        }
    } catch (error: any) {
        console.log(error);
    }
}
import { Client } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { EventWrapper } from '../types.js';
import { getDirname } from '../utils/file.js';

/**
 * Initialise the Event Handler, and load all the event.
 * @param client Discord Client Object
 * @returns On error, else nothing.
 */
export async function initEventHandler(client: Client): Promise<void> {
    const eventsPath: string = path.join(getDirname(import.meta.url), '../events');
    const eventFiles: string[] = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath: string = path.join(eventsPath, file);
        const event: EventWrapper = await import(filePath);
        if (event.default.once) {
            client.once(event.default.name, (...args) => event.default.execute(...args));
        } else client.on(event.default.name, (...args) => event.default.execute(...args));
    }
}

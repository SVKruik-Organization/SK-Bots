import { Client } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { EventWrapper } from '../types';

/**
 * Initialise the Event Handler, and load all the event.
 * @param client Discord Client Object
 * @returns On error, else nothing.
 */
export function initEventHandler(client: Client): void {
    const eventsPath: string = path.join(__dirname, '../events');
    const eventFiles: string[] = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath: string = path.join(eventsPath, file);
        const event: EventWrapper = require(filePath);
        if (event.default.once) {
            client.once(event.default.name, (...args) => event.default.execute(...args));
        } else client.on(event.default.name, (...args) => event.default.execute(...args));
    }
}

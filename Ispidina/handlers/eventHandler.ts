import { Client } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Initialise the Event Handler, and load all the event.
 * @param client Discord Client Object
 * @returns On error, else nothing.
 */
function initEventHandler(client: Client) {
    const eventsPath: string = path.join(__dirname, '../events');
    const eventFiles: string[] = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

    for (const file of eventFiles) {
        const filePath: string = path.join(eventsPath, file);
        const event: any = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else client.on(event.name, (...args) => event.execute(...args));
    }
}

export { initEventHandler }

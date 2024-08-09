import { Events } from 'discord.js';
import { general } from '../config.js'
import { logMessage } from '../utils/logger.js';
import { getDate } from '../utils/date.js';
import { BotEvent } from '../types.js';

export default {
    name: Events.ClientReady,
    once: true,
    execute() {
        const date = getDate(null, null);
        setTimeout(() => logMessage(`\n\nSession started on ${date.time}, ${date.date}.\n${general.name} is now online!\n\n\t------\n`, "info"), 1000);
    }
} satisfies BotEvent;
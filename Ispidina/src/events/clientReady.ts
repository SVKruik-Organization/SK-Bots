import { Events } from 'discord.js';
import { general } from "../config"
import { logMessage } from '../utils/logger';
import { getDate } from '../utils/date';
import { BotEvent } from '../types';

export default {
    name: Events.ClientReady,
    once: true,
    execute() {
        const date = getDate(null, null);
        setTimeout(() => logMessage(`\n\nSession started on ${date.time}, ${date.date}.\n${general.name} is now online!\n\n\t------\n`, "info"), 1000);
    }
} satisfies BotEvent;
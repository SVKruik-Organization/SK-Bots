import { Events, GuildScheduledEvent } from "discord.js";
import { database } from '../index.js';
import { logError, logMessage } from '../utils/logger.js';
import { BotEvent } from '../types.js';

export default {
    name: Events.GuildScheduledEventDelete,
    once: false,
    async execute(event: GuildScheduledEvent) {
        try {
            await database.query("DELETE FROM event WHERE payload = ?;", event.id);
            logMessage(`Deleted scheduled event '${event.name}'@'${event.id}' for Guild '${event.guildId}'.`, "info");
        } catch (error: any) {
            logError(error);
        }
    }
} satisfies BotEvent;
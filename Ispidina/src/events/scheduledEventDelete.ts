import { Events, GuildScheduledEvent } from "discord.js";
import { database } from '..';
import { logError, logMessage } from '../utils/logger';
import { BotEvent } from '../types';

export default {
    name: Events.GuildScheduledEventDelete,
    once: false,
    async execute(event: GuildScheduledEvent) {
        database.query("DELETE FROM event WHERE payload = ?;", event.id)
            .then(async () => {
                logMessage(`Deleted scheduled event '${event.name}'@'${event.id}' for Guild '${event.guildId}'.`, "info")
            }).catch(async (error) => logError(error));
    }
} satisfies BotEvent;
import { Events, Guild } from 'discord.js';
import { general } from '../config.js';
import { database } from '../index.js';
import { logError, logMessage } from '../utils/logger.js';
import { findUserById } from '../utils/user.js';
import { BotEvent } from '../types.js';

export default {
    name: Events.GuildDelete,
    once: false,
    async execute(guild: Guild) {
        try {
            if (!guild.available) return;
            await database.query("DELETE FROM guild WHERE snowflake = ?; UPDATE bot SET guild_deleted = guild_deleted + 1 WHERE name = ?;", [guild.id, general.name]);
            logMessage(`${general.name} has been removed from Guild: '${guild.name}@${guild.id}'. Successfully purged related data.`, "warning");
            (await findUserById(general.authorId)).send({
                content: `I have been removed from a server: '${guild.name}@${guild.id}'. Purging related data was successful.`
            });
        } catch (error: any) {
            logError(error);
            logMessage(`Purging data for Guild '${guild.name}@${guild.id}' was not successful.`, "warning");
            (await findUserById(general.authorId)).send({
                content: `I have been removed from a server: '${guild.name}@${guild.id}'. Something unfortunately went wrong though, so check the console.`
            });
        }
    }
} satisfies BotEvent;
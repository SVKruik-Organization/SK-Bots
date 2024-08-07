const { Events } = require('discord.js');
const config = require('../config');
const modules = require('..');
const logger = require('../utils/logger');

export default {
    name: Events.GuildDelete,
    execute(guild) {
        try {
            if (guild.available) {
                database.query("DELETE FROM guild WHERE snowflake = ?; UPDATE bot SET guild_deleted = guild_deleted + 1 WHERE name = ?;", [guild.id, general.name])
                    .then(async () => {
                        logMessage(`${general.name} has been removed from Guild: '${guild.name}@${guild.id}'. Successfully purged related data.`, "warning");
                        (await findUserById(general.authorId)).send({
                            content: `I have been removed from a server: '${guild.name}@${guild.id}'. Purging related data was successful.`
                        });
                    }).catch(async (error) => {
                        logError(error);
                        logMessage(`Purging data for Guild '${guild.name}@${guild.id}' was not successful.`, "warning");
                        (await findUserById(general.authorId)).send({
                            content: `I have been removed from a server: '${guild.name}@${guild.id}'. Something unfortunately went wrong though, so check the console.`
                        });
                    });
            }
        } catch (error: any) {
            logError(error);
        }
    }
};
const { Events } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const logger = require('../utils/logger.js');

module.exports = {
    name: Events.GuildDelete,
    execute(guild) {
        try {
            if (guild.available) {
                modules.database.query("DELETE FROM guild WHERE snowflake = ?; UPDATE bot SET guild_deleted = guild_deleted + 1 WHERE name = ?;", [guild.id, config.general.name])
                    .then(async () => {
                        logger.log(`${config.general.name} has been removed from Guild: '${guild.name}@${guild.id}'. Successfully purged related data.`, "warning");
                        (await findUserById(config.general.authorId)).send({
                            content: `I have been removed from a server: '${guild.name}@${guild.id}'. Purging related data was successful.`
                        });
                    }).catch(async (error) => {
                        logger.error(error);
                        logger.log(`Purging data for Guild '${guild.name}@${guild.id}' was not successful.`, "warning");
                        (await findUserById(config.general.authorId)).send({
                            content: `I have been removed from a server: '${guild.name}@${guild.id}'. Something unfortunately went wrong though, so check the console.`
                        });
                    });
            }
        } catch (error) {
            logger.error(error);
        }
    }
};
const { Events } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const logger = require('../utils/logger.js');

module.exports = {
    name: Events.GuildDelete,
    execute(guild) {
        try {
            if (guild.available) {
                modules.database.query("DELETE FROM guild WHERE snowflake = ?;", [guild.id])
                    .then(() => {
                        logger.log(`${config.general.name} has been removed from Guild: '${guild.name}@${guild.id}'. Successfully purged related data.`, "warning");
                    }).catch((error) => {
                        logger.error(error);
                        logger.log(`Purging data for Guild '${guild.name}@${guild.id}' was not successful.`, "warning");
                    });
            }
        } catch (error) {
            logger.error(error);
        }
    }
};
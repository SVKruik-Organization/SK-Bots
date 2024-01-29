const { Events } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');
const modules = require('..');

module.exports = {
    name: Events.GuildCreate,
    execute(guild) {
        try {
            console.log(guild);
            modules.database.query("INSERT INTO guild (snowflake, name) VALUES (?, ?); INSERT INTO guild_settings (snowflake) VALUES (?);", [guild.id, guild.name, guild.id])
                .then(() => {
                    logger.log(`${config.general.name} just joined a new Guild: '${guild.name}@${guild.id}'. Successfully generated data.`, "info");
                }).catch((error) => {
                    if (error.code === "ER_DUP_ENTRY") {
                        logger.log(`Data for Guild '${guild.name}@${guild.id}' was already present.`, "info");
                    } else {
                        console.error(error);
                        logger.log(`Generating data for Guild '${guild.name}@${guild.id}' was not successful.`, "warning");
                    }
                });
        } catch (error) {
            console.error(error);
        }
    }
};
const { Events } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');
const modules = require('..');

module.exports = {
    name: Events.GuildCreate,
    execute(guild) {
        try {
            modules.database.query("INSERT INTO guild (snowflake, name) VALUES (?, ?); INSERT INTO guild_settings (guild_snowflake) VALUES (?);", [guild.id, guild.name, guild.id])
                .then(() => {
                    guild.roles.create({
                        name: `${config.general.name} Administrator`,
                        permissions: [PermissionFlagsBits.ManageGuild],
                    }).then(() => {
                        logger.log(`${config.general.name} just joined a new Guild: '${guild.name}@${guild.id}'. Successfully generated data.`, "info");
                    }).catch((error) => {
                        logger.error(error);
                        logger.log(`Generating administrator role for Guild '${guild.name}@${guild.id}' was not successful.`, "warning");
                    });
                }).catch((error) => {
                    if (error.code === "ER_DUP_ENTRY") {
                        logger.log(`Data for Guild '${guild.name}@${guild.id}' was already present.`, "info");
                    } else {
                        logger.error(error);
                        logger.log(`Generating data for Guild '${guild.name}@${guild.id}' was not successful.`, "warning");
                    }
                });
        } catch (error) {
            logger.error(error);
        }
    }
};
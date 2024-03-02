const { Events, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');
const modules = require('..');
const guildUtils = require('../utils/guild.js');

module.exports = {
    name: Events.GuildCreate,
    execute(guild) {
        try {
            modules.database.query("INSERT INTO guild (snowflake, name) VALUES (?, ?); INSERT INTO guild_settings (guild_snowflake) VALUES (?);", [guild.id, guild.name, guild.id])
                .then(() => logger.log(`${config.general.name} just joined a new Guild: '${guild.name}@${guild.id}'. Successfully generated data.`, "info"))
                .catch((error) => {
                    if (error.code === "ER_DUP_ENTRY") {
                        logger.log(`Data for Guild '${guild.name}@${guild.id}' was already present.`, "info");
                    } else {
                        logger.error(error);
                        logger.log(`Generating data for Guild '${guild.name}@${guild.id}' was not successful.`, "warning");
                    }
                });

            guild.roles.create({
                name: `${config.general.name} Administrator`,
                permissions: [PermissionFlagsBits.ManageGuild]
            })
                .then(() => logger.log(`Successfully generated administrator role for guild '${guild.name}@${guild.id}'.`, "info"))
                .catch((error) => {
                    logger.error(error);
                    logger.log(`Generating administrator role for Guild '${guild.name}@${guild.id}' was not successful.`, "warning");
                });

            guild.roles.create({
                name: config.general.name,
                color: parseInt(config.general.color.substring(1), 16)
            }).then((role) => {
                guild.members.fetch(config.general.clientId).then((user) => {
                    user.roles.add(role);
                    logger.log(`Successfully generated bot color role for guild '${guild.name}@${guild.id}'.`, "info");
                }).catch((error) => {
                    logger.error(error);
                    logger.log(`Assigning bot color role for Guild '${guild.name}@${guild.id}' was not successful.`, "warning");
                });
            }).catch((error) => {
                logger.error(error);
                logger.log(`Generating bot color role for Guild '${guild.name}@${guild.id}' was not successful.`, "warning");
            });

            // Index New Guild
            guildUtils.guilds.push({
                // Guild
                "guildObject": guild,
                "name": guild.name,
                "channel_admin": null,
                "channel_event": null,
                "channel_suggestion": null,
                "channel_snippet": null,
                "channel_broadcast": null,
                "channel_rules": null,
                "role_blinded": null,
                "locale": guild.locale,
                "disabled": false,

                // Settings
                "xp15": 1200,
                "xp50": 3500,
                "level_up_reward_base": 20,
                "role_cosmetic_price": 11000,
                "role_cosmetic_power": 3,
                "role_level_power": 4,
                "role_level_max": 1000,
                "role_level_enable": true,
                "role_level_color": "FFFFFF",
                "jackpot": 10000,
                "welcome": true,
                "xp_increase_normal": 5,
                "xp_increase_slash": 15,
                "xp_increase_purchase": 25
            });
        } catch (error) {
            logger.error(error);
        }
    }
};
const { Events, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');
const modules = require('..');
const guildUtils = require('../utils/guild.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        try {
            const fetchedGuild = await modules.client.guilds.fetch(guild.id);
            if (!fetchedGuild) return logger.log(`Could not fetch guild '${guild.name}'@'${guild.id}'. Aborted integration.`, "info");

            // Administrator Role
            let administratorRole = fetchedGuild.roles.cache.find(role => role.name === `${config.general.name} Administrator`);
            if (!administratorRole) {
                await guild.roles.create({
                    name: `${config.general.name} Administrator`,
                    permissions: [PermissionFlagsBits.ManageGuild],
                    position: fetchedGuild.roles.cache.size + 1
                });
            } else await administratorRole.setPosition(fetchedGuild.roles.cache.size + 1);

            // Bot Color Role
            let botColorRole = fetchedGuild.roles.cache.find(role => role.name === `${config.general.name} Accent`);
            if (!botColorRole) {
                botColorRole = await guild.roles.create({
                    name: `${config.general.name} Accent`,
                    color: parseInt(config.general.color.substring(1), 16),
                    permissions: [],
                    position: fetchedGuild.roles.cache.size + 1
                });
            } else await botColorRole.setPosition(fetchedGuild.roles.cache.size + 1);
            guild.members.fetch(config.general.clientId)
                .then((user) => user.roles.add(botColorRole))
                .catch((error) => {
                    if (error.status !== 403) logger.log(error);
                });

            // Blinded Role Creation
            let blindedRole = fetchedGuild.roles.cache.find(role => role.name === "Blinded");
            if (!blindedRole) blindedRole = await guild.roles.create({
                name: "Blinded",
                color: parseInt("AD1457", 16),
                permissions: [],
                position: 2
            }).catch((error) => logger.error(error));

            // Blinded Channel
            if (!(await guild.channels.fetch()).filter((channel) => channel.name === "blinded")) await fetchedGuild.channels.create({
                name: "blinded",
                type: ChannelType.GuildText
            });

            // Blinded Channel Permissions
            (await guild.channels.fetch()).filter((channel) => channel.type !== ChannelType.GuildCategory).forEach(channel => {
                if (channel.name !== "blinded") {
                    channel.permissionOverwrites.edit(blindedRole, { ViewChannel: false });
                } else channel.permissionOverwrites.edit(blindedRole, { ViewChannel: true });
            });


            // New Data
            modules.database.query("INSERT INTO guild (snowflake, name, role_blinded) VALUES (?, ?, ?); INSERT INTO guild_settings (guild_snowflake) VALUES (?); UPDATE bot SET guild_created = guild_created + 1 WHERE name = ?;", [guild.id, guild.name, blindedRole.id, guild.id, config.general.name])
                .then(() => logger.log(`${config.general.name} just joined a new Guild: '${guild.name}@${guild.id}'. Successfully generated data.`, "info"))
                .catch((error) => {
                    if (error.code === "ER_DUP_ENTRY") {
                        logger.log(`Database data for Guild '${guild.name}@${guild.id}' was already present, but (re)generated roles.`, "info");
                    } else {
                        logger.error(error);
                        logger.log(`Generating data for Guild '${guild.name}@${guild.id}' was not successful.`, "warning");
                    }
                });

            // Index New Guild
            guildUtils.guilds.push({
                // Guild
                "guildObject": guild,
                "team_tag": "AAAAAAAA",
                "name": guild.name,
                "channel_admin": null,
                "channel_event": null,
                "channel_suggestion": null,
                "channel_snippet": null,
                "channel_broadcast": null,
                "channel_rules": null,
                "channel_ticket": null,
                "role_blinded": blindedRole,
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
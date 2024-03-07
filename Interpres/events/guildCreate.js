const { Events, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');
const modules = require('..');

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
        } catch (error) {
            logger.error(error);
        }
    }
};
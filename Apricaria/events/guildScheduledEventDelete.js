const { Events } = require('discord.js');
const modules = require('../index.js');
const logger = require('../utils/logger.js');

module.exports = {
    name: Events.GuildScheduledEventDelete,
    async execute(event) {
        modules.database.query("DELETE FROM event WHERE payload = ?;", event.id)
            .then(() => {
                logger.log(`Deleted scheduled event '${event.name}'@'${event.id}' for Guild '${event.guildId}'.`, "info")
            }).catch((error) => logger.error(error));
    }
};
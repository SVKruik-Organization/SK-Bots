const { Events } = require('discord.js');
const modules = require('../index');
const logger = require('../utils/logger');

export default {
    name: Events.GuildScheduledEventDelete,
    async execute(event) {
        database.query("DELETE FROM event WHERE payload = ?;", event.id)
            .then(() => {
                logMessage(`Deleted scheduled event '${event.name}'@'${event.id}' for Guild '${event.guildId}'.`, "info")
            }).catch((error) => logError(error));
    }
};
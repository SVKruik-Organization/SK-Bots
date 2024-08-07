const { Events } = require('discord.js');
const config = require('../config.js');
const logger = require('../utils/logger.js');
const rawDate = require('../utils/date.js').getDate();

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute() {
        setTimeout(() => logger.log(`\n\nSession started on ${rawDate.time}, ${rawDate.date}.\n${config.general.name} is now online!\n\n\t------\n`, "info"), 1000);
    },
};
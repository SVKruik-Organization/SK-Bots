const { Events } = require('discord.js');
const logger = require('../utils/logger.js');

module.exports = {
    name: Events.MessageReactionRemove,
    execute(event) {
        try {
            console.log(event);
        } catch (error) {
            logger.error(error);
        }
    }
};
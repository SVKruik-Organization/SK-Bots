const { Events } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const xpIncreaseHandler = require('../handlers/xpIncreaseHandler.js');

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        if (message.author.bot) return;
        xpIncreaseHandler.increaseXp(message.author.id, message.author.username, config.tier.normalMessage, false, message.channelId, modules.client);
    }
};
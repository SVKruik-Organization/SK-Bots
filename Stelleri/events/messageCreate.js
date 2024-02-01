const { Events } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const userIncreaseHandler = require('../handlers/userIncreaseHandler.js');

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        if (message.author.bot) return;
        userIncreaseHandler.increaseXp(message.author.id, message.author.username, config.tier.normalMessage, message.channelId, modules.client, message.guild, message.author);
    }
};
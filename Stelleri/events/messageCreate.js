const { Events } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const userIncreaseHandler = require('../handlers/userIncreaseHandler.js');

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        if (message.author.bot) return;
        const targetGuild = guildUtils.findGuildById(message.guild.id);
        let xpReward = config.tier.normalMessage;
        if (targetGuild && targetGuild.xp_increase_normal) xpReward = targetGuild.xp_increase_normal;
        userIncreaseHandler.increaseXp(message.author.id, message.author.username, xpReward, message.channelId, modules.client, message.author, message.guild.id);
    }
};
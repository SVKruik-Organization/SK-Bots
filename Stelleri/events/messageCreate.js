const { Events } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const userIncreaseHandler = require('../handlers/userIncreaseHandler.js');
const guildUtils = require('../utils/guild.js');

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        // Validation
        if (message.author.bot) return;
        if (!message.guildId) return;

        // Guild Message - XP Increase
        const targetGuild = guildUtils.findGuildById(message.guild.id);
        let xpReward = config.tier.normalMessage;
        if (targetGuild && targetGuild.xp_increase_normal) xpReward = targetGuild.xp_increase_normal;
        userIncreaseHandler.increaseXp({
            "user": message.author,
            "client": modules.client,
            "channelId": message.channelId,
            "guild": {
                "id": message.guild.id
            }
        }, xpReward);
    }
};
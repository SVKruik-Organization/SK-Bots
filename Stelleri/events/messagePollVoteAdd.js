const { Events } = require('discord.js');
const logger = require('../utils/logger.js');
const modules = require('..');
const config = require('../config.js');
const guildUtils = require('../utils/guild.js');
const userIncreaseHandler = require('../handlers/userIncreaseHandler.js');

module.exports = {
    name: Events.MessagePollVoteAdd,
    execute(event, user) {
        try {
            const targetGuild = guildUtils.findGuildById(event.message.guildId);
            let xpReward = config.tier.poll;
            if (targetGuild && targetGuild.xp_increase_poll) xpReward = targetGuild.xp_increase_poll;
            userIncreaseHandler.increaseXp({
                "user": user,
                "client": modules.client,
                "channelId": event.message.channelId,
                "guild": {
                    "id": event.message.guildId
                }
            }, xpReward);
            console.log(user.username, xpReward);
        } catch (error) {
            logger.error(error);
        }
    }
};
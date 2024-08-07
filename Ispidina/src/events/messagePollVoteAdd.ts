const { Events } = require('discord.js');
const logger = require('../utils/logger');
const modules = require('..');
const config = require('../config');
const guildUtils = require('../utils/guild');
const userIncreaseHandler = require('../handlers/userIncreaseHandler');

export default {
    name: Events.MessagePollVoteAdd,
    execute(event, user) {
        try {
            const targetGuild = findGuildById(event.message.guildId);
            let xpReward = tier.poll;
            if (targetGuild && targetGuild.xp_increase_poll) xpReward = targetGuild.xp_increase_poll;
            userIncreaseHandler.increaseXp({
                "user": user,
                "client": customClient,
                "channelId": event.message.channelId,
                "guild": {
                    "id": event.message.guildId
                }
            }, xpReward);
            console.log(user.username, xpReward);
        } catch (error: any) {
            logError(error);
        }
    }
};
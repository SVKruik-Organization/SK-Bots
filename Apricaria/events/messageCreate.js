const { Events } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const userIncreaseHandler = require('../handlers/userIncreaseHandler.js');
const guildUtils = require('../utils/guild.js');
const operatorInviteHandler = require('../handlers/operatorInviteHandler.js');

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        if (message.author.bot) return;

        // Guild Message - XP Increase
        if (message.guildId) {
            const targetGuild = guildUtils.findGuildById(message.guild.id);
            let xpReward = config.tier.normalMessage;
            if (targetGuild && targetGuild.xp_increase_normal) xpReward = targetGuild.xp_increase_normal;
            userIncreaseHandler.increaseXp(message.author.id, message.author.username, xpReward, message.channelId, modules.client, message.author, message.guild.id);
        } else {

            // DM Message - Commands
            switch(message.content) {
                case "decline":
                    operatorInviteHandler.handleDeclineCommand(message);
                    break;
                default:
                    message.reply(`Hello there, <@${message.author.id}>! This message is not a valid DM command, or you sent it to the wrong person. Have a nice day 👋✌!`);
                    break;
            }
        }
    }
};
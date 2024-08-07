const { Events } = require('discord.js');
const modules = require('../index');
const config = require('../config');
const userIncreaseHandler = require('../handlers/userIncreaseHandler');
const guildUtils = require('../utils/guild');
const { handleAcknowledge } = require('../handlers/dmCommandHandler');

export default {
    name: Events.MessageCreate,
    execute(message) {
        // Validation
        if (message.author.bot) return;

        // Message inside Server/Guild
        if (message.guildId) {
            const targetGuild = findGuildById(message.guild.id);
            let xpReward = tier.message;
            if (targetGuild && targetGuild.xp_increase_message) xpReward = targetGuild.xp_increase_message;
            userIncreaseHandler.increaseXp({
                "user": message.author,
                "client": customClient,
                "channelId": message.channelId,
                "guild": {
                    "id": message.guild.id
                }
            }, xpReward);

            // Message inside DM
        } else {
            if (message.content.charAt(0) !== "/") return;
            switch (message.content.split(" ")[0]) {
                case "/acknowledge":
                    handleAcknowledge(message);
                    break;
                default:
                    return message.reply({ content: `Hello there <@${message.author.id}>, \`${message.content}\` is not a valid DM command.` });
            }
        }
    }
};
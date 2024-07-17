const { Events } = require('discord.js');
const modules = require('../index.js');
const config = require('../assets/config.js');
const userIncreaseHandler = require('../handlers/userIncreaseHandler.js');
const guildUtils = require('../utils/guild.js');
const { handleAcknowledge } = require('../handlers/dmCommandHandler.js');

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        // Validation
        if (message.author.bot) return;

        // Message inside Server/Guild
        if (message.guildId) {
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
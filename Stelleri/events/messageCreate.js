const { Events } = require('discord.js');
const modules = require('../index.js');
const config = require('../assets/config.js');
const userIncreaseHandler = require('../handlers/userIncreaseHandler.js');
const guildUtils = require('../utils/guild.js');
const fs = require('node:fs');

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
            switch (message.content) {
                case "/acknowledge temperature":
                    const sensorSettings = JSON.parse(fs.readFileSync(__dirname + '/../settings/sensors.json', "utf-8"));
                    sensorSettings.acknowledgeHighTemperature = true;
                    fs.writeFileSync(__dirname + "/../settings/sensors.json", JSON.stringify(sensorSettings, null, 2), "utf-8");
                    break;
                default:
                    break;
            }
        }
    }
};
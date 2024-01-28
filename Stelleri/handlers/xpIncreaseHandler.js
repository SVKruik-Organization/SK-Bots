const modules = require('..');
const logger = require('../utils/logger.js');

/**
 * Increase the XP and Command Usage of a user.
 * @param {string} snowflake User ID of the user.
 * @param {string} username Username of the user.
 * @param {number} amount The amount of XP to add.
 * @param {boolean} commandIncrease If the command usage count should also be increased.
 * @param {string} channelId Channel ID of the channel the message/slash command was sent in.
 * @param {object} client Discord Client Object
 */
function increaseXp(snowflake, username, amount, commandIncrease, channelId, client) {
    // XP-Booster Check
    modules.database.query(`SELECT xp_active FROM user_inventory WHERE snowflake = ?;`, [snowflake])
        .then((data) => {
            let xpMultiplier = 1;
            if (data.length > 0 && data[0].xp_active !== "None") {
                switch (data[0].xp_active) {
                    case "xp15":
                        xpMultiplier = 1.15;
                        break;
                    case "xp50":
                        xpMultiplier = 1.5;
                    default:
                        xpMultiplier = 1;
                }
            }

            // Usage / XP Increase
            const paramaterArray = [Math.round(amount * xpMultiplier), snowflake, snowflake];
            if (commandIncrease) paramaterArray.push(snowflake);
            modules.database.query(`UPDATE tier SET xp = xp + ? WHERE snowflake = ?; SELECT * FROM tier WHERE snowflake = ?; ${commandIncrease ? "UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = ?;" : ""}`, paramaterArray)
                .then((tierData) => {
                    const responseData = tierData[1][0];
                    if (responseData.xp >= (20 * (responseData.level + 1) + 300)) {
                        modules.database.query("UPDATE tier SET level = level + 1, xp = 0 WHERE snowflake = ?;", [snowflake])
                            .then(() => {
                                const newLevel = responseData.level + 1;
                                const channel = client.channels.cache.get(channelId);
                                channel.send({ content: `Nice! <@${snowflake}> just leveled up and reached level ${newLevel}! 🎉` });
                            }).catch(() => {
                                return logger.log(`Level increase unsuccessful, '${username}@${snowflake}' does not have an account yet.`, "warning");
                            });
                    }
                }).catch(() => {
                    return logger.log(`Command usage/XP increase unsuccessful, '${username}@${snowflake}' does not have an account yet.`, "warning");
                });
        }).catch(() => {
            return logger.log(`XP multiplier check unsuccessful, '${username}@${snowflake}' does not have an account yet.`, "warning");
        });
}

module.exports = {
    "increaseXp": increaseXp
}

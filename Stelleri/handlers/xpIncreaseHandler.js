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
    try {
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
                        // Validation
                        if ((tierData[0] && tierData[0].affectedRows === 0) || (tierData[1] && tierData[1].affectedRows === 0)) return interaction.reply({
                            content: "This command requires you to have an account. Create an account with the `/register` command.",
                            ephemeral: true
                        });

                        const responseData = tierData[1][0];
                        if (responseData.xp >= (20 * (responseData.level + 1) + 300)) {
                            modules.database.query("UPDATE tier SET level = level + 1, xp = 0 WHERE snowflake = ?;", [snowflake])
                                .then((data) => {
                                    // Validation
                                    if (!data.affectedRows) return interaction.reply({
                                        content: "This command requires you to have an account. Create an account with the `/register` command.",
                                        ephemeral: true
                                    });

                                    const newLevel = responseData.level + 1;
                                    const channel = client.channels.cache.get(channelId);
                                    if (channel) channel.send({ content: `Nice! <@${snowflake}> just leveled up and reached level ${newLevel}! 🎉` });
                                }).catch((error) => {
                                    console.error(error);
                                    return logger.log(`Something went wrong while trying to update the Command Usage/XP count for user '${username}@${snowflake}'.`, "warning");
                                });
                        }
                    }).catch((error) => {
                        console.error(error);
                        return logger.log(`Something went wrong while trying to update the Command Usage/XP count for user '${username}@${snowflake}'.`, "warning");
                    });
            }).catch((error) => {
                console.error(error);
                return logger.log(`Something went wrong while trying to update the Command Usage/XP count for user '${username}@${snowflake}'.`, "warning");
            });
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    "increaseXp": increaseXp
}

const modules = require('../index.js');
const logger = require('../utils/logger.js');
const config = require('../assets/config.js');

/**
 * Increase the XP of a user.
 * @param {string} snowflake User ID of the user.
 * @param {string} username Username of the user.
 * @param {number} amount The amount of XP to add.
 * @param {string} channelId Channel ID of the channel the message/slash command was sent in.
 * @param {object} client Discord Client Object
 * @param {object} guild Discord Guild Object
 * @param {object} user Discord User Object
 */
function increaseXp(snowflake, username, amount, channelId, client, guild, user) {
    try {
        // XP-Booster Check
        modules.database.query(`SELECT xp_active FROM user_inventory WHERE snowflake = ?;`, [snowflake])
            .then((initData) => {
                let xpMultiplier = 1;
                if (initData.length > 0 && initData[0].xp_active !== "None") {
                    switch (initData[0].xp_active) {
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
                modules.database.query("UPDATE tier SET xp = xp + ? WHERE snowflake = ?; SELECT * FROM tier WHERE snowflake = ?;", [Math.round(amount * xpMultiplier), snowflake, snowflake])
                    .then((tierData) => {
                        // Validation
                        if (tierData[0] && !tierData[0].affectedRows) return;

                        const responseData = tierData[1][0];
                        if (responseData.xp >= (20 * (responseData.level + 1) + 300)) {
                            modules.database.query("UPDATE tier SET level = level + 1, xp = 0 WHERE snowflake = ?; UPDATE economy SET bank = bank + ? WHERE snowflake = ?;", [snowflake, (config.tier.levelUpBits * (responseData.level + 1)), snowflake])
                                .then(async (data) => {
                                    // Validation
                                    if (data[0] && !data[0].affectedRows) return;
                                    if (responseData.level + 1 > 150) return;

                                    // Level Up Message
                                    const newLevel = responseData.level + 1;
                                    const channel = client.channels.cache.get(channelId);
                                    if (channel) channel.send({ content: `Nice! <@${snowflake}> just leveled up and reached level ${newLevel}! 🎉` });

                                    // Role Update
                                    const role = guild.roles.cache.find(role => role.name === `Level ${responseData.level + 1}`);
                                    if (role) {
                                        user.roles.add(role);
                                    } else {
                                        await guild.roles.create({
                                            position: guild.members.cache.size - 2,
                                            name: `Level ${responseData.level + 1}`,
                                            color: parseInt("FF9800", 16)
                                        }).then(async () => {
                                            try {
                                                await guild.members.fetch(snowflake).then(async (user) => {
                                                    const removeRole = await guild.roles.cache.find((role) => role.name === `Level ${responseData.level}`);
                                                    const addRole = await guild.roles.cache.find((role) => role.name === `Level ${responseData.level + 1}`);

                                                    // Update User Roles
                                                    if (user) {
                                                        if (removeRole) user.roles.remove(removeRole);
                                                        if (addRole) user.roles.add(addRole);
                                                    }

                                                    // Delete if no other role owners of previous level.
                                                    if (removeRole && removeRole.members.size > 0) {
                                                        const otherOwners = removeRole.members.filter(guildMember => guildMember.user.id !== snowflake);
                                                        if (otherOwners.size === 0) removeRole.delete().catch(console.error);
                                                    }
                                                });
                                            } catch (error) {
                                                console.error(error);
                                            }
                                        }).catch((error) => {
                                            console.error(error);
                                            return logger.log(`Something went wrong while creating new Level role.`, "warning");
                                        });
                                    }
                                }).catch((error) => {
                                    console.error(error);
                                    return logger.log(`Something went wrong while trying to update the XP count for user '${username}@${snowflake}'.`, "warning");
                                });
                        }
                    }).catch((error) => {
                        console.error(error);
                        return logger.log(`Something went wrong while trying to update the XP count for user '${username}@${snowflake}'.`, "warning");
                    });
            }).catch((error) => {
                console.error(error);
                return logger.log(`Something went wrong while trying to update the XP count for user '${username}@${snowflake}'.`, "warning");
            });
    } catch (error) {
        console.error(error);
    }
}

/**
 * Increase command usage count based in dedicated table.
 * @param {string} snowflake User ID
 * @param {string} commandName Command name, should be the same as table name.
 */
function increaseCommand(snowflake, commandName) {
    const disabledCommands = ["register", "close", "shutdown"];
    if (disabledCommands.includes(commandName)) return;
    modules.database.query(`UPDATE user_commands SET ${commandName} = ${commandName} + 1 WHERE snowflake = ?`, [snowflake])
        .catch(console.error);
}

module.exports = {
    "increaseXp": increaseXp,
    "increaseCommand": increaseCommand
}

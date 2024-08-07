const modules = require('../index.js');
const logger = require('../utils/logger.js');
const guildUtils = require('../utils/guild.js');
const config = require('../config.js');

/**
 * Increase the XP of a user.
 * @param {object} interaction Discord Interaction Object
 * @param {number} amount The amount of XP to add.
 */
function increaseXp(interaction, amount) {
    try {
        // XP-Booster Check
        modules.database.query(`SELECT xp_active FROM user_inventory WHERE snowflake = ?;`, [interaction.user.id])
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
                const targetGuild = guildUtils.findGuildById(interaction.guild.id);
                modules.database.query("UPDATE tier SET xp = xp + ? WHERE snowflake = ?; SELECT * FROM tier WHERE snowflake = ?;", [Math.round(amount * xpMultiplier), interaction.user.id, interaction.user.id])
                    .then((tierData) => {
                        // Validation
                        if (tierData[0] && !tierData[0].affectedRows) return;

                        const responseData = tierData[1][0];
                        if (responseData.xp >= (20 * (responseData.level + 1) + 300)) {
                            const bitsRewardFallback = config.economy.levelUpFallback;
                            modules.database.query("UPDATE tier SET level = level + 1, xp = 0 WHERE snowflake = ?; UPDATE economy SET bank = bank + ? WHERE snowflake = ?;", [interaction.user.id, ((targetGuild ? targetGuild.level_up_reward_base : bitsRewardFallback) * (responseData.level + 1)), interaction.user.id])
                                .then(async (data) => {
                                    // Validation
                                    if (data[0] && !data[0].affectedRows) return;
                                    if (responseData.level + 1 > 150) return;

                                    // Level Up Message
                                    const newLevel = responseData.level + 1;
                                    const channel = interaction.client.channels.cache.get(interaction.channelId);
                                    if (channel) channel.send({ content: `Nice! <@${interaction.user.id}> just leveled up and reached level ${newLevel}! 🎉` });

                                    // Role Update
                                    const guilds = guildUtils.guilds;
                                    guilds.forEach(async (rawGuild) => {
                                        if (newLevel > rawGuild.role_level_max) return;
                                        const guild = rawGuild.guildObject;
                                        const role = guild.roles.cache.find(role => role.name === `Level ${newLevel}`);
                                        if (role) {
                                            interaction.user.roles.add(role);
                                        } else {
                                            await guild.roles.create({
                                                position: guild.members.cache.size - 2,
                                                name: `Level ${newLevel}`,
                                                color: parseInt(rawGuild.role_level_color, 16)
                                            }).then(async () => {
                                                try {
                                                    await guild.members.fetch(interaction.user.id).then(async (user) => {
                                                        const roles = Array.from(user.roles.cache, ([snowflake, value]) => (value));
                                                        for (let i = 0; i <= roles.length; i++) {
                                                            const role = roles[i];
                                                            if (roles.length === i && rawGuild.role_level_enable) {
                                                                const addRole = await guild.roles.cache.find((role) => role.name === `Level ${newLevel}`);
                                                                if (addRole) user.roles.add(addRole);
                                                            } else if (role.name.includes("Level ") && role.name !== `Level ${newLevel}`) {
                                                                user.roles.remove(role);

                                                                // Delete Unused Level Roles
                                                                const otherOwners = role.members.filter(guildMember => guildMember.user.id !== interaction.user.id);
                                                                if (otherOwners.size === 0) await role.delete().catch((error) => {
                                                                    logger.error(error);
                                                                });
                                                            }
                                                        }
                                                    });
                                                } catch (error) {
                                                    logger.error(error);
                                                }
                                            }).catch((error) => {
                                                logger.error(error);
                                                return logger.log(`Something went wrong while creating new Level role.`, "warning");
                                            });
                                        }
                                    });
                                }).catch((error) => {
                                    logger.error(error);
                                    return logger.log(`Something went wrong while trying to update the XP count for user '${interaction.user.username}@${interaction.user.id}'.`, "warning");
                                });
                        }
                    }).catch((error) => {
                        logger.error(error);
                        return logger.log(`Something went wrong while trying to update the XP count for user '${interaction.user.username}@${interaction.user.id}'.`, "warning");
                    });
            }).catch((error) => {
                logger.error(error);
                return logger.log(`Something went wrong while trying to update the XP count for user '${interaction.user.username}@${interaction.user.id}'.`, "warning");
            });
    } catch (error) {
        logger.error(error);
    }
}

/**
 * Increase command usage count based in dedicated table.
 * @param {string} snowflake User ID
 * @param {string} commandName Command name, should be the same as table name.
 */
function increaseCommand(snowflake, commandName) {
    const disabledCommands = ["register", "close", "shutdown", "delete"];
    if (disabledCommands.includes(commandName)) return;
    modules.database.query(`UPDATE user_commands SET ${commandName} = ${commandName} + 1 WHERE snowflake = ?`, [snowflake])
        .catch((error) => {
            logger.error(error);
        });
}

module.exports = {
    "increaseXp": increaseXp,
    "increaseCommand": increaseCommand
}

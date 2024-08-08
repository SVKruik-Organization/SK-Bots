import { Guild, GuildMember, Interaction, Role, TextBasedChannel } from 'discord.js';
import { database } from '..';
import { logError, logMessage } from '../utils/logger';
import { findGuildById, guilds } from '../utils/guild';
import { economy } from '../config';
import { GuildFull } from '../types';

/**
 * Increase the XP of a user.
 * @param interaction Discord Interaction Object
 * @param amount The amount of XP to add.
 */
export function increaseXp(interaction: Interaction, amount: number) {
    try {
        // XP-Booster Check
        database.query(`SELECT xp_active FROM user_inventory WHERE snowflake = ?;`, [interaction.user.id])
            .then(async (initData) => {
                let xpMultiplier: number = 1;
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
                if (!interaction.guild) return;
                const targetGuild: GuildFull | undefined = findGuildById(interaction.guild.id);
                if (!targetGuild) return;
                database.query("UPDATE tier SET xp = xp + ? WHERE snowflake = ?; SELECT * FROM tier WHERE snowflake = ?;", [Math.round(amount * xpMultiplier), interaction.user.id, interaction.user.id])
                    .then(async (tierData) => {
                        // Validation
                        if (tierData[0] && !tierData[0].affectedRows) return;

                        const responseData = tierData[1][0];
                        if (responseData.xp >= (parseInt(targetGuild.xp_formula.split(",")[0]) * (responseData.level + 1) + parseInt(targetGuild.xp_formula.split(",")[1]))) {
                            const bitsRewardFallback: number = economy.levelUpFallback;
                            database.query("UPDATE tier SET level = level + 1, xp = 0 WHERE snowflake = ?; UPDATE economy SET bank = bank + ? WHERE snowflake = ?;", [interaction.user.id, ((targetGuild ? targetGuild.level_up_reward_base : bitsRewardFallback) * (responseData.level + 1)), interaction.user.id])
                                .then(async (data) => {
                                    // Validation
                                    if (data[0] && !data[0].affectedRows) return;

                                    // Level Up Message
                                    const newLevel = responseData.level + 1;
                                    const channel: TextBasedChannel = interaction.client.channels.cache.get(interaction.channelId as string) as TextBasedChannel;
                                    if (channel) channel.send({ content: `Nice! <@${interaction.user.id}> just leveled up and reached level ${newLevel}! 🎉` });

                                    // Role Update
                                    guilds.forEach(async (rawGuild) => {
                                        if (newLevel > rawGuild.role_level_max) return;
                                        const guild: Guild = rawGuild.guild_object;
                                        const role: Role | undefined = guild.roles.cache.find(role => role.name === `Level ${newLevel}`);
                                        const guildMember: GuildMember = await guild.members.fetch(interaction.user.id);
                                        if (role) {
                                            guildMember.roles.add(role);
                                        } else {
                                            await guild.roles.create({
                                                position: guild.members.cache.size - 2,
                                                name: `Level ${newLevel}`,
                                                color: parseInt(rawGuild.role_level_color, 16)
                                            }).then(async () => {
                                                const roles = Array.from(guildMember.roles.cache, ([_snowflake, value]) => (value));
                                                for (let i = 0; i <= roles.length; i++) {
                                                    const role = roles[i];
                                                    if (roles.length === i && rawGuild.role_level_enable) {
                                                        const addRole: Role | undefined = guild.roles.cache.find((role) => role.name === `Level ${newLevel}`);
                                                        if (addRole) guildMember.roles.add(addRole);
                                                    } else if (role.name.includes("Level ") && role.name !== `Level ${newLevel}`) {
                                                        guildMember.roles.remove(role);

                                                        // Delete Unused Level Roles
                                                        const otherOwners = role.members.filter(guildMember => guildMember.user.id !== interaction.user.id);
                                                        if (otherOwners.size === 0) await role.delete().catch(async (error) => {
                                                            logError(error);
                                                        });
                                                    }
                                                }
                                            }).catch(async (error: any) => {
                                                logError(error);
                                                return logMessage(`Something went wrong while creating new Level role.`, "warning");
                                            });
                                        }
                                    });
                                }).catch(async (error: any) => {
                                    logError(error);
                                    return logMessage(`Something went wrong while trying to update the XP count for user '${interaction.user.username}@${interaction.user.id}'.`, "warning");
                                });
                        }
                    }).catch(async (error: any) => {
                        logError(error);
                        return logMessage(`Something went wrong while trying to update the XP count for user '${interaction.user.username}@${interaction.user.id}'.`, "warning");
                    });
            }).catch(async (error: any) => {
                logError(error);
                return logMessage(`Something went wrong while trying to update the XP count for user '${interaction.user.username}@${interaction.user.id}'.`, "warning");
            });
    } catch (error: any) {
        logError(error);
    }
}

/**
 * Increase command usage count based in dedicated table.
 * @param snowflake User ID
 * @param commandName Command name, should be the same as table name.
 */
export function increaseCommand(snowflake: string, commandName: string): void {
    const disabledCommands: Array<string> = ["register", "close", "shutdown", "delete"];
    if (disabledCommands.includes(commandName)) return;
    database.query(`UPDATE user_commands SET ${commandName} = ${commandName} + 1 WHERE snowflake = ?`, [snowflake])
        .catch((error) => {
            logError(error);
        });
}

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const logger = require('../utils/logger.js');
const userUtils = require('../utils/user.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('admin')
        .setNameLocalizations({
            nl: "admin"
        })
        .setDescription('Controls for the Administrator system.')
        .setDescriptionLocalizations({
            nl: "Bediening voor het Administrator systeem."
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(option => option
            .setName('add')
            .setNameLocalizations({
                nl: "toevoegen"
            })
            .setDescription("Add a new Administrator to this server.")
            .setDescriptionLocalizations({
                nl: "Voeg een Administrator toe aan deze server."
            })
            .addUserOption(option => option
                .setName('target')
                .setNameLocalizations({
                    nl: "gebruiker"
                })
                .setDescription('The target member.')
                .setDescriptionLocalizations({
                    nl: "De betreffende gebruiker."
                })
                .setRequired(true)))
        .addSubcommand(option => option
            .setName('remove')
            .setNameLocalizations({
                nl: "verwijderen"
            })
            .setDescription("Remove an Administrator from this server.")
            .setDescriptionLocalizations({
                nl: "Verwijder een Administrator van deze server."
            })
            .addUserOption(option => option
                .setName('target')
                .setNameLocalizations({
                    nl: "gebruiker"
                })
                .setDescription('The target member.')
                .setDescriptionLocalizations({
                    nl: "De betreffende gebruiker."
                })
                .setRequired(true)))
        .addSubcommand(option => option
            .setName('check')
            .setNameLocalizations({
                nl: "controleren"
            })
            .setDescription("Check the current Administrator status.")
            .setDescriptionLocalizations({
                nl: "Controleer de actuele Administrator status."
            })
            .addUserOption(option => option
                .setName('target')
                .setNameLocalizations({
                    nl: "gebruiker"
                })
                .setDescription('The target member.')
                .setDescriptionLocalizations({
                    nl: "De betreffende gebruiker."
                })
                .setRequired(true))),
    async execute(interaction) {
        try {
            // Permission Validation
            if (!(await userUtils.checkAdmin(interaction.user.id, interaction.guild))) return interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Please try again later, or contact moderation to receive elevated permissions.`,
                ephemeral: true
            });

            // Setup
            const targetUser = interaction.options.getUser('target');
            const actionType = interaction.options.getSubcommand();

            // Admin Role
            let adminRole = interaction.guild.roles.cache.find(role => role.name === `${config.general.name} Administrator`);
            if (!adminRole) {
                const newRole = await interaction.guild.roles.create({
                    name: `${config.general.name} Administrator`,
                    permissions: [PermissionFlagsBits.ManageGuild],
                }).catch((error) => {
                    logger.error(error);
                    return interaction.reply({
                        content: `Something went wrong while creating the Administrator role. Please try again later.`,
                        ephemeral: true
                    });
                });
                adminRole = newRole;
            }

            // Target User Fetch
            let fetchedTargetUser;
            if (actionType === "add" || actionType === "remove") {
                interaction.guild.members.fetch(targetUser.id).then((user) => {
                    if (!user) return interaction.reply({
                        content: "Something went wrong retrieving the required information. Please try again later.",
                        ephemeral: true
                    });
                    fetchedTargetUser = user;
                });
            }

            // Handle
            if (actionType === "add") {
                modules.database.query("INSERT INTO user_administrator (user_snowflake, user_username, guild_snowflake) VALUES (?, ?, ?);", [targetUser.id, targetUser.username, interaction.guild.id])
                    .then(() => {
                        fetchedTargetUser.roles.add(adminRole);
                        logger.log(`${targetUser.username} has been granted Administrator privileges by '${interaction.user.username}@${interaction.user.id}' in server '${interaction.guild.name}@${interaction.guild.id}'.`, "warning");
                        return interaction.reply({
                            content: `Successfully added user <@${targetUser.id}> to the Administrators of this server. They can now use commands that require elevated permissions.`,
                            ephemeral: true
                        });
                    }).catch((error) => {
                        if (error.code === "ER_DUP_ENTRY") {
                            return interaction.reply({
                                content: `User <@${targetUser.id}> is an Administrator already.`,
                                ephemeral: true
                            });
                        } else {
                            logger.error(error);
                            return interaction.reply({
                                content: "Something went wrong while giving this user elevated permissions. Please try again later.",
                                ephemeral: true
                            });
                        }
                    });
            } else if (actionType === "remove") {
                modules.database.query("DELETE FROM user_administrator WHERE user_snowflake = ? AND guild_snowflake = ?;", [targetUser.id, interaction.guild.id])
                    .then(() => {
                        logger.log(`${targetUser.username}'s Administrator privileges were removed by '${interaction.user.username}@${interaction.user.id}' in server '${interaction.guild.name}@${interaction.guild.id}'.`, "warning");
                        fetchedTargetUser.roles.remove(adminRole);
                        return interaction.reply({
                            content: `Successfully removed user <@${targetUser.id}> from the Administrators of this server. They can no longer use commands that require elevated permissions.`,
                            ephemeral: true
                        });
                    }).catch((error) => {
                        logger.error(error);
                        return interaction.reply({
                            content: "Something went wrong while removing elevated permissions of this user. Please try again later.",
                            ephemeral: true
                        });
                    });
            } else if (actionType === "check") {
                modules.database.query("SELECT user_snowflake FROM user_administrator WHERE user_snowflake = ?;", [targetUser.id])
                    .then((data) => {
                        return interaction.reply({
                            content: `Administrator status of user <@${targetUser.id}>: \`${data.length === 0 ? "false" : "true"}\``,
                            ephemeral: true
                        });
                    }).catch((error) => {
                        logger.error(error);
                        return interaction.reply({
                            content: "Something went wrong while checking the Administrator status of this user. Please try again later.",
                            ephemeral: true
                        });
                    });
            }
        } catch (error) {
            logger.error(error);
        }
    }
};
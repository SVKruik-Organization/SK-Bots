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
        .setDescription('Add a super user for use of admin commands.')
        .setDescriptionLocalizations({
            nl: "Voeg een administrator toe voor het gebruik van commando's met verhoogde rechten."
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addUserOption(option => option
            .setName('target')
            .setNameLocalizations({
                nl: "gebruiker"
            })
            .setDescription('The target member.')
            .setDescriptionLocalizations({
                nl: "De betreffende gebruiker."
            })
            .setRequired(true))
        .addStringOption(option => option
            .setName('action')
            .setNameLocalizations({
                nl: "actie"
            })
            .setDescription('Whether you want to modify or check the user status.')
            .setDescriptionLocalizations({
                nl: "Of u de gebruiker status wilt wijzigen of bekijken."
            })
            .setRequired(true)
            .addChoices(
                { name: 'Add', value: 'add' },
                { name: 'Remove', value: 'remove' },
                { name: 'Check', value: 'check' }
            )),
    async execute(interaction) {
        try {
            // Permission Validation
            if (!(await userUtils.checkAdmin(interaction.user.id, interaction.guild))) return interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Please try again later, or contact moderation to receive elevated permissions.`,
                ephemeral: true
            });

            // Setup
            const targetUser = interaction.options.getUser('target');
            const actionType = interaction.options.getString('action');

            // Admin Role
            let adminRole = interaction.guild.roles.cache.find(role => role.name === `${config.general.name} Administrator`);
            if (!adminRole) {
                const newRole = await interaction.guild.roles.create({
                    name: `${config.general.name} Administrator`,
                    permissions: [PermissionFlagsBits.ManageGuild],
                }).catch(() => {
                    return interaction.reply({
                        content: `Something went wrong while creating the administrator role. Please try again later.`,
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
                        logger.log(`${targetUser.username} has been granted administrator privileges by '${interaction.user.username}@${interaction.user.id}' in server '${interaction.guild.name}@${interaction.guild.id}'.`, "warning");
                        return interaction.reply({
                            content: `Successfully added user <@${targetUser.id}> to the administrators of this server. They can now use commands that require elevated permissions.`,
                            ephemeral: true
                        });
                    }).catch(() => {
                        if (error.code === "ER_DUP_ENTRY") {
                            return interaction.reply({
                                content: `User <@${targetUser.id}> is an administrator already.`,
                                ephemeral: true
                            });
                        } else return interaction.reply({
                            content: "Something went wrong while giving this user elevated permissions. Please try again later.",
                            ephemeral: true
                        });
                    });
            } else if (actionType === "remove") {
                modules.database.query("DELETE FROM user_administrator WHERE user_snowflake = ? AND guild_snowflake = ?;", [targetUser.id, interaction.guild.id])
                    .then(() => {
                        logger.log(`${targetUser.username}'s administrator privileges were removed by '${interaction.user.username}@${interaction.user.id}' in server '${interaction.guild.name}@${interaction.guild.id}'.`, "warning");
                        fetchedTargetUser.roles.remove(adminRole);
                        return interaction.reply({
                            content: `Successfully removed user <@${targetUser.id}> from the administrators of this server. They can no longer use commands that require elevated permissions.`,
                            ephemeral: true
                        });
                    }).catch(() => {
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
                    }).catch(() => {
                        return interaction.reply({
                            content: "Something went wrong while checking the administrator status of this user. Please try again later.",
                            ephemeral: true
                        });
                    });
            }
        } catch (error) {
            logger.error(error);
        }
    }
};
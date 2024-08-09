import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, Role, GuildMember } from 'discord.js';
import { cooldowns, general } from '../config.js';
import { database } from '../index.js';
import { logMessage, logError } from '../utils/logger.js';
import { checkAdmin } from '../utils/user.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('admin')
        .setNameLocalizations({
            nl: "admin"
        })
        .setDescription('Controls for the Administrator system.')
        .setDescriptionLocalizations({
            nl: "Bediening voor het Administrator systeem."
        })
        .setDMPermission(false)
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
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Permission Validation
            if (!interaction.guild) return;
            if (!(await checkAdmin(interaction))) return await interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Please try again later, or contact moderation to receive elevated permissions.`,
                ephemeral: true
            });

            // Setup
            const guildMember: GuildMember = await interaction.guild.members.fetch(interaction.options.getUser("target", true).id);
            const actionType: string = interaction.options.getSubcommand();

            // Admin Role
            let adminRole: Role | undefined = interaction.guild.roles.cache.find(role => role.name === `${general.name} Administrator`);
            if (!adminRole) {
                try {
                    adminRole = await interaction.guild.roles.create({
                        name: `${general.name} Administrator`,
                        permissions: [PermissionFlagsBits.ManageGuild],
                    });
                } catch (error: any) {
                    logError(error);
                    return await interaction.reply({
                        content: `Something went wrong while creating the Administrator role. Please try again later.`,
                        ephemeral: true
                    });
                }
            }

            // Handle
            if (actionType === "add") {
                try {
                    await database.query("INSERT INTO user_administrator (user_snowflake, user_username, guild_snowflake) VALUES (?, ?, ?);", [guildMember.id, guildMember.user.username, interaction.guild.id]);
                    guildMember.roles.add(adminRole);
                    logMessage(`${guildMember.user.username} has been granted Administrator privileges by '${interaction.user.username}@${interaction.user.id}' in server '${interaction.guild.name}@${interaction.guild.id}'.`, "info");
                    return await interaction.reply({
                        content: `Successfully added user <@${guildMember.id}> to the Administrators of this server. They can now use commands that require elevated permissions.`,
                        ephemeral: true
                    });
                } catch (error: any) {
                    if (error.code === "ER_DUP_ENTRY") {
                        return await interaction.reply({
                            content: `User <@${guildMember.id}> is an Administrator already.`,
                            ephemeral: true
                        });
                    } else {
                        logError(error);
                        return await interaction.reply({
                            content: "Something went wrong while giving this user elevated permissions. Please try again later.",
                            ephemeral: true
                        });
                    }
                }
            } else if (actionType === "remove") {
                try {
                    await database.query("DELETE FROM user_administrator WHERE user_snowflake = ? AND guild_snowflake = ?;", [guildMember.id, interaction.guild.id]);
                    logMessage(`${guildMember.user.username}'s Administrator privileges were removed by '${interaction.user.username}@${interaction.user.id}' in server '${interaction.guild.name}@${interaction.guild.id}'.`, "info");
                    guildMember.roles.remove(adminRole);
                    return await interaction.reply({
                        content: `Successfully removed user <@${guildMember.id}> from the Administrators of this server. They can no longer use commands that require elevated permissions.`,
                        ephemeral: true
                    });
                } catch (error: any) {
                    logError(error);
                    return await interaction.reply({
                        content: "Something went wrong while removing elevated permissions of this user. Please try again later.",
                        ephemeral: true
                    });
                }
            } else if (actionType === "check") {
                try {
                    const data: Array<{ user_snowflake: string }> = await database.query("SELECT user_snowflake FROM user_administrator WHERE user_snowflake = ?;", [guildMember.id]);
                    return await interaction.reply({
                        content: `Administrator status of user <@${guildMember.id}>: \`${data.length === 0 ? "false" : "true"}\``,
                        ephemeral: true
                    });
                } catch (error: any) {
                    logError(error);
                    return await interaction.reply({
                        content: "Something went wrong while checking the Administrator status of this user. Please try again later.",
                        ephemeral: true
                    });
                }
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
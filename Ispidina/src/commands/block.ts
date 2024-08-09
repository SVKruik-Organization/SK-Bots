import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { cooldowns, general } from '../config.js';
import { logError, logMessage } from '../utils/logger.js';
import { checkAdmin } from '../utils/user.js';
import { database } from '../index.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('block')
        .setNameLocalizations({
            nl: "blokkeren"
        })
        .setDescription('Controls for the blocking system')
        .setDescriptionLocalizations({
            nl: "Bediening voor het blokkeer systeem."
        })
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(option => option
            .setName('add')
            .setNameLocalizations({
                nl: "toevoegen"
            })
            .setDescription(`Block someone from using ${general.name}.`)
            .setDescriptionLocalizations({
                nl: `Blokkeer iemand voor het gebruik van ${general.name}.`
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
            .setDescription(`Unblock someone from using ${general.name}.`)
            .setDescriptionLocalizations({
                nl: `Deblokkeer iemand voor het gebruik van ${general.name}.`
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
            .setDescription("Check the current block status.")
            .setDescriptionLocalizations({
                nl: "Controleer de actuele blokkeer status."
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

            // Handle
            if (actionType === "add") {
                try {
                    await database.query("INSERT INTO user_blocked (user_snowflake, user_username, guild_snowflake) VALUES (?, ?, ?);", [guildMember.user.id, guildMember.user.username, interaction.guild.id]);
                    logMessage(`${guildMember.user.username} was blocked by '${interaction.user.username}@${interaction.user.id}' in server '${interaction.guild.name}@${interaction.guild.id}'.`, "warning");
                    return await interaction.reply({
                        content: `Successfully blocked user < @${guildMember.user.id}>.They can no longer use any of my commands.`,
                        ephemeral: true
                    });
                } catch (error: any) {
                    if (error.code === "ER_DUP_ENTRY") {
                        return await interaction.reply({
                            content: `User < @${guildMember.user.id}> has been blocked already.`,
                            ephemeral: true
                        });
                    } else return await interaction.reply({
                        content: "Something went wrong while blocking this user. Please try again later.",
                        ephemeral: true
                    });
                }
            } else if (actionType === "remove") {
                try {
                    await database.query("DELETE FROM user_blocked WHERE user_snowflake = ? AND guild_snowflake = ?;", [guildMember.user.id, interaction.guild.id]);
                    logMessage(`${guildMember.user.username} was unblocked by '${interaction.user.username}@${interaction.user.id}' in server '${interaction.guild.name}@${interaction.guild.id}'.`, "warning");
                    return await interaction.reply({
                        content: `Successfully unblocked user <@${guildMember.user.id}>. They can now use all of my commands again.`,
                        ephemeral: true
                    });
                } catch (error: any) {
                    logError(error);
                    return await interaction.reply({
                        content: "Something went wrong while unblocking this user. Please try again later.",
                        ephemeral: true
                    });
                }
            } else if (actionType === "check") {
                try {
                    const data: Array<{ user_snowflake: string }> = await database.query("SELECT user_snowflake FROM user_blocked WHERE user_snowflake = ?;", [guildMember.user.id]);
                    return await interaction.reply({
                        content: `Blocked status of user <@${guildMember.user.id}>: \`${data.length === 0 ? "false" : "true"}\``,
                        ephemeral: true
                    });
                } catch (error: any) {
                    logError(error);
                    return await interaction.reply({
                        content: "Something went wrong while checking the block status of this user. Please try again later.",
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
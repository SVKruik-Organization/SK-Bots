import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { cooldowns, general } from '../config.js';
import { REST, Routes } from 'discord.js';
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN as string);
import { logError } from '../utils/logger.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('delete')
        .setNameLocalizations({
            nl: "verwijderen"
        })
        .setDescription('Delete slash commands.')
        .setDescriptionLocalizations({
            nl: "Verwijder commando's."
        })
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(option => option
            .setName("all")
            .setNameLocalizations({
                nl: "allemaal"
            })
            .setDescription("Delete all commands.")
            .setDescriptionLocalizations({
                nl: "Verwijder all commando's."
            }))
        .addSubcommand(option => option
            .setName("single")
            .setNameLocalizations({
                nl: "enkele"
            })
            .setDescription("Delete a specific command by ID.")
            .setDescriptionLocalizations({
                nl: "Verwijder een specifiek commando op ID."
            })
            .addStringOption(option => option
                .setName("command")
                .setNameLocalizations({
                    nl: "commando"
                })
                .setDescription("The ID of the command to delete.")
                .setDescriptionLocalizations({
                    nl: "Het ID van het betreffende commando."
                })
                .setRequired(true)
            )),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Permission Validation
            if (!interaction.guild) return;
            if (interaction.user.id !== general.authorId) return await interaction.reply({
                content: `This command is reserved for my developer, <@${general.authorId}>, only. If you are experiencing problems with (one of) the commands, please contact him.`,
                ephemeral: true
            });

            // Setup
            const option: string = interaction.options.getSubcommand();
            const commandId: string = interaction.options.getString("command") as string;

            if (option === "all") {
                try {
                    await rest.put(Routes.applicationGuildCommands(interaction.applicationId, interaction.guild.id), { body: [] })
                    return await interaction.reply({
                        content: "Deleted all Guild commands.",
                        ephemeral: true
                    });
                } catch (error: any) {
                    return await interaction.reply({
                        content: "Something went wrong while deleting the Guild commands. Please try again later.",
                        ephemeral: true
                    });
                }
            } else if (option === "single") {
                try {
                    await rest.delete(Routes.applicationGuildCommand(interaction.applicationId, interaction.guild.id, commandId))
                    return await interaction.reply({
                        content: "Guild command deleted successfully.",
                        ephemeral: true
                    });
                } catch (error: any) {
                    if (error.status === 404) {
                        return await interaction.reply({
                            content: "This Guild command does not exist. It might have been deleted already.",
                            ephemeral: true
                        });
                    } else return await interaction.reply({
                        content: "Something went wrong while deleting this Guild command. Please try again later.",
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
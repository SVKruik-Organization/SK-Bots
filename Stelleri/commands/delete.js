const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.A,
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
    async execute(interaction) {
        try {
            // Permission Validation
            if (interaction.user.id !== config.general.authorId) return interaction.reply({
                content: `This command is reserved for my developer, <@${config.general.authorId}>, only. If you are experiencing problems with (one of) the commands, please contact him.`,
                ephemeral: true
            });

            // Setup
            const option = interaction.options.getSubcommand();
            const commandId = interaction.options.getString("command");

            if (option === "all") {
                await rest.put(Routes.applicationGuildCommands(interaction.applicationId, interaction.guild.id), { body: [] })
                    .then(() => {
                        interaction.reply({
                            content: "Deleted all Guild commands.",
                            ephemeral: true
                        });
                    }).catch(() => {
                        return interaction.reply({
                            content: "Something went wrong while deleting the Guild commands. Please try again later.",
                            ephemeral: true
                        });
                    });
            } else if (option === "single") {
                await rest.delete(Routes.applicationGuildCommand(interaction.applicationId, interaction.guild.id, commandId))
                    .then(() => {
                        interaction.reply({
                            content: "Guild command deleted successfully.",
                            ephemeral: true
                        });
                    }).catch((error) => {
                        if (error.status === 404) {
                            interaction.reply({
                                content: "This Guild command does not exist. It might have been deleted already.",
                                ephemeral: true
                            });
                        } else interaction.reply({
                            content: "Something went wrong while deleting this Guild command. Please try again later.",
                            ephemeral: true
                        });
                    });
            }
        } catch (error) {
            logger.error(error);
        }
    }
};
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete slash commands.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(option => option
            .setName("all")
            .setDescription("Delete all Guild & Global commands."))
        .addSubcommand(option => option
            .setName("single")
            .setDescription("Delete a specific command by ID.")
            .addStringOption(option => option
                .setName("command")
                .setDescription("The ID of the command to delete.")
                .setRequired(true)
            )),
    async execute(interaction) {
        const option = interaction.options.getSubcommand();
        const commandId = interaction.options.getString("command");

        if (option === "all") {
            // Delete All Guild Commands
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

            // Delete All Global Commands
            await rest.put(Routes.applicationCommands(interaction.applicationId), { body: [] })
                .then(() => {
                    interaction.followUp({
                        content: "Deleted all Global commands.",
                        ephemeral: true
                    });
                }).catch(() => {
                    return interaction.followUp({
                        content: "Something went wrong while deleting the Global commands. Please try again later.",
                        ephemeral: true
                    });
                });
        } else if (option === "single") {
            // Delete Single Guild Command
            await rest.delete(Routes.applicationGuildCommand(interaction.applicationId, interaction.guild.id, commandId))
                .then(() => {
                    interaction.reply({
                        content: "Command deleted successfully.",
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

            // Delete Single Global Command
            await rest.delete(Routes.applicationCommand(interaction.applicationId, commandId))
                .then(() => {
                    interaction.followUp({
                        content: "Command deleted successfully.",
                        ephemeral: true
                    });
                }).catch((error) => {
                    if (error.status === 404) {
                        return interaction.followUp({
                            content: "This Global command does not exist. It might have been deleted already.",
                            ephemeral: true
                        });
                    } else if (error.code === "InteractionAlreadyReplied") {
                        interaction.followUp({
                            content: "Something went wrong while deleting this Global command. Please try again later.",
                            ephemeral: true
                        });
                    } else interaction.reply({
                        content: "Something went wrong while deleting this Global command. Please try again later.",
                        ephemeral: true
                    });
                });
        }
    }
};
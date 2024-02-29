const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const userUtils = require('../utils/user.js');
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
            if (interaction.user.id !== config.general.creatorId) return interaction.reply({
                content: `This command is reserved for my developer, <@${config.general.creatorId}>, only. If you are experiencing problems with (one of) the commands, please contact him.`,
                ephemeral: true
            });

            // Setup
            const option = interaction.options.getSubcommand();
            const commandId = interaction.options.getString("command");

            if (option === "all") {
                await rest.put(Routes.applicationCommands(config.general.clientId), { body: [] })
                    .then(() => {
                        interaction.reply({
                            content: "Deleted all Global commands.",
                            ephemeral: true
                        });
                    }).catch((error) => {
                        logger.error(error);
                        return interaction.reply({
                            content: "Something went wrong while deleting the Global commands. Please try again later.",
                            ephemeral: true
                        });
                    });
            } else if (option === "single") {
                await rest.delete(Routes.applicationCommand(config.general.clientId, commandId))
                    .then(() => {
                        interaction.reply({
                            content: "Global command deleted successfully.",
                            ephemeral: true
                        });
                    }).catch((error) => {
                        if (error.status === 404) {
                            interaction.reply({
                                content: "This Global command does not exist. It might have been deleted already.",
                                ephemeral: true
                            });
                        } else {
                            logger.log(error);
                            interaction.reply({
                                content: "Something went wrong while deleting this Global command. Please try again later.",
                                ephemeral: true
                            });
                        }
                    });
            }
        } catch (error) {
            logger.error(error);
        }
    }
};
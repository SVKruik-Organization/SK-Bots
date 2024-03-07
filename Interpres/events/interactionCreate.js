const { Events } = require('discord.js');
const modules = require('..');
const logger = require('../utils/logger.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Normal Slash Interactions
        if (!interaction.isChatInputCommand()) return;

        // Validation
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return interaction.reply({
            content: "This command is not supported (for now). Please try again later.",
            ephemeral: true
        });

        // Blocked User
        const blockedUsers = await modules.database.query("SELECT user_snowflake FROM user_blocked WHERE user_snowflake = ? AND guild_snowflake = ?;", [interaction.user.id, interaction.guild.id]);
        if (blockedUsers.length !== 0) return interaction.reply({
            content: "You are on the blocked users list, and you are therefore unable to use my commands. If you think this is a mistake, please contact moderation to appeal.",
            ephemeral: true
        });

        // Executing
        try {
            command.execute(interaction);
        } catch (error) {
            logger.log(`There was an error while executing || ${interaction.commandName} ||`, "error");
            interaction.reply({ content: 'There was an fatal error while executing this command!', ephemeral: true });
            logger.error(error);
        }

        // Logging
        let options = [];
        interaction.options._hoistedOptions.forEach(element => {
            options.push(`${element.name}: ${element.value}`);
        });
        const processedOptions = ` with the following options: ${JSON.stringify(options)}`;
        logger.log(`'${interaction.user.username}@${interaction.user.id}' used || ${interaction.commandName} || command${options.length > 0 ? processedOptions : ""} in guild '${interaction.guild.name}@${interaction.guild.id}'`, "info");
    }
};
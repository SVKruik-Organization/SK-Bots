const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
const modules = require('..');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete a command.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('id').setDescription('Target command ID.').setRequired(true)),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const commandId = interaction.options.getString('id');

        let error = 0;
        for (let i = 0; i < config.general.guildId.length; i++) {
            await rest.delete(Routes.applicationGuildCommand(config.general.clientId, config.general.guildId[i], commandId))
                .catch(async () => error = 1);
        };

        if (error === 1) {
            await interaction.reply({ content: "Command doesn't exist. It may have already been removed.", ephemeral: true });
        } else return await interaction.reply({ content: "Command succesfully removed.", ephemeral: true });



        modules.commandUsage(snowflake, username);
    },
};
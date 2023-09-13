const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config.js');
const fs = require('fs');
const modules = require('../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('template')
        .setDescription('Template command.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('template').setDescription('Template').setRequired(true)),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const template = interaction.options.getString('template');

        await interaction.reply({ content: template });

        modules.commandUsage(snowflake, username);
    },
};
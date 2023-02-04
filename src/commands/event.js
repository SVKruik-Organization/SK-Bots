const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Create a new event in the event channel. Users can see when a new meeting takes place.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.reply('WIP');
    },
};
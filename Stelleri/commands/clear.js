const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Bulk delete messages inside the current channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option => option
            .setName('amount')
            .setDescription('Amount of messages to delete.')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(50)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        interaction.reply("Deleting `" + amount + "` messages . . .");

        // Bulk Delete
        setTimeout(() => {
            interaction.channel.bulkDelete(amount + 1);
        }, 1000);
    }
};
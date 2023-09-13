const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Bulk delete messages.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option => option.setName('amount').setDescription('Amount of messages to delete.').setRequired(true).setMinValue(1).setMaxValue(100)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        await interaction.reply("Deleting `" + amount + "` messages . . .");
        setTimeout(async () => {
            await interaction.channel.bulkDelete(amount + 1);
        }, 1000);
    }
};
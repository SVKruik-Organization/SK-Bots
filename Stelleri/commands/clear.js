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
        interaction.reply({
            content: `Deleting ${amount} messages . . .`,
            ephemeral: true
        });

        // Bulk Delete
        setTimeout(() => {
            interaction.deleteReply();
            interaction.channel.bulkDelete(amount).catch(() => {
                interaction.reply({
                    content: "Atleast one of the messages you are trying to delete is older than \`14\` days. Discord is not allowing me to do that, so you will have to delete them manually (or lower your clear amount to potentially exclude the erroneous message).",
                    ephemeral: true
                });
            });
        }, 1000);
    }
};
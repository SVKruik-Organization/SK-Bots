const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cmd-delete')
        .setDescription('Delete a command.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('id').setDescription('Target command ID.').setRequired(true)),
    async execute(interaction) {
        const client = require("..");
        const commandId = interaction.options.getString('id');
        await interaction.reply("Fetching command with ID `" + commandId + "`");
        client.application.commands.fetch(commandId) // id of your command
            .then((command) => {
                console.log(`Fetched command ${command.name}`);
                command.delete();
                console.log(`Deleted command ${command.name}`);
            }).catch(console.error);
        await interaction.followUp("Succesfully deleted the command.");
    },
};
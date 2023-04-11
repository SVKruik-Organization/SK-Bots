const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete a command.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('id').setDescription('Target command ID.').setRequired(true)),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const commandId = interaction.options.getString('id');

        rest.delete(Routes.applicationGuildCommand(config.general.clientId, config.general.guildId, commandId))
            .then(async () => {
                return interaction.reply({ content: "Command succesfully removed.", ephemeral: true });
            }).catch(async () => {
                return interaction.reply({ content: "Command doesn't exist. It may have already been removed.", ephemeral: true });
            });

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(() => {
                return console.log("[WARNING] Command usage increase unsuccessful, user does not have an account yet.\n");
            });
    },
};
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
                await interaction.reply("Succesfully deleted the command.");
            }).catch(async () => {
                await interaction.reply("Command doesn't exist. It may have already been removed.");
            });

        modules.database.promise()
            .execute(`UPDATE user commands_used = commands_used + 1 WHERE snowflake = ${snowflake}`)
            .catch(err => {
                return console.log("Command usage increase unsuccessful, user do not have an account yet.");
            });
    },
};
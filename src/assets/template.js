const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('template')
        .setDescription('Template command.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('template').setDescription('Template').setRequired(true)),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const template = interaction.options.getString('template');

        modules.database.promise()
            .execute(`UPDATE user commands_used = commands_used + 1 WHERE snowflake = ${snowflake}`)
            .catch(err => {
                return console.log("Command usage increase unsuccessful, user do not have an account yet.");
            });
    },
};
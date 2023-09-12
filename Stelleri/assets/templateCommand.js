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
        const template = interaction.options.getString('template');
        const username = interaction.user.username;

        await interaction.reply({ content: template });

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(() => {
                return modules.log(`Command usage increase unsuccessful, ${username} does not have an account yet.`, "warning");
            });
    },
};
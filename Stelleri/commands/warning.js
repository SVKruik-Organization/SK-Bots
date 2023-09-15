const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn someone that breakes the rules. Administrator version of report.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option.setName('target').setDescription('The person you want to warn.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the warning.').setRequired(false).setMaxLength(1000)),
    async execute(interaction) {
        const targetSnowflake = interaction.options.getUser('target').id;
        let reason = interaction.options.getString('reason') ?? 'No reason provided';

        await modules.database.query(`INSERT INTO warning (snowflake_recv, reason, date) VALUES (${targetSnowflake}, '${reason}', CURRENT_TIMESTAMP())`)
            .then(() => {
                interaction.reply(`User <@${targetSnowflake}> has been warned for: \`${reason}\``);
            }).catch(() => {
                return interaction.reply({ content: "Something went wrong while warning this user. Please try again later.", ephemeral: true });
            });
    }
};
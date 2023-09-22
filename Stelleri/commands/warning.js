const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn someone that breaks the rules. Administrator version of report.')
        .addUserOption(option => option.setName('target').setDescription('The target member.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the warning.').setRequired(false).setMaxLength(1000))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const targetSnowflake = interaction.options.getUser('target').id;
        let reason = interaction.options.getString('reason') ?? 'No reason provided';

        modules.database.query("INSERT INTO warning (snowflake_recv, reason, date) VALUES (?, ?, CURRENT_TIMESTAMP());", [targetSnowflake, reason])
            .then(() => {
                interaction.reply(`User <@${targetSnowflake}> has been warned for: \`${reason}\``);
            }).catch(() => {
            return interaction.reply({
                content: "Something went wrong while warning this user. Please try again later.",
                ephemeral: true
            });
        });
    }
};
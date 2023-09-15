const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Report someone for breaking the rules. We will have a look at it.')
        .addUserOption(option => option.setName('target').setDescription('The person you want to report.').setRequired(true))
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Type of report.')
                .setRequired(true)
                .addChoices(
                    { name: 'Swearing', value: 'Swearing' },
                    { name: 'Bullying', value: 'Bullying' },
                    { name: 'Scamming', value: 'Scamming' },
                    { name: 'Exploiting', value: 'Exploiting' },
                    { name: 'Dating', value: 'Dating' },
                    { name: 'Harassment', value: 'Harassment' },
                    { name: 'Spamming', value: 'Spamming' },
                    { name: 'Other (Please specify)', value: 'Other' }
                ))
        .addStringOption(option => option.setName('reason').setDescription('What did the user do wrong? What rules did they break?').setRequired(true).setMaxLength(1000)),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const targetSnowflake = interaction.options.getUser('target').id;
        const reason = interaction.options.getString('reason');
        const category = interaction.options.getString('category');

        modules.database.query("INSERT INTO report (snowflake, snowflake_recv, reason, date, category) VALUES (?, ?, ?, CURRENT_TIMESTAMP(), ?);",
        [snowflake, targetSnowflake, reason, category])
            .then(() => {
                interaction.reply({ content: "Thank you for your report. We will have a look at it ASAP.", ephemeral: true });
                modules.log(`${username} has reported someone.`, "info");
            }).catch(() => {
                interaction.reply({ content: "Something went wrong while reporting this user. Please try again later.", ephemeral: true });
            });
    }
};
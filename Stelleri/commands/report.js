const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const modules = require('..');
const dateInfo = modules.getDate();
const date = dateInfo.date;
const time = dateInfo.time;

module.exports = {
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
        const modules = require('..');
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const targetSnowflake = interaction.options.getUser('target').id;
        const reason = interaction.options.getString('reason');
        const category = interaction.options.getString('category');
        let userId = undefined;
        let userIdReceiver = undefined;

        await modules.database.promise()
            .execute(`UPDATE user SET reports = (reports + 1) WHERE snowflake = '${targetSnowflake}';`)
            .then(async () => {
                await interaction.reply({ content: "Thank you for your report. We will have a look at it ASAP.", ephemeral: true });
            }).catch(async () => {
                await interaction.reply({ content: "Something went wrong while reporting this user. Please try again later.", ephemeral: true });
            });

        await modules.database.promise()
            .execute(`SELECT id FROM user WHERE snowflake = '${snowflake}';`)
            .then(async ([data]) => {
                userId = data[0].id;
                await modules.database.promise()
                    .execute(`SELECT id FROM user WHERE snowflake = '${targetSnowflake}';`)
                    .then(async ([data]) => {
                        userIdReceiver = data[0].id;
                    }).catch(async () => {
                        await interaction.reply({ content: "Something went wrong while reporting this user. Please try again later.", ephemeral: true });
                    });
            }).catch(async () => {
                await interaction.reply({ content: "This command requires you to have an account. Create an account with the `/register` command.", ephemeral: true });
            });

        await modules.database.promise()
            .execute(`INSERT INTO report (user_id, user_id_receiver, reason, date, category) VALUES (${userId}, ${userIdReceiver}, '${reason}', CURDATE(), '${category}')`)
            .catch(async () => {
                await interaction.reply({ content: "Something went wrong while reporting this user. Please try again later.", ephemeral: true });
            });

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(() => {
                const data = `${time} [WARNING] Command usage increase unsuccessful, ${username} does not have an account yet.\n`;
                console.log(data);
                fs.appendFile(`./logs/${date}.log`, data, (err) => {
                    if (err) console.log(`${time} [ERROR] Error appending to log file.`);
                });
                return;
            });
    },
};
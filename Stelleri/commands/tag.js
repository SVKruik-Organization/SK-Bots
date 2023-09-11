const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const modules = require('..');
const dateInfo = modules.getDate();
const date = dateInfo.date;
const time = dateInfo.time;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Get a Discord Tag from the database. This command is used as a check for the database status.')
        .addUserOption(option => option.setName('target').setDescription('The user whose tag you would like to retrieve.').setRequired(true)),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const targetSnowflake = interaction.options.getUser('target').id;

        modules.database.promise()
            .execute(`SELECT tag FROM user WHERE snowflake = '${targetSnowflake}';`)
            .then(async ([data]) => {
                await interaction.reply("The Discord Tag is: `" + data[0].tag + "`.");
            }).catch(() => {
                return interaction.reply({ content: "This user does not have an account yet.", ephemeral: true });
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
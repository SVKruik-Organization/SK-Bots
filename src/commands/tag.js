const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Get your Discord Tag from the database.'),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const targetSnowflake = interaction.user.id;
        modules.database.promise()
            .execute(`SELECT tag FROM user WHERE snowflake = '${targetSnowflake}'`)
            .then(async ([data]) => {
                await interaction.reply('Your Discord Tag is: `' + data[0].tag + '`');
            }).catch(err => {
                return console.log("You do not have an account yet. Generate an account with the `/register` command.");
            });
    },
};
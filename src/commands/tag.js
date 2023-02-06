const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Get your Discord Tag from the database.')
        .addUserOption(option => option.setName('target').setDescription('The user whose username you would like to retrieve.').setRequired(true)),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const targetSnowflake = interaction.options.getUser('target').id;
        modules.database.promise()
            .execute(`SELECT tag FROM user WHERE snowflake = '${targetSnowflake}';`)
            .then(async ([data]) => {
                await interaction.reply("The Discord Tag is: `" + data[0].tag + "`.");
            }).catch(err => {
                return interaction.reply("User does not have an account yet.\n");
            });

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(err => {
                return console.log("[WARNING] Command usage increase unsuccessful, user does not have an account yet.\n");
            });
    },
};
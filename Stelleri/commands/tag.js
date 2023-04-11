const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Get a Discord Tag from the database. This command is used as a check for the database status.')
        .addUserOption(option => option.setName('target').setDescription('The user whose tag you would like to retrieve.').setRequired(true)),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
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
                return console.log("[WARNING] Command usage increase unsuccessful, user does not have an account yet.\n");
            });
    },
};
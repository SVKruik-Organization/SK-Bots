const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Generate a random number.')
        .addIntegerOption(option => option.setName('maximum').setDescription('Highest number.').setRequired(true).setMinValue(2)),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const bound = interaction.options.getInteger('maximum');
        const random = Math.floor(Math.random() * bound) + 1;
        await interaction.reply("Random number: `" + random + "`");

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}'`)
            .catch(err => {
                return console.log("Command usage increase unsuccessful, user do not have an account yet.");
            });
    },
};
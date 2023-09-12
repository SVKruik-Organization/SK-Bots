const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coin')
        .setDescription('Flip a coin!')
        .addStringOption(option =>
            option.setName('side')
                .setDescription('Choose which coin side will be winning for you.')
                .setRequired(true)
                .addChoices(
                    { name: 'Heads', value: 'heads' },
                    { name: 'Tails', value: 'tails' }
                )),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const winningSide = interaction.options.getString('side');
        const list = ["heads", "tails"];
        const random = list[Math.floor(Math.random() * list.length)];

        if (random == "heads") {
            winningSide == "heads" ? win("Heads") : lose("Heads");
        } else if (random == "tails") {
            winningSide == "tails" ? win("Tails") : lose("Tails");
        };

        /**
         * Response when user wins.
         * @param {string} side The side that has been chosen.
         */
        function win(side) {
            interaction.reply(`:coin: ${side}! -- You win. :green_circle:`);
        };

        /**
         * Response when user loses.
         * @param {string} side The side that has been chosen.
         */
        function lose(side) {
            interaction.reply(`:coin: ${side}! -- You lose. :red_circle:`);
        };

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(() => {
                return modules.log(`Command usage increase unsuccessful, ${username} does not have an account yet.`, "warning");
            });
    },
};
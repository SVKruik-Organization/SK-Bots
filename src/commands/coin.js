const { SlashCommandBuilder } = require('discord.js');

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
        const winningSide = interaction.options.getString('side');

        const list = ["heads", "tails"];
        const random = list[Math.floor(Math.random() * list.length)];
        if (random == "heads") {
            winningSide == "heads" ? win("Heads") : lose("Heads");
        } else if (random == "tails") {
            winningSide == "tails" ? win("Tails") : lose("Tails");
        };

        function win(side) {
            interaction.reply(`:coin: ${side}! -- You win. :green_circle:`);
        };

        function lose(side) {
            interaction.reply(`:coin: ${side}! -- You lose. :red_circle:`);
        };
    },
};
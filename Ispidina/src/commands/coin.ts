const { SlashCommandBuilder } = require('discord.js');
const config = require('../config');
const logger = require('../utils/logger');

export default {
    cooldown: cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('coin')
        .setNameLocalizations({
            nl: "munt"
        })
        .setDescription('Flip a coin!')
        .setDescriptionLocalizations({
            nl: "Kop of munt!"
        })
        .setDMPermission(true)
        .addStringOption(option => option
            .setName('side')
            .setNameLocalizations({
                nl: "zijde"
            })
            .setDescription('Choose which coin side will be winning for you.')
            .setDescriptionLocalizations({
                nl: "Kies welke kant van de munt de winnende zijde voor u is."
            })
            .setRequired(true)
            .addChoices(
                { name: 'Heads', value: 'heads' },
                { name: 'Tails', value: 'tails' }
            )),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const winningSide = interaction.options.getString('side');
            const list = ["heads", "tails"];
            const random = list[Math.floor(Math.random() * list.length)];

            if (random === "heads") {
                winningSide === "heads" ? win("Heads") : lose("Heads");
            } else if (random === "tails") {
                winningSide === "tails" ? win("Tails") : lose("Tails");
            }

            /**
             * Response when user wins.
             * @param side The side that has been chosen.
             */
            function win(side: string) {
                return interaction.reply({ content: `:coin: ${side}! -- You win. :green_circle:` });
            }

            /**
             * Response when user loses.
             * @param side The side that has been chosen.
             */
            function lose(side: string) {
                return interaction.reply({ content: `:coin: ${side}! -- You lose. :red_circle:` });
            }
        } catch (error: any) {
            logError(error);
        }
    }
};
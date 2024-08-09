import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { cooldowns } from '../config.js';
import { logError } from '../utils/logger.js';
import { Command } from '../types.js';

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
            const winningSide: string = interaction.options.getString("side") as string;
            const list: Array<string> = ["heads", "tails"];
            const random: string = list[Math.floor(Math.random() * list.length)];

            if (random === "heads") {
                winningSide === "heads" ? await win("Heads") : await lose("Heads");
            } else if (random === "tails") winningSide === "tails" ? await win("Tails") : await lose("Tails");

            /**
             * Response when user wins.
             * @param side The side that has been chosen.
             */
            async function win(side: string) {
                return await interaction.reply({ content: `:coin: ${side}! -- You win. :green_circle:` });
            }

            /**
             * Response when user loses.
             * @param side The side that has been chosen.
             */
            async function lose(side: string) {
                return await interaction.reply({ content: `:coin: ${side}! -- You lose. :red_circle:` });
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
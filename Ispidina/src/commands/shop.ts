import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { cooldowns } from '../config';
import { logError } from '../utils/logger';
import { Command } from "../types";

export default {
    cooldown: cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('shop')
        .setNameLocalizations({
            nl: "winkel"
        })
        .setDescription('Spend your Bits on cool perks and cosmetics.')
        .setDescriptionLocalizations({
            nl: "Geef uw Bits uit aan gafe extra's en cosmetica."
        })
        .setDMPermission(false),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const select = new StringSelectMenuBuilder()
                .setCustomId('shopSelectMenu')
                .setPlaceholder('Make a selection.')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Catalog')
                        .setDescription('See the full catalog of products you can purchase.')
                        .setValue('catalog'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Buy')
                        .setDescription('Buy something after choosing an item from the catalog.')
                        .setValue('buy'));

            await interaction.deferReply({ ephemeral: true });
            await interaction.editReply({
                content: 'View the catalog or buy something.',
                components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)]
            });
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Spend your Bits on cool perks or cosmetics.'),
    async execute(interaction) {
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
            components: [new ActionRowBuilder().addComponents(select)],
            ephemeral: true
        });
    }
};
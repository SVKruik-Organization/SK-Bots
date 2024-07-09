const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.C,
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
    async execute(interaction) {
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
                components: [new ActionRowBuilder().addComponents(select)],
                ephemeral: true
            });
        } catch (error) {
            logger.error(error);
        }
    }
};
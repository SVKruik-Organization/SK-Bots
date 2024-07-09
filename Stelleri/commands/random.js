const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('random')
        .setNameLocalizations({
            nl: "willekeurig"
        })
        .setDescription('Generate a random number.')
        .setDescriptionLocalizations({
            nl: "Genereer een willekeurig nummer."
        })
        .setDMPermission(true)
        .addIntegerOption(option => option
            .setName('maximum')
            .setNameLocalizations({
                nl: "maximum"
            })
            .setDescription('The highest allowed number.')
            .setDescriptionLocalizations({
                nl: "Het hoogste toegestane nummer."
            })
            .setRequired(true)
            .setMinValue(2)),
    async execute(interaction) {
        try {
            const bound = interaction.options.getInteger('maximum');
            const random = Math.floor(Math.random() * bound) + 1;

            interaction.reply({ content: `Random number: \`${random}\`.` });
        } catch (error) {
            logger.error(error);
        }
    }
};
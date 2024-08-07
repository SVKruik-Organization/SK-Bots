const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.js');
const modules = require('..');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('template')
        .setNameLocalizations({
            nl: "template"
        })
        .setDescription('Template.')
        .setDescriptionLocalizations({
            nl: "Template."
        })
        .setDMPermission(false)
        .addSubcommand(option => option
            .setName('A')
            .setNameLocalizations({
                nl: "A"
            })
            .setDescription("A.")
            .setDescriptionLocalizations({
                nl: "A."
            })
            .addStringOption(option => option
                .setName('A')
                .setNameLocalizations({
                    nl: "A"
                })
                .setDescription('A.')
                .setDescriptionLocalizations({
                    nl: "A."
                })
                .setRequired(true)))
        .addSubcommand(option => option
            .setName('B')
            .setNameLocalizations({
                nl: "B"
            })
            .setDescription("B.")
            .setDescriptionLocalizations({
                nl: "B."
            })
            .addStringOption(option => option
                .setName('B')
                .setNameLocalizations({
                    nl: "B"
                })
                .setDescription('B.')
                .setDescriptionLocalizations({
                    nl: "B."
                })
                .setRequired(true))),
    async execute(interaction) {
        try {
            // Setup
            const targetUser = interaction.options.getString('B');
            const actionType = interaction.options.getSubcommand();

            // Handle
            if (actionType === "A") {
            } else if (actionType === "B");
        } catch (error) {
            logger.error(error);
        }
    }
};
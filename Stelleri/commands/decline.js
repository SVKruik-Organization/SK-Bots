const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');
const operatorHandler = require('../handlers/operatorHandler.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('decline')
        .setNameLocalizations({
            nl: "afwijzen"
        })
        .setDescription("Decline an Operator invitation.")
        .setDescriptionLocalizations({
            nl: "Wijs een Operator-uitnodiging af."
        })
        .setDMPermission(true),
    async execute(interaction) {
        try {
            operatorHandler.handleDeclineInit(interaction);
        } catch (error) {
            logger.error(error);
        }
    }
};
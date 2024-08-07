const { SlashCommandBuilder } = require('discord.js');
const config = require('../config');
const logger = require('../utils/logger');
const operatorHandler = require('../handlers/operatorHandler');

export default {
    cooldown: cooldowns.A,
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
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            operatorHandler.handleDeclineInit(interaction);
        } catch (error: any) {
            logError(error);
        }
    }
};
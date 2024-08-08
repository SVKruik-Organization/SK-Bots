import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { cooldowns } from '../config';
import { logError } from '../utils/logger';
import { handleDeclineInit } from '../handlers/operatorHandler';
import { Command } from '../types';

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
            handleDeclineInit(interaction);
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
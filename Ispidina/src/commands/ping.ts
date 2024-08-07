import { ChatInputCommandInteraction } from 'discord.js';
import * as logger from "../utils/logger";
import { SlashCommandBuilder } from 'discord.js';
import { general, cooldowns } from "../config";

export default {
    cooldown: cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setNameLocalizations({
            nl: "ping"
        })
        .setDescription(`Test if ${general.name} responds.`)
        .setDescriptionLocalizations({
            nl: `Test of ${general.name} reageert.`
        })
        .setDMPermission(true),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const list: Array<string> = ["Yep!", "Here!", "Ready!", "Awake!", "I'm here!", "Yes!", "Yeah!", "Sure!", "Hello!", "Hey!", "Sup!", "Hello there!", "Oi!"];
            const random: string = list[Math.floor(Math.random() * list.length)];

            await return interaction.reply({ content: `👋 ${random}` });
        } catch (error: any) {
            logError(error);
        }
    }
};
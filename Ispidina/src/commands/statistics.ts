import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { cooldowns, general, urls } from '../config.js';
import { readFileSync, readdirSync } from 'fs';
import { create } from '../utils/embed.js';
import { logError } from '../utils/logger.js';
import { Command } from '../types.js';
import { getDirname } from '../utils/file.js';

export default {
    cooldown: cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('statistics')
        .setNameLocalizations({
            nl: "statistieken"
        })
        .setDescription(`Let ${general.name} display some statistics.`)
        .setDescriptionLocalizations({
            nl: `Laat ${general.name} enkele statistieken weergeven.`
        })
        .setDMPermission(true),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const commands: number = readdirSync("commands").length;
            const hours: number = Math.floor(interaction.client.uptime / 3600000) % 24;
            const minutes: number = Math.floor(interaction.client.uptime / 60000) % 60;
            const uptime: string = `\`${hours}\` hours and \`${minutes}\` minutes.`;
            const version: string = JSON.parse(readFileSync(`${getDirname(import.meta.url)}/../package.json`, "utf-8")).version;

            const embed: EmbedBuilder = create("Bot Statistics", `${general.name} Information`, interaction.user,
                [
                    { name: 'Name', value: `**${general.name}**`, inline: false },
                    { name: 'Servers', value: `\`${interaction.client.guilds.cache.size}\` Total`, inline: false },
                    { name: 'Creator', value: `<@${general.authorId}>`, inline: false },
                    { name: 'Uptime', value: uptime, inline: false },
                    { name: 'Ping', value: `\`${Math.abs(interaction.client.ws.ping)}\`ms`, inline: false },
                    { name: 'Commands', value: `\`${commands}\` Total`, inline: false },
                    { name: 'Docs', value: `[platform.stefankruik.com/documentation](${urls.docs})`, inline: false },
                    { name: 'Version', value: `\`${version}\``, inline: false }
                ], ["server"]);
            return await interaction.reply({ embeds: [embed] });
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
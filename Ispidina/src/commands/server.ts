import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { cooldowns } from '../config';
import { findGuildById } from '../utils/guild';
import { create } from '../utils/embed';
import { logError } from '../utils/logger';
import { Command, GuildFull } from "../types";

export default {
    cooldown: cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('server')
        .setNameLocalizations({
            nl: "server"
        })
        .setDescription('Show some server statistics.')
        .setDescriptionLocalizations({
            nl: "Laat wat server statistieken zien."
        })
        .setDMPermission(false),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Setup
            if (!interaction.guild) return;
            const targetGuild: GuildFull | undefined = findGuildById(interaction.guild.id);
            if (!targetGuild) return await interaction.reply({
                content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
                ephemeral: true
            });
            const rawDate: Date = targetGuild.guild_object.createdAt;
            const date: string = `${rawDate.getDate()}/${rawDate.getMonth() + 1}/${rawDate.getFullYear()}`;
            const embed: EmbedBuilder = create("Server Statistics", interaction.guild.name, interaction.user,
                [
                    {
                        name: 'Members',
                        value: `\`${interaction.guild.memberCount}\``,
                        inline: false
                    },
                    {
                        name: 'Created',
                        value: `${date}`,
                        inline: false
                    },
                    {
                        name: 'Owner',
                        value: `<@${interaction.guild.ownerId}>`,
                        inline: false
                    },
                    {
                        name: 'Rules Channel',
                        value: targetGuild.channel_rules ? `<#${targetGuild.channel_rules.id}>` : "Not Configured",
                        inline: false
                    }
                ], ["statistics"]);
            return await interaction.reply({ embeds: [embed] });
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
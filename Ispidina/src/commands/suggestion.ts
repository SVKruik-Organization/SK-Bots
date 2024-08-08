import { SlashCommandBuilder, ChatInputCommandInteraction, TextBasedChannel, Message } from 'discord.js';
import { cooldowns, colors, general } from '../config';
import { EmbedBuilder } from 'discord.js';
import { findGuildById } from '../utils/guild';
import { logError } from '../utils/logger';
import { Command, GuildFull } from "../types";

export default {
    cooldown: cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('suggestion')
        .setNameLocalizations({
            nl: "suggestie"
        })
        .setDescription('Pitch a new idea for the server!')
        .setDescriptionLocalizations({
            nl: "Pitch een nieuw idee voor de server!"
        })
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('title')
            .setNameLocalizations({
                nl: "titel"
            })
            .setDescription('The title for your suggestion. Max 50 characters.')
            .setDescriptionLocalizations({
                nl: "De titel van uw suggestie. Max 50 karakters."
            })
            .setRequired(true)
            .setMaxLength(50))
        .addStringOption(option => option
            .setName('description')
            .setNameLocalizations({
                nl: "omschrijving"
            })
            .setDescription('The description. Pitch your idea, explain why and how to implement. Max 950 characters.')
            .setDescriptionLocalizations({
                nl: "De omschrijving. Pitch uw idee, leg uit waarom en hoe te implementeren. Max 950 karakters."
            })
            .setRequired(true)
            .setMaxLength(950)),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Init
            if (!interaction.guild) return;
            const targetGuild: GuildFull | undefined = findGuildById(interaction.guild.id);
            if (!targetGuild || !targetGuild.channel_suggestion) return await interaction.reply({
                content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
                ephemeral: true
            });

            // Setup
            const channel: TextBasedChannel = targetGuild.channel_suggestion;
            const title: string = interaction.options.getString("title") as string;
            const description: string = interaction.options.getString("description") as string;
            const username: string = interaction.user.username;
            const pfp: string = interaction.user.avatarURL() as string;

            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.bot)
                .setTitle(`New Suggestion: ${title}`)
                .setAuthor({ name: username, iconURL: pfp })
                .setDescription(`${description}`)
                .addFields({ name: "-----", value: 'Meta' })
                .setTimestamp()
                .setFooter({ text: `Embed created by ${general.name}` });
            const embedMessage: Message<boolean> = await channel.send({ embeds: [embed] });
            await embedMessage.react('🟢');
            await embedMessage.react('🔴');
            return await interaction.reply({
                content: `Message created. Check your event here: <#${channel.id}>.`,
                ephemeral: true
            });
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
import { SlashCommandBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { cooldowns } from '../config.js';
import { logError } from '../utils/logger.js';
import { createTicket } from '../utils/ticket.js';
import { findGuildById } from '../utils/guild.js';
import { Command, GuildFull } from '../types.js';

export default {
    cooldown: cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setNameLocalizations({
            nl: "ticket"
        })
        .setDescription('Open up a private channel for 1 on 1 support.')
        .setDescriptionLocalizations({
            nl: "Open een privé kanaal voor 1 op 1 hulp."
        })
        .setDMPermission(false),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.guild) return;
            const targetGuild: GuildFull | undefined = findGuildById(interaction.guild.id);
            if (!targetGuild || !targetGuild.channel_ticket || !targetGuild.role_support) return await interaction.reply({
                content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
                ephemeral: true
            });

            await interaction.reply({
                content: `Hey there, thanks for contacting support. I am on it, give me one second.`,
                ephemeral: true
            });

            try {
                const data: TextChannel = await interaction.guild.channels.create({
                    name: `${createTicket()} - ${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: targetGuild.channel_ticket.id,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: targetGuild.role_support,
                            allow: [PermissionFlagsBits.ViewChannel],
                        }
                    ]
                });
                const close: ButtonBuilder = new ButtonBuilder()
                    .setCustomId('closeTicketChannel')
                    .setLabel("Close")
                    .setStyle(ButtonStyle.Danger);

                // New Channel
                data.send({
                    content: "Welcome to this private channel. Support will be right with you @everyone.\n\nWhen your question/issue is resolved, you can use the following button to close the ticket channel:",
                    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(close)]
                });

                // Initial Channel
                return interaction.editReply({
                    content: `Successfully created your support channel. Check it out here <#${data.id}>. A support agent should be right with you.`,
                });
            } catch (error: any) {
                logError(error);
                return interaction.editReply({
                    content: "Something went wrong while creating your channel. Please try again later.",
                });
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
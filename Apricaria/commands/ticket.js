const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');
const ticket = require('../utils/ticket.js');
const guildUtils = require('../utils/guild.js');

module.exports = {
    cooldown: config.cooldowns.D,
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
    async execute(interaction) {
        try {
            const targetGuild = guildUtils.findGuildById(interaction.guild.id);
            if (!targetGuild || !targetGuild.channel_ticket || !targetGuild.role_support) return interaction.reply({
                content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
                ephemeral: true
            });

            interaction.reply({
                content: `Hey there, thanks for contacting support. I am on it, give me one second.`,
                ephemeral: true
            });

            interaction.guild.channels.create({
                name: `${ticket.createTicket()} - ${interaction.user.username}`,
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
            }).then((data) => {
                const close = new ButtonBuilder()
                    .setCustomId('closeTicketChannel')
                    .setLabel("Close")
                    .setStyle(ButtonStyle.Danger);

                // New Channel
                data.send({
                    content: "Welcome to this private channel. Support will be right with you @everyone.\n\nWhen your question/issue is resolved, you can use the following button to close the ticket:",
                    components: [new ActionRowBuilder().addComponents(close)],
                    ephemeral: true
                });

                // Initial Channel
                return interaction.editReply({
                    content: `Successfully created your support channel. Check it out here <#${data.id}>. A support agent should be right with you.`,
                    ephemeral: true
                });
            }).catch((error) => {
                logger.error(error);
                return interaction.editReply({
                    content: "Something went wrong while creating your channel. Please try again later.",
                    ephemeral: true
                });
            });
        } catch (error) {
            logger.error(error);
        }
    }
};
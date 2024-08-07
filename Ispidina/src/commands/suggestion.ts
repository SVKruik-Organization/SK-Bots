const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.js');
const { EmbedBuilder } = require('discord.js');
const guildUtils = require('../utils/guild.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.C,
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
            .setDescription('The description. Pitch your idea, explain why and how to implement. Max 600 characters.')
            .setDescriptionLocalizations({
                nl: "De omschrijving. Pitch uw idee, leg uit waarom en hoe te implementeren. Max 600 karakters."
            })
            .setRequired(true)
            .setMaxLength(600)),
    async execute(interaction) {
        try {
            // Init
            const targetGuild = guildUtils.findGuildById(interaction.guild.id);
            if (!targetGuild || !targetGuild.channel_suggestion) return interaction.reply({
                content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
                ephemeral: true
            });

            // Setup
            const channel = targetGuild.channel_suggestion;
            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description');
            const username = interaction.user.username;
            const pfp = interaction.user.avatarURL();

            const embed = new EmbedBuilder()
                .setColor(config.colors.bot)
                .setTitle(`New Suggestion: ${title}`)
                .setAuthor({ name: username, iconURL: pfp })
                .setDescription(`${description}`)
                .addFields({ name: "-----", value: 'Meta' })
                .setTimestamp()
                .setFooter({ text: `Embed created by ${config.general.name}` });
            const embedMessage = await channel.send({ embeds: [embed] });
            await embedMessage.react('🟢');
            await embedMessage.react('🔴');
            interaction.reply({
                content: `Message created. Check your event here: <#${channel.id}>.`,
                ephemeral: true
            });
        } catch (error) {
            logger.error(error);
        }
    }
};
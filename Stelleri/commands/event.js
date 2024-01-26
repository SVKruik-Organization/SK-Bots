const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const { EmbedBuilder } = require('discord.js');
const modules = require('..');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Create a new event in the event channel. Users can see when a new meeting takes place.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('title').setDescription('The title for your event. Max 20 characters.').setRequired(true).setMaxLength(20))
        .addStringOption(option => option.setName('description').setDescription('The description for the event. What is your event all about? Max 600 characters.').setRequired(true).setMaxLength(600))
        .addStringOption(option => option.setName('location').setDescription('Location for your event. This can be a call or a physical location. Max 50 characters.').setRequired(true).setMaxLength(50))
        .addStringOption(option => option.setName('date').setDescription('The date for your event. For example: 05/02/2023.').setRequired(true).setMaxLength(10))
        .addStringOption(option => option.setName('time').setDescription('The time when your event starts. For example: 09:15.').setRequired(true).setMaxLength(5)),
    async execute(interaction) {
        const targetGuild = modules.findGuildById(interaction.guild.id);
        if (!targetGuild || !targetGuild.channel_event) return interaction.reply({
            content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
            ephemeral: true
        });
        const channel = targetGuild.channel_event;
        const username = interaction.user.username;
        const pfp = interaction.user.avatarURL();
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const location = interaction.options.getString('location');
        const date = interaction.options.getString('date');
        const time = interaction.options.getString('time');

        const embed = new EmbedBuilder()
            .setColor(config.general.color)
            .setTitle(title)
            .setAuthor({ name: username, iconURL: pfp })
            .setDescription(description)
            .addFields({ name: '----', value: 'Information:' })
            .addFields(
                { name: 'Location', value: location, inline: true },
                { name: 'Date', value: date, inline: true },
                { name: 'Time', value: time, inline: true },
            )
            .addFields({ name: '----', value: 'Meta' })
            .setTimestamp()
            .setFooter({ text: `Embed created by ${config.general.name}` });
        channel.send({ embeds: [embed] });
        interaction.reply({
            content: `Message created. Check your event here: <#${channel.id}>.`,
            ephemeral: true
        });
    }
};
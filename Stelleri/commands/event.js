const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ChannelType } = require('discord.js');
const config = require('../assets/config.js');
const { EmbedBuilder } = require('discord.js');
const guildUtils = require('../utils/guild.js');
const modules = require('..');
const ticket = require('../utils/ticket.js');

module.exports = {
    cooldown: config.cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Create a new event for others to participate and/or join in.')
        .addSubcommand(option => option
            .setName('physical')
            .setDescription("Create a new event that will happen somewhere in real world.")
            .addStringOption(option => option
                .setName('title')
                .setDescription('The title for your event. Max 20 characters.')
                .setRequired(true)
                .setMaxLength(20))
            .addStringOption(option => option
                .setName('description')
                .setDescription('The description for the event. What is your event all about? Max 600 characters.')
                .setRequired(true)
                .setMaxLength(600))
            .addStringOption(option => option
                .setName('location')
                .setDescription('Location for your event. Max 50 characters.')
                .setRequired(true)
                .setMaxLength(50))
            .addStringOption(option => option
                .setName('date')
                .setDescription('The date for your event. Format: 05/02/2023.')
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(10))
            .addStringOption(option => option
                .setName('time')
                .setDescription('The time when your event starts. Use the 24 hour time scale. Format: 09:15')
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(5)))
        .addSubcommand(option => option
            .setName('online')
            .setDescription("Create a new event that will happen inside this Discord server.")
            .addStringOption(option => option
                .setName('title')
                .setDescription('The title for your event. Max 20 characters.')
                .setRequired(true)
                .setMaxLength(20))
            .addStringOption(option => option
                .setName('description')
                .setDescription('The description for the event. What is your event all about? Max 600 characters.')
                .setRequired(true)
                .setMaxLength(600))
            .addChannelOption(option => option
                .setName('location')
                .setDescription('Channel for your event.')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildStageVoice, ChannelType.GuildVoice))
            .addStringOption(option => option
                .setName('date')
                .setDescription('The date for your event. Format: 05/02/2023.')
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(10))
            .addStringOption(option => option
                .setName('time')
                .setDescription('The time when your event starts. Use the 24 hour time scale. Format: 09:15')
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(5))),
    async execute(interaction) {
        // Init
        const targetGuild = guildUtils.findGuildById(interaction.guild.id);
        const eventType = interaction.options.getSubcommand();
        if (!targetGuild || !targetGuild.channel_event) return interaction.reply({
            content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
            ephemeral: true
        });

        // Inputs
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const channel = targetGuild.channel_event;
        const username = interaction.user.username;
        const pfp = interaction.user.avatarURL();
        const newTicket = ticket.createTicket();

        // Date Processing & Validation
        const rawDate = interaction.options.getString('date');
        const rawTime = interaction.options.getString('time');
        const [day, month, year] = rawDate.split("/");
        const [hour, minute] = rawTime.split(":");
        if (day > 31 || month > 12 || year > new Date().getFullYear() + 2 || hour > 23 || minute > 59) return interaction.reply({ content: "Your date/time input is invalid. Please try again.", ephemeral: true });
        let fullDate;
        try {
            fullDate = new Date(year, month - 1, day, hour, minute);
            if (isNaN(fullDate.getTime()) || fullDate < new Date()) return interaction.reply({ content: "Your date/time input is invalid. Please try again.", ephemeral: true });
        } catch (error) {
            return interaction.reply({ content: "Your date/time input is invalid. Please try again.", ephemeral: true });
        }

        const onlineBoolean = eventType === "online";
        const location = eventType === "online" ? interaction.options.getChannel("location").id : interaction.options.getString("location");
        modules.database.query("INSERT INTO event (ticket, guild_snowflake, creator_snowflake, title, description, location, date_start, online) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", [newTicket, interaction.guild.id, interaction.user.id, title, description, location, fullDate, onlineBoolean])
            .then(() => {
                // Sign Up Button
                const signUpButton = new ButtonBuilder()
                    .setCustomId(`eventSignUp_${newTicket}`)
                    .setLabel(`Sign Up`)
                    .setStyle('Primary');

                // Success Confirmation
                const embed = new EmbedBuilder()
                    .setColor(config.general.color)
                    .setTitle(title)
                    .setAuthor({ name: username, iconURL: pfp })
                    .setDescription(description)
                    .addFields(
                        { name: 'Location', value: eventType === "online" ? `<#${location}>` : location, inline: true },
                        { name: 'Date', value: `${rawDate} at ${rawTime}`, inline: true })
                    .addFields({ name: '----', value: 'Meta' })
                    .setTimestamp()
                    .setFooter({ text: `Embed created by ${config.general.name}` });
                channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(signUpButton)] });
                interaction.reply({
                    content: `Event created. Check your event here: <#${channel.id}>.`,
                    ephemeral: true
                });
            }).catch((error) => {
                console.log(error);
                return interaction.reply({
                    content: "Something went wrong while creating your event. Please try again later.",
                    ephemeral: true
                });
            });
    }
};
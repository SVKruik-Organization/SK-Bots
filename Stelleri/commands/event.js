const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ChannelType, ButtonStyle } = require('discord.js');
const config = require('../config.js');
const { EmbedBuilder } = require('discord.js');
const guildUtils = require('../utils/guild.js');
const modules = require('..');
const ticket = require('../utils/ticket.js');
const logger = require('../utils/logger.js');
const { time } = require('@discordjs/formatters');
const { datetimeParser } = require('../utils/date.js');

module.exports = {
    cooldown: config.cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('event')
        .setNameLocalizations({
            nl: "evenement"
        })
        .setDescription('Create a new event for others to participate and/or join in.')
        .setDescriptionLocalizations({
            nl: "Creëer een evenement waar anderen aan mee kunnen doen."
        })
        .setDMPermission(false)
        .addSubcommand(option => option
            .setName('physical')
            .setNameLocalizations({
                nl: "fysiek"
            })
            .setDescription("Create a new event that will happen somewhere in real world.")
            .setDescriptionLocalizations({
                nl: "Creëer een evenement dat ergens fysiek plaatsvindt."
            })
            .addStringOption(option => option
                .setName('title')
                .setNameLocalizations({
                    nl: "titel"
                })
                .setDescription('The title for your event. Max 20 characters.')
                .setDescriptionLocalizations({
                    nl: "De titel van uw evenement. Maximaal 20 karakters."
                })
                .setRequired(true)
                .setMaxLength(20))
            .addStringOption(option => option
                .setName('description')
                .setNameLocalizations({
                    nl: "omschrijving"
                })
                .setDescription('The description for the event. What is your event all about? Max 600 characters.')
                .setDescriptionLocalizations({
                    nl: "De omschrijving van uw evenement. Waar gaat het over? Maximaal 600 karakters."
                })
                .setRequired(true)
                .setMaxLength(600))
            .addStringOption(option => option
                .setName('location')
                .setNameLocalizations({
                    nl: "locatie"
                })
                .setDescription('Location for your event. Max 50 characters.')
                .setDescriptionLocalizations({
                    nl: "De fysieke locatie van uw evenement. Maximaal 50 karakters."
                })
                .setRequired(true)
                .setMaxLength(50))
            .addStringOption(option => option
                .setName('date')
                .setNameLocalizations({
                    nl: "datum"
                })
                .setDescription('The date for your event. Format: 05/02/2023.')
                .setDescriptionLocalizations({
                    nl: "De datum van uw evenement. Formaat: 05/02/2023."
                })
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(10))
            .addStringOption(option => option
                .setName('time')
                .setNameLocalizations({
                    nl: "tijd"
                })
                .setDescription('The time when your event starts. Use the 24 hour time scale. Format: 09:15.')
                .setDescriptionLocalizations({
                    nl: "De tijd wanneer uw evenement begint. Gebruik de 24 uur tijd schaal. Formaat: 09:15."
                })
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(5)))
        .addSubcommand(option => option
            .setName('online')
            .setNameLocalizations({
                nl: "online"
            })
            .setDescription("Create a new event that will happen inside this Discord server.")
            .setDescriptionLocalizations({
                nl: "Creëer een evenement dat plaatsvindt in een kanaal van deze Discord server."
            })
            .addStringOption(option => option
                .setName('title')
                .setNameLocalizations({
                    nl: "titel"
                })
                .setDescription('The title for your event. Max 20 characters.')
                .setDescriptionLocalizations({
                    nl: "De titel van uw evenement. Maximaal 20 karakters."
                })
                .setRequired(true)
                .setMaxLength(20))
            .addStringOption(option => option
                .setName('description')
                .setNameLocalizations({
                    nl: "omschrijving"
                })
                .setDescription('The description for the event. What is your event all about? Max 600 characters.')
                .setDescriptionLocalizations({
                    nl: "De omschrijving van uw evenement. Waar gaat het over? Maximaal 600 karakters."
                })
                .setRequired(true)
                .setMaxLength(600))
            .addChannelOption(option => option
                .setName('location')
                .setNameLocalizations({
                    nl: "locatie"
                })
                .setDescription('Channel for your event.')
                .setDescriptionLocalizations({
                    nl: "Het kanaal van uw evenement."
                })
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildStageVoice, ChannelType.GuildVoice))
            .addStringOption(option => option
                .setName('date')
                .setNameLocalizations({
                    nl: "datum"
                })
                .setDescription('The date for your event. Format: 05/02/2023.')
                .setDescriptionLocalizations({
                    nl: "De datum van uw evenement. Formaat: 05/02/2023."
                })
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(10))
            .addStringOption(option => option
                .setName('time')
                .setNameLocalizations({
                    nl: "tijd"
                })
                .setDescription('The time when your event starts. Use the 24 hour time scale. Format: 09:15.')
                .setDescriptionLocalizations({
                    nl: "De tijd wanneer uw evenement begint. Gebruik de 24 uur tijd schaal. Formaat: 09:15."
                })
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(5))),
    async execute(interaction) {
        try {
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
            const fullDate = datetimeParser(rawDate, rawTime);
            if (typeof fullDate === "boolean") return interaction.reply({ content: "Your date or time input is invalid. Please check your inputs try again. Also note that the event date must be into the future.", ephemeral: true });

            const onlineBoolean = eventType === "online";
            const location = eventType === "online" ? interaction.options.getChannel("location").id : interaction.options.getString("location");
            modules.database.query("INSERT INTO event (ticket, guild_snowflake, creator_snowflake, title, description, location, date_start, online, scheduled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0);", [newTicket, interaction.guild.id, interaction.user.id, title, description, location, fullDate, onlineBoolean])
                .then(() => {
                    // Sign Up Button
                    const signUpButton = new ButtonBuilder()
                        .setCustomId(`eventSignUp_${newTicket}`)
                        .setLabel(`Sign Up`)
                        .setStyle(ButtonStyle.Primary);

                    // Success Confirmation
                    const embed = new EmbedBuilder()
                        .setColor(config.colors.bot)
                        .setTitle(title)
                        .setAuthor({ name: username, iconURL: pfp })
                        .setDescription(description)
                        .addFields(
                            { name: 'Location', value: eventType === "online" ? `<#${location}>` : location, inline: true },
                            { name: 'Date', value: time(fullDate), inline: true })
                        .addFields({ name: "-----", value: 'Meta' })
                        .setTimestamp()
                        .setFooter({ text: `Embed created by ${config.general.name}` });
                    channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(signUpButton)] });
                    interaction.reply({
                        content: `Event created. Check your event here: <#${channel.id}>.`,
                        ephemeral: true
                    });
                }).catch((error) => {
                    logger.error(error);
                    return interaction.reply({
                        content: "Something went wrong while creating your event. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error) {
            logger.error(error);
        }
    }
};
const { SlashCommandBuilder, PermissionFlagsBits, GuildScheduledEventManager, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType, ChannelType } = require('discord.js');
const config = require('../config');
const modules = require('..');
const logger = require('../utils/logger');
const userUtils = require('../utils/user');
const { datetimeParser } = require('../utils/date');
const { createTicket } = require('../utils/ticket');

export default {
    cooldown: cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('scheduled')
        .setNameLocalizations({
            nl: "geplanned"
        })
        .setDescription('Create a new Scheduled Event. Only for community servers.')
        .setDescriptionLocalizations({
            nl: "Creëer een geplanned evenement. Alleen voor community servers."
        })
        .setDMPermission(false)
        .addSubcommand(option => option
            .setName('voice')
            .setDescription('An event that will take place inside a voice channel.')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel the event will take place in.')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true))
            .addStringOption(option => option
                .setName('title')
                .setNameLocalizations({
                    nl: "titel"
                })
                .setDescription('The title for your event. Max 50 characters.')
                .setDescriptionLocalizations({
                    nl: "De titel van uw evenement. Maximaal 50 karakters."
                })
                .setRequired(true)
                .setMaxLength(50))
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
                .setMaxLength(5))
            .addAttachmentOption(option => option
                .setName('cover')
                .setNameLocalizations({
                    nl: "omslagfoto"
                })
                .setDescription('An optional cover image.')
                .setDescriptionLocalizations({
                    nl: "Een optionele omslag/banner afbeelding."
                })
                .setRequired(false)))
        .addSubcommand(option => option
            .setName('stage')
            .setDescription('An event that will take place inside a stage channel.')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel the event will take place in.')
                .addChannelTypes(ChannelType.GuildStageVoice)
                .setRequired(true))
            .addStringOption(option => option
                .setName('title')
                .setNameLocalizations({
                    nl: "titel"
                })
                .setDescription('The title for your event. Max 50 characters.')
                .setDescriptionLocalizations({
                    nl: "De titel van uw evenement. Maximaal 50 karakters."
                })
                .setRequired(true)
                .setMaxLength(50))
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
                .setMaxLength(5))
            .addAttachmentOption(option => option
                .setName('cover')
                .setNameLocalizations({
                    nl: "omslagfoto"
                })
                .setDescription('An optional cover image.')
                .setDescriptionLocalizations({
                    nl: "Een optionele omslag/banner afbeelding."
                })
                .setRequired(false)))
        .addSubcommand(option => option
            .setName('external')
            .setDescription('An event that will take place elsewhere.')
            .addStringOption(option => option
                .setName('location')
                .setDescription('The location the event will take place at. Max 100 characters.')
                .setNameLocalizations({
                    nl: "locatie"
                })
                .setDescriptionLocalizations({
                    nl: "De locatie waar uw evenement plaats zal vinden. Maximaal 100 karakters."
                })
                .setMaxLength(100)
                .setRequired(true))
            .addStringOption(option => option
                .setName('title')
                .setNameLocalizations({
                    nl: "titel"
                })
                .setDescription('The title for your event. Max 50 characters.')
                .setDescriptionLocalizations({
                    nl: "De titel van uw evenement. Maximaal 50 karakters."
                })
                .setRequired(true)
                .setMaxLength(50))
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
                    nl: "starttijd"
                })
                .setDescription('The time when your event starts. Use the 24 hour time scale. Format: 09:15.')
                .setDescriptionLocalizations({
                    nl: "De tijd wanneer uw evenement begint. Gebruik de 24 uur tijd schaal. Formaat: 09:15."
                })
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(5))
            .addStringOption(option => option
                .setName('endtime')
                .setNameLocalizations({
                    nl: "eindtijd"
                })
                .setDescription('The time when your event ends. Use the 24 hour time scale. Format: 09:15.')
                .setDescriptionLocalizations({
                    nl: "De tijd wanneer uw evenement eindigt. Gebruik de 24 uur tijd schaal. Formaat: 09:15."
                })
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(5))
            .addAttachmentOption(option => option
                .setName('cover')
                .setNameLocalizations({
                    nl: "omslagfoto"
                })
                .setDescription('An optional cover image.')
                .setDescriptionLocalizations({
                    nl: "Een optionele omslag/banner afbeelding."
                })
                .setRequired(false)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Permission Validation
            if (!(await checkAdmin(interaction))) return interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Please try again later, or contact moderation to receive elevated permissions.`,
                ephemeral: true
            });

            await return interaction.reply({
                content: `Creating scheduled event. One moment please.`,
                ephemeral: true
            });

            // Setup
            const eventType = interaction.options.getSubcommand();
            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description');
            const rawDate = interaction.options.getString('date');
            const rawTime = interaction.options.getString('time');
            const parsedDate = datetimeParser(rawDate, rawTime);
            if (typeof parsedDate === "boolean") return interaction.editReply({ content: "Your date or time input is invalid. Please check your inputs try again. Also note that the event date must be into the future.", ephemeral: true });
            const eventManager = new GuildScheduledEventManager(interaction.guild);
            const image = interaction.options.getAttachment('cover');

            // Event Object
            const eventObject = {
                name: title,
                scheduledStartTime: parsedDate,
                privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                description: description,
                reason: `Scheduled Event ${general.name} Command`
            }

            if (image) {
                const validExtensions = ["image/png", "image/gif", "image/jpeg", "image/webp"];
                if (!validExtensions.includes(image.contentType)) {
                    return interaction.followUp({
                        content: "The file you uploaded is not supported. Please choose an image and try again.",
                        ephemeral: true
                    });
                } else eventObject.image = image.url;
            }

            // Payload Loading
            if (eventType === "voice") {
                eventObject.channel = interaction.options.getChannel('channel').id;
                eventObject.entityType = GuildScheduledEventEntityType.Voice;
            } else if (eventType === "stage") {
                eventObject.channel = interaction.options.getChannel('channel').id;
                eventObject.entityType = GuildScheduledEventEntityType.StageInstance;
            } else if (eventType === "external") {
                eventObject.entityMetadata = { location: interaction.options.getString('location') };
                eventObject.entityType = GuildScheduledEventEntityType.External;
                const endDate = datetimeParser(rawDate, interaction.options.getString('endtime'));
                if (typeof endDate === "boolean") return interaction.editReply({ content: "Your date or time input is invalid. Please check your inputs try again. Also note that the event date must be into the future.", ephemeral: true });
                eventObject.scheduledEndTime = endDate;
            }

            // Database Processing
            const onlineTypes = ["voice", "stage"];
            const processedLocation = onlineTypes.includes(eventType) ? interaction.options.getChannel('channel').id : interaction.options.getString('location');
            const processedOnline = onlineTypes.includes(eventType) ? 1 : 0;

            // Creation
            eventManager.create(eventObject)
                .then((data) => {
                    interaction.followUp({
                        content: "Scheduled event successfully created. You can view it at the top-left of the screen. There, you can register for this event.",
                        ephemeral: true
                    });
                    database.query("INSERT INTO event (ticket, payload, guild_snowflake, creator_snowflake, title, description, location, online, scheduled, date_start) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [createTicket(), data.id, interaction.guild.id, interaction.user.id, title, description, processedLocation, processedOnline, 1, parsedDate])
                        .catch((error) => logError(error));
                }).catch((error: any) => {
                    logError(error);
                    interaction.followUp({
                        content: "Something went wrong while creating the scheduled event. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error: any) {
            logError(error);
        }
    }
};
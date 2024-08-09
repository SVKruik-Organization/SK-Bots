import { SlashCommandBuilder, PermissionFlagsBits, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType, ChannelType, ChatInputCommandInteraction, GuildScheduledEventCreateOptions, GuildScheduledEvent } from 'discord.js';
import { Command } from '../types.js';
import { cooldowns, general } from '../config.js';
import { database } from '../index.js';
import { logError } from '../utils/logger.js';
import { checkAdmin } from '../utils/user.js';
import { datetimeParser } from '../utils/date.js';
import { createTicket } from '../utils/ticket.js';

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
                .setDescription('The description for the event. What is your event all about? Max 950 characters.')
                .setDescriptionLocalizations({
                    nl: "De omschrijving van uw evenement. Waar gaat het over? Maximaal 950 karakters."
                })
                .setRequired(true)
                .setMaxLength(950))
            .addStringOption(option => option
                .setName('date')
                .setNameLocalizations({
                    nl: "datum"
                })
                .setDescription('The date for your event. Format: DD/MM/YYYY.')
                .setDescriptionLocalizations({
                    nl: "De datum van uw evenement. Formaat: DD/MM/YYYY."
                })
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(10))
            .addStringOption(option => option
                .setName('time')
                .setNameLocalizations({
                    nl: "tijd"
                })
                .setDescription('The time when your event starts. Use the 24 hour time scale. Format: HH:MM.')
                .setDescriptionLocalizations({
                    nl: "De tijd wanneer uw evenement begint. Gebruik de 24 uur tijd schaal. Formaat: HH:MM."
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
                .setDescription('The description for the event. What is your event all about? Max 950 characters.')
                .setDescriptionLocalizations({
                    nl: "De omschrijving van uw evenement. Waar gaat het over? Maximaal 950 karakters."
                })
                .setRequired(true)
                .setMaxLength(950))
            .addStringOption(option => option
                .setName('date')
                .setNameLocalizations({
                    nl: "datum"
                })
                .setDescription('The date for your event. Format: DD/MM/YYYY.')
                .setDescriptionLocalizations({
                    nl: "De datum van uw evenement. Formaat: DD/MM/YYYY."
                })
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(10))
            .addStringOption(option => option
                .setName('time')
                .setNameLocalizations({
                    nl: "tijd"
                })
                .setDescription('The time when your event starts. Use the 24 hour time scale. Format: HH:MM.')
                .setDescriptionLocalizations({
                    nl: "De tijd wanneer uw evenement begint. Gebruik de 24 uur tijd schaal. Formaat: HH:MM."
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
                .setDescription('The description for the event. What is your event all about? Max 950 characters.')
                .setDescriptionLocalizations({
                    nl: "De omschrijving van uw evenement. Waar gaat het over? Maximaal 950 karakters."
                })
                .setRequired(true)
                .setMaxLength(950))
            .addStringOption(option => option
                .setName('date')
                .setNameLocalizations({
                    nl: "datum"
                })
                .setDescription('The date for your event. Format: DD/MM/YYYY.')
                .setDescriptionLocalizations({
                    nl: "De datum van uw evenement. Formaat: DD/MM/YYYY."
                })
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(10))
            .addStringOption(option => option
                .setName('time')
                .setNameLocalizations({
                    nl: "starttijd"
                })
                .setDescription('The time when your event starts. Use the 24 hour time scale. Format: HH:MM.')
                .setDescriptionLocalizations({
                    nl: "De tijd wanneer uw evenement begint. Gebruik de 24 uur tijd schaal. Formaat: HH:MM."
                })
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(5))
            .addStringOption(option => option
                .setName('endtime')
                .setNameLocalizations({
                    nl: "eindtijd"
                })
                .setDescription('The time when your event ends. Use the 24 hour time scale. Format: HH:MM.')
                .setDescriptionLocalizations({
                    nl: "De tijd wanneer uw evenement eindigt. Gebruik de 24 uur tijd schaal. Formaat: HH:MM."
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
            if (!interaction.guild) return;
            if (!(await checkAdmin(interaction))) return await interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Please try again later, or contact moderation to receive elevated permissions.`,
                ephemeral: true
            });

            await interaction.reply({
                content: `Creating scheduled event. One moment please.`,
                ephemeral: true
            });

            // Setup
            const eventType: string = interaction.options.getSubcommand();
            const title: string = interaction.options.getString("title") as string;
            const description: string = interaction.options.getString("description") as string;
            const rawDate: string = interaction.options.getString("date") as string;
            const rawTime: string = interaction.options.getString("time") as string;
            const parsedDate: Date | boolean = datetimeParser(rawDate, rawTime);
            if (typeof parsedDate === "boolean") return interaction.editReply({ content: "Your date or time input is invalid. Please check your inputs try again. Also note that the event date must be into the future." });
            const image = interaction.options.getAttachment('cover');

            // Event Object
            const eventObject: any = {
                name: title,
                scheduledStartTime: parsedDate,
                privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                description: description + " - Created by ",
                reason: `Scheduled Event ${general.name} Command`
            }

            if (image) {
                const validExtensions = ["image/png", "image/gif", "image/jpeg", "image/webp"];
                if (!validExtensions.includes(image.contentType as string)) {
                    return interaction.followUp({
                        content: "The file you uploaded is not supported. Please choose an image and try again.",
                        ephemeral: true
                    });
                } else eventObject.image = image.url;
            }

            // Payload Loading
            if (eventType === "voice") {
                eventObject.channel = interaction.options.getChannel("channel")?.id;
                eventObject.entityType = GuildScheduledEventEntityType.Voice;
            } else if (eventType === "stage") {
                eventObject.channel = interaction.options.getChannel("channel")?.id;
                eventObject.entityType = GuildScheduledEventEntityType.StageInstance;
            } else if (eventType === "external") {
                eventObject.entityMetadata = { location: interaction.options.getString("location") as string };
                eventObject.entityType = GuildScheduledEventEntityType.External;
                const endDate = datetimeParser(rawDate, interaction.options.getString("endtime") as string);
                if (typeof endDate === "boolean") return interaction.editReply({ content: "Your date or time input is invalid. Please check your inputs try again. Also note that the event date must be into the future." });
                eventObject.scheduledEndTime = endDate;
            }

            // Database Pre-Processing
            const onlineTypes = ["voice", "stage"];
            const processedLocation = onlineTypes.includes(eventType) ? interaction.options.getChannel("channel")?.id : interaction.options.getString('location');
            const processedOnline = onlineTypes.includes(eventType) ? 1 : 0;

            // Creation
            try {
                const eventPayload: GuildScheduledEventCreateOptions = eventObject;
                const data: GuildScheduledEvent = await interaction.guild.scheduledEvents.create(eventPayload);
                if (!interaction.guild) return;
                interaction.followUp({
                    content: "Scheduled event successfully created. You can view it at the top-left of the screen. There, you can register for this event.",
                    ephemeral: true
                });
                await database.query("INSERT INTO event (ticket, payload, guild_snowflake, creator_snowflake, title, description, location, online, scheduled, date_start) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [createTicket(), data.id, interaction.guild.id, interaction.user.id, title, description, processedLocation, processedOnline, 1, parsedDate]);
            } catch (error: any) {
                logError(error);
                interaction.followUp({
                    content: "Something went wrong while creating the scheduled event. Please try again later.",
                    ephemeral: true
                });
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
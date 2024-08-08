import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ChannelType, ButtonStyle, ChatInputCommandInteraction, TextBasedChannel } from 'discord.js';
import { cooldowns, colors, general } from '../config';
import { EmbedBuilder } from 'discord.js';
import { findGuildById } from '../utils/guild';
import { database } from '..';
import { createTicket } from '../utils/ticket';
import { logError } from '../utils/logger';
import { time } from '@discordjs/formatters';
import { datetimeParser } from '../utils/date';
import { Command, GuildFull } from '../types';

export default {
    cooldown: cooldowns.D,
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
                .setDescription('The description for the event. What is your event all about? Max 950 characters.')
                .setDescriptionLocalizations({
                    nl: "De omschrijving van uw evenement. Waar gaat het over? Maximaal 950 karakters."
                })
                .setRequired(true)
                .setMaxLength(950))
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
                .setDescription('The description for the event. What is your event all about? Max 950 characters.')
                .setDescriptionLocalizations({
                    nl: "De omschrijving van uw evenement. Waar gaat het over? Maximaal 950 karakters."
                })
                .setRequired(true)
                .setMaxLength(950))
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
                .setMaxLength(5))),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Init
            if (!interaction.guild) return;
            const targetGuild: GuildFull | undefined = findGuildById(interaction.guild.id);
            if (!targetGuild || !targetGuild.channel_event) return await interaction.reply({
                content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
                ephemeral: true
            });
            const eventType: string = interaction.options.getSubcommand();


            // Inputs
            const title: string = interaction.options.getString("title") as string;
            const description: string = interaction.options.getString("description") as string;
            const channel: TextBasedChannel = targetGuild.channel_event;
            const username: string = interaction.user.username;
            const pfp: string = interaction.user.avatarURL() as string;
            const newTicket: string = createTicket();

            // Date Processing & Validation
            const rawDate: string = interaction.options.getString("date") as string;
            const rawTime: string = interaction.options.getString("time") as string;
            const fullDate: Date | boolean = datetimeParser(rawDate, rawTime);
            if (typeof fullDate === "boolean") return await interaction.reply({ content: "Your date or time input is invalid. Please check your inputs try again. Also note that the event date must be into the future.", ephemeral: true });

            const onlineBoolean = eventType === "online";
            const location: string = (eventType === "online" ? interaction.options.getChannel("location")?.id : interaction.options.getString("location")) as string;
            database.query("INSERT INTO event (ticket, guild_snowflake, creator_snowflake, title, description, location, date_start, online, scheduled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0);", [newTicket, interaction.guild.id, interaction.user.id, title, description, location, fullDate, onlineBoolean])
                .then(async () => {
                    // Sign Up Button
                    const signUpButton: ButtonBuilder = new ButtonBuilder()
                        .setCustomId(`eventSignUp_${newTicket}`)
                        .setLabel(`Sign Up`)
                        .setStyle(ButtonStyle.Primary);

                    // Success Confirmation
                    const embed: EmbedBuilder = new EmbedBuilder()
                        .setColor(colors.bot)
                        .setTitle(title)
                        .setAuthor({ name: username, iconURL: pfp })
                        .setDescription(description)
                        .addFields(
                            { name: 'Location', value: eventType === "online" ? `<#${location}>` : location, inline: true },
                            { name: 'Date', value: time(fullDate), inline: true })
                        .addFields({ name: "-----", value: 'Meta' })
                        .setTimestamp()
                        .setFooter({ text: `Embed created by ${general.name}` });
                    channel.send({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(signUpButton)] });
                    return await interaction.reply({
                        content: `Event created. Check your event here: <#${channel.id}>.`,
                        ephemeral: true
                    });
                }).catch(async (error: any) => {
                    logError(error);
                    return await interaction.reply({
                        content: "Something went wrong while creating your event. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
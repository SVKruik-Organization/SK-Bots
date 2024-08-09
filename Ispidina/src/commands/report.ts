import { SlashCommandBuilder, ChatInputCommandInteraction, User } from 'discord.js';
import { database } from '../index.js';
import { cooldowns } from '../config.js';
import { logError, logMessage } from '../utils/logger.js';
import { findGuildById } from '../utils/guild.js';
import { Command, GuildFull } from '../types.js';

export default {
    cooldown: cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('report')
        .setNameLocalizations({
            nl: "rapporteren"
        })
        .setDescription('Report someone for breaking the rules. We will have a look at it ASAP.')
        .setDescriptionLocalizations({
            nl: "Rapporteer iemand voor het overtreden van de regels. We zullen er zo snel mogelijk naar kijken."
        })
        .setDMPermission(false)
        .addUserOption(option => option
            .setName('target')
            .setNameLocalizations({
                nl: "gebruiker"
            })
            .setDescription('The target member.')
            .setDescriptionLocalizations({
                nl: "De betreffende gebruiker."
            })
            .setRequired(true))
        .addStringOption(option => option
            .setName('category')
            .setNameLocalizations({
                nl: "categorie"
            })
            .setDescription('Type of report.')
            .setDescriptionLocalizations({
                nl: "Het type overtreding."
            })
            .setRequired(true)
            .addChoices(
                { name: 'Swearing', value: 'Swearing' },
                { name: 'Bullying', value: 'Bullying' },
                { name: 'Scamming', value: 'Scamming' },
                { name: 'Exploiting', value: 'Exploiting' },
                { name: 'Dating', value: 'Dating' },
                { name: 'Harassment', value: 'Harassment' },
                { name: 'Spamming', value: 'Spamming' },
                { name: 'Other (Please specify)', value: 'Other' }))
        .addStringOption(option => option
            .setName('reason')
            .setNameLocalizations({
                nl: "rede"
            })
            .setDescription('What did the user do wrong? What rules did they break? Max 1000 characters.')
            .setDescriptionLocalizations({
                nl: "Wat heeft deze gebruiker fout gedaan? Welke regels zijn er verbroken? Max 1000 karakters."
            })
            .setRequired(true)
            .setMaxLength(1000)),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.guild) return;
            const snowflake: string = interaction.user.id;
            const username: string = interaction.user.username;
            const target: User = interaction.options.getUser("target") as User;
            const reason: string = interaction.options.getString("reason") as string;
            const category: string = interaction.options.getString("category") as string;

            try {
                await database.query("INSERT INTO report (snowflake, snowflake_recv, reason, date, category, guild_snowflake) VALUES (?, ?, ?, CURRENT_TIMESTAMP(), ?, ?);",
                    [snowflake, target.id, reason, category, interaction.guild.id]);
                if (!interaction.guild) return;
                const targetGuild: GuildFull | undefined = findGuildById(interaction.guild.id);
                if (targetGuild && targetGuild.channel_admin) targetGuild.channel_admin.send({ content: `User <@${interaction.user.id}> has **reported** <@${target.id}> for: \`${reason}\`` });
                logMessage(`'${username}@${snowflake}' has reported '${target.username}@${target.id}' for ${category}.`, "warning");

                return await interaction.reply({
                    content: "Thank you for your report. We will have a look at it ASAP.",
                    ephemeral: true
                });
            } catch (error: any) {
                logError(error);
                return await interaction.reply({
                    content: "Something went wrong while reporting this user. Please try again later.",
                    ephemeral: true
                });
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
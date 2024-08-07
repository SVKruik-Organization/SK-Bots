const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../config');
const logger = require('../utils/logger');
const guildUtils = require('../utils/guild');

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
            const snowflake = interaction.user.id;
            const username = interaction.user.username;
            const target = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason');
            const category = interaction.options.getString('category');

            database.query("INSERT INTO report (snowflake, snowflake_recv, reason, date, category, guild_snowflake) VALUES (?, ?, ?, CURRENT_TIMESTAMP(), ?, ?);",
                [snowflake, target.id, reason, category, interaction.guild.id])
                .then(() => {
                    const targetGuild = findGuildById(interaction.guild.id);
                    if (targetGuild && targetGuild.channel_admin) targetGuild.channel_admin.send({ content: `User <@${interaction.user.id}> has **reported** <@${target.id}> for: \`${reason}\`` });
                    logMessage(`'${username}@${snowflake}' has reported '${target.username}@${target.id}' for ${category}.`, "warning");

                    return interaction.reply({
                        content: "Thank you for your report. We will have a look at it ASAP.",
                        ephemeral: true
                    });
                }).catch((error: any) => {
                    logError(error);
                    return interaction.reply({
                        content: "Something went wrong while reporting this user. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error: any) {
            logError(error);
        }
    }
};
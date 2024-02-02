const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');
const guildUtils = require('../utils/guild.js');

module.exports = {
    cooldown: config.cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Report someone for breaking the rules. We will have a look at it.')
        .addUserOption(option => option
            .setName('target')
            .setDescription('The target member.')
            .setRequired(true))
        .addStringOption(option => option
            .setName('category')
            .setDescription('Type of report.')
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
            .setDescription('What did the user do wrong? What rules did they break? Max 1000 characters.')
            .setRequired(true)
            .setMaxLength(1000)),
    async execute(interaction) {
        try {
            const snowflake = interaction.user.id;
            const username = interaction.user.username;
            const target = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason');
            const category = interaction.options.getString('category');

            modules.database.query("INSERT INTO report (snowflake, snowflake_recv, reason, date, category, guild_snowflake) VALUES (?, ?, ?, CURRENT_TIMESTAMP(), ?, ?);",
                [snowflake, target.id, reason, category, interaction.guild.id])
                .then(() => {
                    const targetGuild = guildUtils.findGuildById(interaction.guild.id);
                    if (targetGuild && targetGuild.channel_admin) targetGuild.channel_admin.send({ content: `User <@${interaction.user.id}> has **reported** <@${target.id}> for: \`${reason}\`` });
                    logger.log(`'${username}@${snowflake}' has reported '${target.username}@${target.id}' for ${category}.`, "warning");

                    interaction.reply({
                        content: "Thank you for your report. We will have a look at it ASAP.",
                        ephemeral: true
                    });
                }).catch((error) => {
                    console.log(error);
                    return interaction.reply({
                        content: "Something went wrong while reporting this user. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error) {
            console.error(error);
        }
    }
};
const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const guildUtils = require('../utils/guild.js');
const embedConstructor = require('../utils/embed.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('server')
        .setNameLocalizations({
            nl: "server"
        })
        .setDescription('Show some server statistics.')
        .setDescriptionLocalizations({
            nl: "Laat wat server statistieken zien."
        }),
    async execute(interaction) {
        try {
            // Setup
            const targetGuild = guildUtils.findGuildById(interaction.guild.id);
            if (!targetGuild) return interaction.reply({
                content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
                ephemeral: true
            });
            const rawDate = targetGuild.guildObject.createdAt;
            const date = `${rawDate.getDate()}/${rawDate.getMonth() + 1}/${rawDate.getFullYear()}`;
            const embed = embedConstructor.create("Server Statistics", interaction.guild.name, interaction.user,
                [
                    {
                        name: 'Members',
                        value: `\`${interaction.guild.memberCount}\``
                    },
                    {
                        name: 'Created',
                        value: `${date}`
                    },
                    {
                        name: 'Owner',
                        value: `<@${interaction.guild.ownerId}>`
                    },
                    {
                        name: 'Rules Channel',
                        value: targetGuild.channel_rules ? `<#${targetGuild.channel_rules.id}>` : "Not Configured"
                    }
                ], ["statistics"]);
            interaction.reply({ embeds: [embed] });
        } catch (error) {
            logger.error(error);
        }
    },
    guildSpecific: true
};
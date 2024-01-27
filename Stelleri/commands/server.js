const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const guildUtils = require('../utils/guild.js');
const embedConstructor = require('../utils/embed.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Show some server statistics.'),
    async execute(interaction) {
        const targetGuild = guildUtils.findGuildById(interaction.guild.id);
        if (!targetGuild) return interaction.reply({
            content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
            ephemeral: true
        });
        const rawDate = targetGuild.guildObject.createdAt;
        const date = `${rawDate.getDate()}/${rawDate.getMonth() + 1}/${rawDate.getFullYear()}`;

        const embed = embedConstructor.create("Server Statistics", "Information", interaction,
            [
                {
                    name: 'Name',
                    value: `${targetGuild.guildObject.name}`
                },
                {
                    name: 'Members',
                    value: `\`${targetGuild.guildObject.members.cache.filter(member => !member.user.bot).size}\``
                },
                {
                    name: 'Created',
                    value: `${date}`
                },
                {
                    name: 'Owner',
                    value: `<@${targetGuild.guildObject.ownerId}>`
                },
                {
                    name: 'Rules Channel',
                    value: targetGuild.channel_rules ? `<#${targetGuild.channel_rules.id}>` : "Not Configured"
                }
            ]);
        interaction.reply({ embeds: [embed] });
    }
};
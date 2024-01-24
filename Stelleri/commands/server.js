const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const { EmbedBuilder } = require('discord.js');
const modules = require('..');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Show some server statistics.'),
    async execute(interaction) {
        const targetGuild = modules.findGuildById(interaction.guild.id);
        if (!targetGuild || !targetGuild.bot_count) return interaction.reply({
            content: "This is a server-specific command, and this server is not configured to support it. Please try again later.",
            ephemeral: true
        });
        const username = interaction.user.username;
        const pfp = interaction.user.avatarURL();
        const rawDate = targetGuild.guildObject.createdAt;
        const date = `${rawDate.getDate()}/${rawDate.getMonth() + 1}/${rawDate.getFullYear()}`;

        const embed = new EmbedBuilder()
            .setColor(config.general.color)
            .setTitle("Server Statistics")
            .setAuthor({ name: username, iconURL: pfp })
            .addFields({ name: '----', value: 'List' })
            .addFields(
                { name: 'Name', value: `${targetGuild.guildObject.name}` },
                { name: 'Members', value: `\`${targetGuild.guildObject.memberCount - targetGuild.bot_count}\`` },
                { name: 'Created', value: `${date}` },
                { name: 'Owner', value: `<@${targetGuild.guildObject.ownerId}>` },
                { name: 'Rules', value: targetGuild.channel_rules ? `<#${targetGuild.channel_rules.id}>` : "None" }
            )
            .addFields({ name: '----', value: 'Meta' })
            .setTimestamp()
            .setFooter({ text: `Embed created by ${config.general.name}` });
        interaction.reply({ embeds: [embed] });
    }
};
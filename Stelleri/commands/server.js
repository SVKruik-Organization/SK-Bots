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
        const guild = modules.client.guilds.cache.get(interaction.guildId);
        const username = interaction.user.username;
        const pfp = interaction.user.avatarURL();
        const rawDate = guild.createdAt;
        const date = `${rawDate.getDate()}/${rawDate.getMonth() + 1}/${rawDate.getFullYear()}`;

        const embed = new EmbedBuilder()
            .setColor(config.general.color)
            .setTitle("Server Statistics")
            .setAuthor({ name: username, iconURL: pfp })
            .addFields({ name: '----', value: 'List' })
            .addFields(
                { name: 'Name', value: `${guild.name}` },
                { name: 'Members', value: `\`${guild.memberCount - config.general.memberCountOffset}\`` },
                { name: 'Created', value: `${date}` },
                { name: 'Owner', value: `<@${guild.ownerId}>` },
                { name: 'Rules', value: `<#${guild.rulesChannelId}>` }
            )
            .addFields({ name: '----', value: 'Meta' })
            .setTimestamp()
            .setFooter({ text: `Embed created by ${config.general.name}` });
        interaction.reply({ embeds: [embed] });
    }
};
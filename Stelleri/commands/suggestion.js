const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const { EmbedBuilder } = require('discord.js');
const modules = require('..');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('suggestion')
        .setDescription('Pitch a new idea for the project!')
        .addStringOption(option => option.setName('title').setDescription('The title for your suggestion. Max 50 characters.').setRequired(true).setMaxLength(50))
        .addStringOption(option => option.setName('description').setDescription('The description. Pitch your idea, explain why and how to implement. Max 600 characters.').setRequired(true).setMaxLength(600)),
    async execute(interaction) {
        const targetGuild = modules.findGuildById(interaction.guild.id);
        if (!targetGuild || !targetGuild.channel_suggestion) return interaction.reply({
            content: "This is a server-specific command, and this server is not configured to support it. Please try again later.",
            ephemeral: true
        });
        const channel = targetGuild.channel_suggestion;
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const username = interaction.user.username;
        const pfp = interaction.user.avatarURL();

        const embed = new EmbedBuilder()
            .setColor(config.general.color)
            .setTitle(`New Suggestion: ${title}`)
            .setAuthor({ name: username, iconURL: pfp })
            .setDescription(`${description}`)
            .addFields({ name: '----', value: 'Meta' })
            .setTimestamp()
            .setFooter({ text: `Embed created by ${config.general.name}` });
        const embedMessage = await channel.send({ embeds: [embed] });
        await embedMessage.react('🟢');
        await embedMessage.react('🔴');
        interaction.reply({
            content: `Message created. Check your event here: <#${channel.id}>.`,
            ephemeral: true
        });
    }
};
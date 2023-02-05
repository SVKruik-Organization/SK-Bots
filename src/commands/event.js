const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Create a new event in the event channel. Users can see when a new meeting takes place.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('title').setDescription('Your 4-digit pincode you chose when registering your account.').setRequired(true).setMaxLength(20))
        .addStringOption(option => option.setName('description').setDescription('Your 4-digit pincode you chose when registering your account.').setRequired(true).setMaxLength(500))
        .addStringOption(option => option.setName('location').setDescription('Your 4-digit pincode you chose when registering your account.').setRequired(true).setMaxLength(50))
        .addStringOption(option => option.setName('date').setDescription('Your 4-digit pincode you chose when registering your account.').setRequired(true).setMaxLength(10))
        .addStringOption(option => option.setName('time').setDescription('Your 4-digit pincode you chose when registering your account.').setRequired(true).setMaxLength(5)),

    async execute(interaction) {
        const client = require('..');
        const channel = client.channels.cache.get(config.general.eventChannel);

        const name = interaction.user.username;
        const pfp = interaction.user.avatarURL();
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const location = interaction.options.getString('location');
        const date = interaction.options.getString('date');
        const time = interaction.options.getString('time');


        const embed = new EmbedBuilder()
            .setColor(config.general.color)
            .setTitle(title)
            .setAuthor({ name: name, iconURL: pfp })
            .setDescription(description)
            .addFields({ name: '----', value: 'Information:' })
            .addFields(
                { name: 'Location', value: location, inline: true },
                { name: 'Date', value: date, inline: true },
                { name: 'Time', value: time, inline: true },
            )
            .addFields({ name: '----', value: 'Meta:' })
            .setTimestamp()
            .setFooter({ text: 'Embed created by Stelleri' });

        channel.send({ embeds: [embed] });

        await interaction.reply(`Message created. Check your event here: <#${config.general.eventChannel}>.`);
    },
};
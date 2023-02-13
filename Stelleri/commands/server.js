const { SlashCommandBuilder, Guild } = require('discord.js');
const config = require('../assets/config.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Show some server statistics.'),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const guild = modules.client.guilds.cache.get(config.general.guildId);
        const name = interaction.user.username;
        const pfp = interaction.user.avatarURL();
        const rawDate = guild.createdAt;
        const date = `${rawDate.getDate()}/${rawDate.getMonth() + 1}/${rawDate.getFullYear()}`

        const embed = new EmbedBuilder()
            .setColor(config.general.color)
            .setTitle("Server Statistics")
            .setAuthor({ name: name, iconURL: pfp })
            .addFields({ name: '----', value: 'List' })
            .addFields(
                { name: 'Name', value: `${guild.name}` },
                { name: 'Members', value: `\`${guild.memberCount}\`` },
                { name: 'Created', value: `${date}` },
                { name: 'Owner', value: `<@${guild.ownerId}>` },
                { name: 'Rules', value: `<#${guild.rulesChannelId}>` }

            )
            .addFields({ name: '----', value: 'Meta' })
            .setTimestamp()
            .setFooter({ text: 'Embed created by Stelleri' })
        interaction.reply({ embeds: [embed] });

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(err => {
                return console.log("[WARNING] Command usage increase unsuccessful, user does not have an account yet.\n");
            });
    },
};
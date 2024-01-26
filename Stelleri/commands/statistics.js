const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const fs = require('fs');
const embedConstructor = require('../utils/embed.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('statistics')
        .setDescription('Let the bot display some statistics.'),
    async execute(interaction) {
        const commands = fs.readdirSync("commands").length;
        const hours = Math.floor(modules.client.uptime / 3600000) % 24;
        const minutes = Math.floor(modules.client.uptime / 60000) % 60;
        const uptime = `\`${hours}\` hours and \`${minutes}\` minutes.`

        const embed = embedConstructor.create("Bot Statistics", "Information", interaction,
            [
                { name: 'Name', value: `**${config.general.name}**` },
                { name: 'Creator', value: `<@${config.general.creatorId}>` },
                { name: 'Uptime', value: uptime },
                { name: 'Ping', value: `\`${modules.client.ws.ping}\`ms` },
                { name: 'Commands', value: `\`${commands}\` Total` },
                { name: 'Repository', value: config.general.repository },
                { name: 'Version', value: `\`v2.3.0\`` }
            ]);
        interaction.reply({ embeds: [embed] });
    }
};
const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const fs = require('fs');
const embedConstructor = require('../utils/embed.js');
const logger = require('../utils/logger.js');
const { version } = require('../package.json');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('statistics')
        .setNameLocalizations({
            nl: "statistieken"
        })
        .setDescription(`Let ${config.general.name} display some statistics.`)
        .setDescriptionLocalizations({
            nl: `Laat ${config.general.name} enkele statistieken weergeven.`
        }),
    async execute(interaction) {
        try {
            const commands = fs.readdirSync("commands").length;
            const hours = Math.floor(interaction.client.uptime / 3600000) % 24;
            const minutes = Math.floor(interaction.client.uptime / 60000) % 60;
            const uptime = `\`${hours}\` hours and \`${minutes}\` minutes.`

            const embed = embedConstructor.create("Bot Statistics", `${config.general.name} Information`, interaction.user,
                [
                    { name: 'Name', value: `**${config.general.name}**` },
                    { name: 'Servers', value: `\`${interaction.client.guilds.cache.size}\` Total` },
                    { name: 'Creator', value: `<@${config.general.creatorId}>` },
                    { name: 'Uptime', value: uptime },
                    { name: 'Ping', value: `\`${Math.abs(interaction.client.ws.ping)}\`ms` },
                    { name: 'Commands', value: `\`${commands}\` Total` },
                    { name: 'Repository', value: config.general.repository },
                    { name: 'Version', value: `\`${version}\`` }
                ], ["server"]);
            interaction.reply({ embeds: [embed] });
        } catch (error) {
            logger.error(error);
        }
    }
};
const { SlashCommandBuilder } = require('discord.js');
const config = require('../config');
const fs = require('fs');
const embedConstructor = require('../utils/embed');
const logger = require('../utils/logger');
const { version } = require('../package.json');

export default {
    cooldown: cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('statistics')
        .setNameLocalizations({
            nl: "statistieken"
        })
        .setDescription(`Let ${general.name} display some statistics.`)
        .setDescriptionLocalizations({
            nl: `Laat ${general.name} enkele statistieken weergeven.`
        })
        .setDMPermission(true),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const commands = fs.readdirSync("commands").length;
            const hours = Math.floor(interaction.client.uptime / 3600000) % 24;
            const minutes = Math.floor(interaction.client.uptime / 60000) % 60;
            const uptime = `\`${hours}\` hours and \`${minutes}\` minutes.`

            const embed = embedConstructor.create("Bot Statistics", `${general.name} Information`, interaction.user,
                [
                    { name: 'Name', value: `**${general.name}**` },
                    { name: 'Servers', value: `\`${interaction.client.guilds.cache.size}\` Total` },
                    { name: 'Creator', value: `<@${general.authorId}>` },
                    { name: 'Uptime', value: uptime },
                    { name: 'Ping', value: `\`${Math.abs(interaction.client.ws.ping)}\`ms` },
                    { name: 'Commands', value: `\`${commands}\` Total` },
                    { name: 'Docs', value: `[platform.stefankruik.com/documentation](${urls.docs})` },
                    { name: 'Version', value: `\`${version}\`` }
                ], ["server"]);
            return interaction.reply({ embeds: [embed] });
        } catch (error: any) {
            logError(error);
        }
    }
};
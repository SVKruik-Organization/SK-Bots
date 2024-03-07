const { EmbedBuilder } = require('discord.js');
const config = require('../assets/config.js');

/**
 * Default Discord.JS Embed constructor.
 * @param {string} title The title of the embed.
 * @param {string} subfieldTitle The sub-header of the embed.
 * @param {object} user Discord User Object.
 * @param {Array<object>} fields The fields to add. Needs to have a 'name' and 'value' key.
 * @param {Array<string>} relatedCommands Array of related commands to display for the user.
 * @returns The constructed embed.
 */
function create(title, subfieldTitle, user, fields, relatedCommands) {
    const embed = new EmbedBuilder()
        .setColor(config.general.color)
        .setTitle(title)
        .setAuthor({ name: user.username, iconURL: user.avatarURL() })
        .setDescription(subfieldTitle)
        .addFields(fields)
        .addFields({ name: '----', value: 'Meta' })
        .setTimestamp()
        .setFooter({ text: `Embed created by ${config.general.name}` });

    if (relatedCommands.length > 0) embed.addFields({ name: 'Related Commands', value: relatedCommands.map(element => `\`/${element}\``).join(', ') });

    return embed;
}

module.exports = {
    "create": create
}

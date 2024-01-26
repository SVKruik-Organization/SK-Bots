const { EmbedBuilder } = require('discord.js');
const config = require('../assets/config.js')

/**
 * Default Discord.JS Embed constructor.
 * @param {string} title The title of the embed.
 * @param {string} subfieldTitle The sub-header of the embed.
 * @param {object} interaction Discord Interaction object.
 * @param {Array<object>} fields The fields to add. Needs to have a 'name' and 'value' key.
 * @returns The constructed embed.
 */
function create(title, subfieldTitle, interaction, fields) {
    return new EmbedBuilder()
        .setColor(config.general.color)
        .setTitle(title)
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
        .addFields({ name: '----', value: subfieldTitle })
        .addFields(fields)
        .addFields({ name: '----', value: 'Meta' })
        .setTimestamp()
        .setFooter({ text: `Embed created by ${config.general.name}` });
}

module.exports = {
    "create": create
}
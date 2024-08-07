const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');
const guildUtils = require('../utils/guild.js');
const modules = require('..');
const logger = require('../utils/logger.js');

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
        .addFields({ name: "-----", value: 'Meta' })
        .setTimestamp()
        .setFooter({ text: `Embed created by ${config.general.name}` });

    if (relatedCommands.length > 0) embed.addFields({ name: 'Related Commands', value: relatedCommands.map(element => `\`/${element}\``).join(', ') });

    return embed;
}

/**
 * Return the shop catalog.
 * @param {object} interaction Discord Interaction Object
 * @returns Catalog Embed
 */
async function customShopCatalog(interaction) {
    const targetGuild = guildUtils.findGuildById(interaction.guild.id);
    if (!targetGuild) return interaction.reply({
        content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
        ephemeral: true
    });

    modules.database.query("SELECT * FROM guild_settings WHERE guild_snowflake = ?;", [targetGuild.guildObject.id])
        .then((data) => {
            if (data.length === 0) return interaction.reply({
                content: "Something went wrong while retrieving the required information. Please try again later.",
                ephemeral: true
            });

            const embed = new EmbedBuilder()
                .setColor(config.general.color)
                .setTitle("Shop Catalog")
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
                .setDescription("Use the previous dropdown menu to open the shop if you have decided on something. Prices on all of these items are managed by this server.")
                .addFields(
                    { name: 'Cosmetic', value: '-----------', inline: true },
                    { name: 'Level', value: '-----------', inline: true },
                    { name: 'Level', value: '-----------', inline: true })
                .addFields(
                    { name: 'Role Color', value: `\`${data[0].role_cosmetic_price}\` Bits`, inline: true },
                    { name: 'XP +15 24H', value: `\`${data[0].xp15}\` Bits`, inline: true },
                    { name: 'XP +50 24H', value: `\`${data[0].xp50}\` Bits`, inline: true })
                .addFields(
                    { name: "-----", value: 'Meta' },
                    { name: 'Related Commands', value: "\`/inventory\` \`/economy\`" })
                .setTimestamp()
                .setFooter({ text: `Embed created by ${config.general.name}` });
            interaction.reply({ embeds: [embed] });
        }).catch((error) => {
            logger.error(error);
            return interaction.reply({
                content: "Something went wrong while retrieving the required information. Please try again later.",
                ephemeral: true
            });
        })
}

module.exports = {
    "create": create,
    "customShopCatalog": customShopCatalog
}

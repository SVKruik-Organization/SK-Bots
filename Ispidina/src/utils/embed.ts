import { ChatInputCommandInteraction, User } from 'discord.js';
import { EmbedField, GuildFull } from "../types";
import { database } from "..";
import { EmbedBuilder } from 'discord.js';
import { general, colors } from '../config';
import { findGuildById } from '../utils/guild';
import { logError } from '../utils/logger';

/**
 * Default Discord.JS Embed constructor.
 * @param title The title of the embed.
 * @param subfieldTitle The sub-header of the embed.
 * @param user Discord User Object.
 * @param fields The fields to add. Needs to have a 'name' and 'value' key.
 * @param relatedCommands Array of related commands to display for the user.
 * @returns The constructed embed.
 */
export function create(title: string, subfieldTitle: string, user: User, fields: Array<EmbedField>, relatedCommands: Array<string>): EmbedBuilder {
    const embed: EmbedBuilder = new EmbedBuilder()
        .setColor(colors.bot)
        .setTitle(title)
        .setAuthor({ name: user.username, iconURL: user.avatarURL() as string })
        .setDescription(subfieldTitle)
        .addFields(fields)
        .addFields({ name: "-----", value: 'Meta' })
        .setTimestamp()
        .setFooter({ text: `Embed created by ${general.name}` });
    if (relatedCommands.length > 0) embed.addFields({ name: 'Related Commands', value: relatedCommands.map(element => `\`/${element}\``).join(', ') });
    return embed;
}

/**
 * Return the shop catalog.
 * @param interaction Discord Interaction Object
 * @returns Catalog Embed
 */
export async function customShopCatalog(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    const targetGuild: GuildFull | undefined = findGuildById(interaction.guild.id);
    if (!targetGuild) return interaction.reply({
        content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
        ephemeral: true
    });

    database.query("SELECT * FROM guild_settings WHERE guild_snowflake = ?;", [targetGuild.guild_object.id])
        .then((data) => {
            if (data.length === 0) return interaction.reply({
                content: "Something went wrong while retrieving the required information. Please try again later.",
                ephemeral: true
            });

            const embed = new EmbedBuilder()
                .setColor(colors.bot)
                .setTitle("Shop Catalog")
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() as string })
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
                .setFooter({ text: `Embed created by ${general.name}` });
            return interaction.reply({ embeds: [embed] });
        }).catch((error: any) => {
            logError(error);
            return interaction.reply({
                content: "Something went wrong while retrieving the required information. Please try again later.",
                ephemeral: true
            });
        })
}

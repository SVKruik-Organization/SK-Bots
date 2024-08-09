import { SlashCommandBuilder, ChatInputCommandInteraction, Role, AutocompleteInteraction, GuildMember } from 'discord.js';
import { cooldowns } from '../config.js';
import { findGuildById } from '../utils/guild.js';
import { database } from '../index.js';
import { logError } from '../utils/logger.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('role')
        .setNameLocalizations({
            nl: "rol"
        })
        .setDescription('Give yourself a custom role with your own color.')
        .setDescriptionLocalizations({
            nl: "Geef uzelf een eigen rol met een zelfgekozen kleur."
        })
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('color')
            .setNameLocalizations({
                nl: "kleur"
            })
            .setDescription('The HEX code for your color. For example: 000000. The hashtag prefix is not needed.')
            .setDescriptionLocalizations({
                nl: "De HEX code voor uw kleur. Bijvoorbeeld: 000000. De hastag prefix is niet nodig."
            })
            .setRequired(true)
            .setMinLength(6)
            .setMaxLength(6)
            .setAutocomplete(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Init
            if (!interaction.guild) return;
            const targetGuild = findGuildById(interaction.guild.id);
            if (!targetGuild || !targetGuild.role_cosmetic_power) return await interaction.reply({
                content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
                ephemeral: true
            });

            // Setup
            const color: string = interaction.options.getString("color") as string;
            const regex: string = "^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$";
            const role: Role | undefined = targetGuild.guild_object.roles.cache.find(role => role.name === interaction.user.username);
            let position: number = targetGuild.guild_object.roles.cache.size - targetGuild.role_cosmetic_power;
            if (position < 2) position = 2;

            // Inventory Check
            try {
                const data = await database.query("SELECT role_cosmetic FROM user_inventory WHERE snowflake = ?", [interaction.user.id]);
                if (data.length === 0) {
                    return await interaction.reply({
                        content: "This command requires you to have an account. Create an account with the `/register` command.",
                        ephemeral: true
                    });
                } else if (data[0].role_cosmetic < 1) return await interaction.reply({
                    content: "You don't have any Role Color changes left. Purchase one with the `/shop` command.",
                    ephemeral: true
                });
            } catch (error: any) {
                logError(error);
                return await interaction.reply({
                    content: "Something went wrong while checking some requirements. You have not been charged. Please try again later.",
                    ephemeral: true
                });
            }

            // Role Creation & Assign
            try {
                if (!color.match(regex)) return await interaction.reply({
                    content: "Your color is invalid. Make sure your color is in HEX format, like so: `000000`. Hashtag prefix is not needed.",
                    ephemeral: true
                });
                if (role) await role.delete();
                const newRole = await interaction.guild.roles.create({
                    position: position,
                    name: interaction.user.username,
                    color: parseInt(color, 16),
                    permissions: []
                });
                const guildMember: GuildMember = await interaction.guild.members.fetch(interaction.user.id);
                await guildMember.roles.add(newRole);
            } catch (error: any) {
                if (error.rawError && error.rawError.message === "Missing Permissions") {
                    return await interaction.reply({
                        content: "I do not have the required permissions to create your role. You have not been charged. Please try again later.",
                        ephemeral: true
                    });
                } else {
                    logError(error);
                    return await interaction.reply({
                        content: "Something went wrong while updating your information. You have not been charged. Please try again later.",
                        ephemeral: true
                    });
                }
            }

            // Inventory Update
            try {
                await database.query("UPDATE user_inventory SET role_cosmetic = role_cosmetic - 1 WHERE snowflake = ?", [interaction.user.id]);
                return await interaction.reply({
                    content: `\`#${color}\` -- great color! You look awesome!`,
                    ephemeral: true
                });
            } catch (error: any) {
                logError(error);
                return await interaction.reply({
                    content: "Something went wrong while updating your information. You have not been charged. Please try again later.",
                    ephemeral: true
                });
            }
        } catch (error: any) {
            logError(error);
        }
    },
    async autocomplete(interaction: AutocompleteInteraction) {
        // Default Discord Role-Colors
        const roleOptions: Array<string> = ["1abc9c", "0f806a", "2fcc71", "208b4c", "3498db", "206694", "9b59b6", "71368a", "e91e63", "ad1357", "f1c40f", "c27c0d", "e67e23", "e67e23", "e74b3c", "992d22"];
        const activeInput: string = interaction.options.getFocused();
        const filtered: Array<string> = roleOptions.filter(choice => choice.includes(activeInput));
        await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
    }
} satisfies Command;
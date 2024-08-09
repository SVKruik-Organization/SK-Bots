import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, GuildMember, Role } from 'discord.js';
import { cooldowns } from '../config.js';
import { logError } from '../utils/logger.js';
import { checkAdmin } from '../utils/user.js';
import { findGuildById } from '../utils/guild.js';
import { Command, GuildFull } from '../types.js';

export default {
    cooldown: cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('blind')
        .setNameLocalizations({
            nl: "verblinden"
        })
        .setDescription('Controls for the blinding system.')
        .setDescriptionLocalizations({
            nl: "Bediening voor het verblinden van een gebruiker."
        })
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(option => option
            .setName('add')
            .setNameLocalizations({
                nl: "toevoegen"
            })
            .setDescription("Add the Blind role.")
            .setDescriptionLocalizations({
                nl: "Voeg de Blind rol toe."
            })
            .addUserOption(option => option
                .setName('target')
                .setNameLocalizations({
                    nl: "gebruiker"
                })
                .setDescription('The target member.')
                .setDescriptionLocalizations({
                    nl: "De betreffende gebruiker."
                })
                .setRequired(true)))
        .addSubcommand(option => option
            .setName('remove')
            .setNameLocalizations({
                nl: "verwijderen"
            })
            .setDescription("Remove the Blind role.")
            .setDescriptionLocalizations({
                nl: "Verwijder de Blind rol."
            })
            .addUserOption(option => option
                .setName('target')
                .setNameLocalizations({
                    nl: "gebruiker"
                })
                .setDescription('The target member.')
                .setDescriptionLocalizations({
                    nl: "De betreffende gebruiker."
                })
                .setRequired(true))),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Permission Validation
            if (!interaction.guild) return;
            if (!(await checkAdmin(interaction))) return await interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Please try again later, or contact moderation to receive elevated permissions.`,
                ephemeral: true
            });

            // Guild Fetching
            const targetGuild: GuildFull | undefined = findGuildById(interaction.guild.id);
            if (!targetGuild || !targetGuild.role_blinded) return await interaction.reply({
                content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
                ephemeral: true
            });

            const guildMember: GuildMember = await interaction.guild.members.fetch(interaction.options.getUser("target", true).id);
            const role: Role = targetGuild.role_blinded;
            const action: string = interaction.options.getSubcommand();

            // Update Status
            if (action === "add") {
                guildMember.roles.add(role);
                return await interaction.reply({
                    content: `<@${guildMember.user.id}> has been blinded. They no longer have access to the channels.`,
                    ephemeral: true
                });
            } else if (action === "remove") {
                guildMember.roles.remove(role);
                return await interaction.reply({ content: `<@${guildMember.user.id}> has been unblinded. Welcome back!` });
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
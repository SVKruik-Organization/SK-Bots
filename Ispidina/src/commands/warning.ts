const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modules = require('..');
const config = require('../config');
const logger = require('../utils/logger');
const guildUtils = require('../utils/guild');
const userUtils = require('../utils/user');

export default {
    cooldown: cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('warning')
        .setNameLocalizations({
            nl: "waarschuwen"
        })
        .setDescription('Warn someone that breaks the rules. Administrator version of report.')
        .setDescriptionLocalizations({
            nl: "Geef iemand een waarschuwing voor regelovertreding. Administrator versie van report."
        })
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addUserOption(option => option
            .setName('target')
            .setNameLocalizations({
                nl: "gebruiker"
            })
            .setDescription('The target member.')
            .setDescriptionLocalizations({
                nl: "De betreffende gebruiker."
            })
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setNameLocalizations({
                nl: "rede"
            })
            .setDescription('The reason for the warning. Max 1000 characters.')
            .setDescriptionLocalizations({
                nl: "De rede voor de waarschuwing. Maximaal 1000 karakters."
            })
            .setRequired(false)
            .setMaxLength(1000)),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Permission Validation
            if (!(await checkAdmin(interaction))) return interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Please try again later, or contact moderation to receive elevated permissions.`,
                ephemeral: true
            });

            const targetUser = interaction.options.getUser('target');
            let reason = interaction.options.getString('reason') ?? 'No reason provided';

            database.query("INSERT INTO warning (snowflake, snowflake_recv, reason, date, guild_snowflake) VALUES (?, ?, ?, CURRENT_TIMESTAMP(), ?);", [interaction.user.id, targetUser.id, reason, interaction.guild.id])
                .then(() => {
                    const targetGuild = findGuildById(interaction.guild.id);
                    if (targetGuild && targetGuild.channel_admin) targetGuild.channel_admin.send({ content: `User <@${interaction.user.id}> has **warned** <@${targetUser.id}> for: \`${reason}\`` });
                    logMessage(`'${interaction.user.username}@${interaction.user.id}' has warned '${targetUser.username}@${targetUser.id}' for ${reason}`, "warning");

                    return interaction.reply({
                        content: `User <@${targetUser.id}> has been warned for: \`${reason}\``
                    });
                }).catch((error: any) => {
                    logError(error);
                    return interaction.reply({
                        content: "Something went wrong while warning this user. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error: any) {
            logError(error);
        }
    }
};
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');
const guildUtils = require('../utils/guild.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('warning')
        .setDescription('Warn someone that breaks the rules. Administrator version of report.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option
            .setName('target')
            .setDescription('The target member.')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason for the warning. Max 1000 characters.')
            .setRequired(false)
            .setMaxLength(1000)),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('target');
            let reason = interaction.options.getString('reason') ?? 'No reason provided';

            modules.database.query("INSERT INTO warning (snowflake, snowflake_recv, reason, date, guild_snowflake) VALUES (?, ?, ?, CURRENT_TIMESTAMP(), ?);", [interaction.user.id, targetUser.id, reason, interaction.guild.id])
                .then(() => {
                    const targetGuild = guildUtils.findGuildById(interaction.guild.id);
                    if (targetGuild && targetGuild.channel_admin) targetGuild.channel_admin.send({ content: `User <@${interaction.user.id}> has **warned** <@${targetUser.id}> for: \`${reason}\`` });
                    logger.log(`'${interaction.user.username}@${interaction.user.id}' has warned '${targetUser.username}@${targetUser.id}' for ${reason}`, "warning");

                    interaction.reply({
                        content: `User <@${targetUser.id}> has been warned for: \`${reason}\``
                    });
                }).catch((error) => {
                    console.log(error);
                    return interaction.reply({
                        content: "Something went wrong while warning this user. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error) {
            console.error(error);
        }
    }
};
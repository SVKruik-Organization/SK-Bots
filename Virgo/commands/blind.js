const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const guildUtils = require('../utils/guild.js');
const userUtils = require('../utils/user.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('blind')
        .setNameLocalizations({
            nl: "verblinden"
        })
        .setDescription('Blinded role controls. Blind or unblind someone.')
        .setDescriptionLocalizations({
            nl: "Bediening voor het verblinden van een gebruiker."
        })
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
            .setName('action')
            .setNameLocalizations({
                nl: "actie"
            })
            .setDescription('Whether you want to modify or check the user status.')
            .setDescriptionLocalizations({
                nl: "Of u de gebruiker status wilt wijzigen of bekijken."
            })
            .setRequired(true)
            .addChoices(
                { name: 'Blind', value: 'blind' },
                { name: 'Unblind', value: 'unblind' }
            )),
    async execute(interaction) {
        try {
            // Permission Validation
            if (!(await userUtils.checkAdmin(interaction.user.id, interaction.guild))) return interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Please try again later, or contact moderation to receive elevated permissions.`,
                ephemeral: true
            });

            // Guild Fetching
            const targetGuild = guildUtils.findGuildById(interaction.guild.id);
            if (!targetGuild || !targetGuild.role_blinded) return interaction.reply({
                content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
                ephemeral: true
            });

            const user = interaction.options.getUser('target');
            const targetSnowflake = user.id;
            const role = targetGuild.role_blinded;
            const guild = interaction.client.guilds.cache.get(interaction.guildId);
            const action = interaction.options.getString('action');

            // Update Status
            if (action === "blind") {
                await guild.members.fetch(targetSnowflake).then((user) => {
                    user.roles.add(role);
                    interaction.reply({
                        content: `<@${targetSnowflake}> has been blinded. They no longer have access to the channels.`,
                        ephemeral: true
                    });
                });
            } else if (action === "unblind") {
                await guild.members.fetch(targetSnowflake).then((user) => {
                    user.roles.remove(role);
                    interaction.reply({ content: `<@${targetSnowflake}> has been unblinded. Welcome back!` });
                });
            }
        } catch (error) {
            logger.error(error);
        }
    }
};
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');
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
    async execute(interaction) {
        try {
            // Permission Validation
            if (!(await userUtils.checkAdmin(interaction))) return interaction.reply({
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
            const action = interaction.options.getSubcommand();

            // Update Status
            if (action === "add") {
                await guild.members.fetch(targetSnowflake).then((user) => {
                    user.roles.add(role);
                    interaction.reply({
                        content: `<@${targetSnowflake}> has been blinded. They no longer have access to the channels.`,
                        ephemeral: true
                    });
                });
            } else if (action === "remove") {
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
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const guildUtils = require('../utils/guild.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('blind')
        .setDescription('Blinded role controls. Blind or unblind someone.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option
            .setName('target')
            .setDescription('The target member.')
            .setRequired(true))
        .addStringOption(option => option
            .setName('action')
            .setDescription('Choose what you want to do with the selected user.')
            .setRequired(true)
            .addChoices(
                { name: 'Blind', value: 'blind' },
                { name: 'Unblind', value: 'unblind' }
            )),
    async execute(interaction) {
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
                interaction.reply({ content: `<@${targetSnowflake}> has been blinded. He/she no longer has access to the general voice and text channels.` });
            });
        } else if (action === "unblind") {
            await guild.members.fetch(targetSnowflake).then((user) => {
                user.roles.remove(role);
                interaction.reply({ content: `<@${targetSnowflake}> has been unblinded. Welcome back!` });
            });
        }
    }
};
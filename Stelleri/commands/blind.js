const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modules = require('..');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blind')
        .setDescription('Blind controls. Blind or unblind someone.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option.setName('target').setDescription('User to blind or unblind').setRequired(true))
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choose what you want to do with the selected user.')
                .setRequired(true)
                .addChoices(
                    { name: 'Blind', value: 'blind' },
                    { name: 'Unblind', value: 'unblind' }
                )),
    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const targetSnowflake = user.id;
        const role = interaction.guild.roles.cache.find(role => role.name === "Blinded");
        const guild = modules.client.guilds.cache.get(interaction.guildId);
        const action = interaction.options.getString('action');

        if (action == "blind") {
            await guild.members.fetch(targetSnowflake).then(async (user) => {
                user.roles.add(role);
                await interaction.reply(`<@${targetSnowflake}> has been blinded. He/she no longer has access to the general voice and text channels.`);
            });
        } else if (action == "unblind") {
            await guild.members.fetch(targetSnowflake).then(async (user) => {
                user.roles.remove(role);
                await interaction.reply(`<@${targetSnowflake}> has been unblinded. Welcome back!`);
            });
        };
    }
};
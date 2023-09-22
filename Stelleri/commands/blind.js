const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('blind')
        .setDescription('Blind controls. Blind or unblind someone.')
        .addUserOption(option => option.setName('target').setDescription('The target member.').setRequired(true))
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choose what you want to do with the selected user.')
                .setRequired(true)
                .addChoices(
                    { name: 'Blind', value: 'blind' },
                    { name: 'Unblind', value: 'unblind' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const targetSnowflake = user.id;
        const role = interaction.guild.roles.cache.find(role => role.name === "Blinded");
        const guild = modules.client.guilds.cache.get(interaction.guildId);
        const action = interaction.options.getString('action');

        if (action === "blind") {
            await guild.members.fetch(targetSnowflake).then((user) => {
                user.roles.add(role);
                interaction.reply(`<@${targetSnowflake}> has been blinded. He/she no longer has access to the general voice and text channels.`);
            });
        } else if (action === "unblind") {
            await guild.members.fetch(targetSnowflake).then((user) => {
                user.roles.remove(role);
                interaction.reply(`<@${targetSnowflake}> has been unblinded. Welcome back!`);
            });
        }

    }
};
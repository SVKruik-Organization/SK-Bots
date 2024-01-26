const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
const guildUtils = require('../utils/guild.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete a command.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('id').setDescription('Target command ID.').setRequired(true)),
    async execute(interaction) {
        const commandId = interaction.options.getString('id');
        for (let i = 0; i < guildUtils.guilds.length; i++) {
            await rest.delete(Routes.applicationGuildCommand(interaction.applicationId, guildUtils.guilds[i].guildObject.id, commandId))
                .then(() => {
                    interaction.reply({ content: "Command successfully removed.", ephemeral: true })
                }).catch(() => interaction.reply({ content: "Command successfully removed.", ephemeral: true }));
        }
    }
};
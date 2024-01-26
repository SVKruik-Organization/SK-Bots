const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const guildUtils = require('../utils/guild.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Give yourself a custom role with your own color.')
        .addStringOption(option => option.setName('hex').setDescription('The HEX code for your color. For example: 000000. Hashtag prefix is not needed.').setRequired(true).setMinLength(6).setMaxLength(6)),
    async execute(interaction) {
        const targetGuild = guildUtils.findGuildById(interaction.guild.id);
        if (!targetGuild || !targetGuild.role_power) return interaction.reply({
            content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
            ephemeral: true
        });
        const snowflake = interaction.user.id;
        const color = interaction.options.getString('hex');
        const regex = "^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$";
        const role = targetGuild.guildObject.roles.cache.find(role => role.name === interaction.user.username);
        const position = targetGuild.guildObject.roles.cache.size - targetGuild.role_power;

        if (role) await role.delete();
        if (color.match(regex)) {
            await interaction.guild.roles.create({
                position: position,
                name: interaction.user.username,
                color: parseInt(color, 16)
            }).then(async () => {
                const role = targetGuild.guildObject.roles.cache.find((r) => r.name === interaction.user.username);
                await targetGuild.guildObject.members.fetch(snowflake).then((user) => {
                    user.roles.add(role);
                });
                interaction.reply(`\`#${color}\` -- great color! You look awesome!`);
            }).catch(() => {
                interaction.reply({
                    content: "Something went wrong while creating your role. Please try again later.",
                    ephemeral: true
                });
            });
        } else {
            interaction.reply({
                content: "Your color is invalid. Make sure your color is in HEX format, like so: `000000`. Hashtag prefix is not needed.",
                ephemeral: true
            });
        }
    }
};
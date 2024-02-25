const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const guildUtils = require('../utils/guild.js');
const modules = require('..');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Give yourself a custom role with your own color.')
        .addStringOption(option => option
            .setName('hex')
            .setDescription('The HEX code for your color. For example: 000000. Hashtag prefix is not needed.')
            .setRequired(true)
            .setMinLength(6)
            .setMaxLength(6)),
    async execute(interaction) {
        const targetGuild = guildUtils.findGuildById(interaction.guild.id);
        if (!targetGuild || !targetGuild.role_cosmetic_power) return interaction.reply({
            content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
            ephemeral: true
        });
        const snowflake = interaction.user.id;
        const color = interaction.options.getString('hex');
        const regex = "^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$";
        const role = targetGuild.guildObject.roles.cache.find(role => role.name === interaction.user.username);
        let position = targetGuild.guildObject.roles.cache.size - targetGuild.role_cosmetic_power;
        if (position < 2) position = 2;

        modules.database.query("SELECT role_color FROM user_inventory WHERE snowflake = ?", [interaction.user.id])
            .then((data) => {
                if (data.length === 0) {
                    return interaction.reply({
                        content: "This command requires you to have an account. Create an account with the `/register` command.",
                        ephemeral: true
                    });
                } else if (data[0].role_color < 1) {
                    return interaction.reply({
                        content: "You don't have any Role Color changes left. Purchase one with the `/shop` command.",
                        ephemeral: true
                    });
                }

                modules.database.query("UPDATE user_inventory SET role_color = role_color - 1 WHERE snowflake = ?", [interaction.user.id])
                    .then(async (data) => {
                        // Validation
                        if (!data.affectedRows) return interaction.reply({
                            content: "This command requires you to have an account. Create an account with the `/register` command.",
                            ephemeral: true
                        });

                        if (color.match(regex)) {
                            if (role) await role.delete();
                            await interaction.guild.roles.create({
                                position: position,
                                name: interaction.user.username,
                                color: parseInt(color, 16)
                            }).then(async () => {
                                const role = guild.roles.cache.find((role) => role.name === interaction.user.username);
                                await targetGuild.guildObject.members.fetch(snowflake).then((user) => {
                                    if (!user) return interaction.reply({
                                        content: "Something went wrong while creating your role. Please try again later.",
                                        ephemeral: true
                                    });

                                    // Finalize
                                    user.roles.add(role);
                                    interaction.reply({
                                        content: `\`#${color}\` -- great color! You look awesome!`,
                                        ephemeral: true
                                    });
                                });
                            }).catch(() => {
                                return interaction.reply({
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
                    }).catch(() => {
                        return interaction.reply({
                            content: "Something went wrong while updating your information. You have not been charged. Please try again later.",
                            ephemeral: true
                        });
                    });
            }).catch((error) => {
                console.log(error);
                return interaction.reply({
                    content: "Something went wrong while retrieving the required information. Please try again later.",
                    ephemeral: true
                });
            })
    }
};
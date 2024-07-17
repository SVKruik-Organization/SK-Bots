const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const guildUtils = require('../utils/guild.js');
const modules = require('..');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('role')
        .setNameLocalizations({
            nl: "rol"
        })
        .setDescription('Give yourself a custom role with your own color.')
        .setDescriptionLocalizations({
            nl: "Geef uzelf een eigen rol met een zelfgekozen kleur."
        })
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('color')
            .setNameLocalizations({
                nl: "kleur"
            })
            .setDescription('The HEX code for your color. For example: 000000. The hashtag prefix is not needed.')
            .setDescriptionLocalizations({
                nl: "De HEX code voor uw kleur. Bijvoorbeeld: 000000. De hastag prefix is niet nodig."
            })
            .setRequired(true)
            .setMinLength(6)
            .setMaxLength(6)
            .setAutocomplete(true)),
    async execute(interaction) {
        try {
            // Init
            const targetGuild = guildUtils.findGuildById(interaction.guild.id);
            if (!targetGuild || !targetGuild.role_cosmetic_power) return interaction.reply({
                content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
                ephemeral: true
            });

            // Setup
            const snowflake = interaction.user.id;
            const color = interaction.options.getString('color');
            const regex = "^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$";
            const role = targetGuild.guildObject.roles.cache.find(role => role.name === interaction.user.username);
            let position = targetGuild.guildObject.roles.cache.size - targetGuild.role_cosmetic_power;
            if (position < 2) position = 2;

            modules.database.query("SELECT role_cosmetic FROM user_inventory WHERE snowflake = ?", [interaction.user.id])
                .then((data) => {
                    if (data.length === 0) {
                        return interaction.reply({
                            content: "This command requires you to have an account. Create an account with the `/register` command.",
                            ephemeral: true
                        });
                    } else if (data[0].role_cosmetic < 1) {
                        return interaction.reply({
                            content: "You don't have any Role Color changes left. Purchase one with the `/shop` command.",
                            ephemeral: true
                        });
                    }

                    modules.database.query("UPDATE user_inventory SET role_cosmetic = role_cosmetic - 1 WHERE snowflake = ?", [interaction.user.id])
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
                                    color: parseInt(color, 16),
                                    permissions: []
                                }).then(() => {
                                    const role = interaction.guild.roles.cache.find((role) => role.name === interaction.user.username);
                                    targetGuild.guildObject.members.fetch(snowflake).then((user) => {
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
                                }).catch((error) => {
                                    logger.error(error);
                                    return interaction.reply({
                                        content: "Something went wrong while creating your role. Please try again later.",
                                        ephemeral: true
                                    });
                                });
                            } else interaction.reply({
                                content: "Your color is invalid. Make sure your color is in HEX format, like so: `000000`. Hashtag prefix is not needed.",
                                ephemeral: true
                            });
                        }).catch((error) => {
                            logger.error(error);
                            return interaction.reply({
                                content: "Something went wrong while updating your information. You have not been charged. Please try again later.",
                                ephemeral: true
                            });
                        });
                }).catch((error) => {
                    logger.error(error);
                    return interaction.reply({
                        content: "Something went wrong while retrieving the required information. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error) {
            logger.error(error);
        }
    },
    async autocomplete(interaction) {
        const roleOptions = ["1abc9c", "0f806a", "2fcc71", "208b4c", "3498db", "206694", "9b59b6", "71368a", "e91e63", "ad1357", "f1c40f", "c27c0d", "e67e23", "e67e23", "e74b3c", "992d22"];
        const activeInput = interaction.options.getFocused();
        const filtered = roleOptions.filter(choice => choice.includes(activeInput));
        await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
    }
};
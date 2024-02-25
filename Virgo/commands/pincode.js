const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('pincode')
        .setDescription('Change your 4-digit pincode.')
        .addIntegerOption(option => option
            .setName('old-pincode')
            .setDescription("Your current pincode.")
            .setRequired(true)
            .setMinValue(1000)
            .setMaxValue(9999))
        .addIntegerOption(option => option
            .setName('new-pincode')
            .setDescription("Your new pincode. Save it safe!")
            .setRequired(true)
            .setMinValue(1000)
            .setMaxValue(9999)),
    async execute(interaction) {
        try {
            const snowflake = interaction.user.id;
            const username = interaction.user.username;

            const oldPincode = interaction.options.getInteger('old-pincode');
            const newPincode = interaction.options.getInteger('new-pincode');

            modules.database.query("SELECT pincode FROM user WHERE snowflake = ?;", [snowflake])
                .then((data) => {
                    // Validation
                    if (data.length === 0) return interaction.reply({
                        content: "You do not have an account yet. Create an account with the `/register` command.",
                        ephemeral: true
                    });

                    // User Validation
                    if (data[0].pincode !== oldPincode) return interaction.reply({
                        content: "Your old pincode does not match the current one. Please try again. The 'forgot pincode' system is still WIP.",
                        ephemeral: true
                    });

                    // Update
                    modules.database.query("UPDATE user SET pincode = ? WHERE snowflake = ?;", [newPincode, snowflake])
                        .then((data) => {
                            // Validation
                            if (!data.affectedRows) return interaction.reply({
                                content: "This command requires you to have an account. Create an account with the `/register` command.",
                                ephemeral: true
                            });

                            interaction.reply({
                                content: `Your pincode has been updated successfully. New pincode: \`${newPincode}\`. Safe it save!`,
                                ephemeral: true
                            });
                            logger.log(`${username} has changed their pincode.`, "info");
                        }).catch(() => {
                            return interaction.reply({
                                content: "Something went wrong while trying to update your information. Please try again later.",
                                ephemeral: true
                            });
                        });
                }).catch(() => {
                    return interaction.reply({
                        content: "Something went wrong while trying to update your information. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error) {
            console.error(error);
        }
    }
};
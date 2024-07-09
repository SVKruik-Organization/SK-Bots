const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('register')
        .setNameLocalizations({
            nl: "registreren"
        })
        .setDescription('Create a new account with us. Grants access to Tier & Economy commands.')
        .setDescriptionLocalizations({
            nl: "Maak een account bij ons aan. Geeft toegang tot Tier & Economy commando's."
        })
        .setDMPermission(true)
        .addStringOption(option => option
            .setName('pincode')
            .setNameLocalizations({
                nl: "pincode"
            })
            .setDescription('A 4-digit pincode for sensitive commands. Save it safe!')
            .setDescriptionLocalizations({
                nl: "Een 4-cijferige pincode voor gevoelige commando's. Bewaar hem goed!"
            })
            .setRequired(true)
            .setMaxLength(4)
            .setMinLength(4)),
    async execute(interaction) {
        try {
            const snowflake = interaction.user.id;
            const username = interaction.user.username;
            const pincode = interaction.options.getString('pincode');

            modules.database.query("INSERT INTO user (snowflake, username, pincode) VALUES (?, ?, ?); INSERT INTO tier (snowflake) VALUES (?); INSERT INTO economy (snowflake) VALUES (?); INSERT INTO user_inventory (snowflake) VALUES (?); INSERT INTO user_commands (snowflake) VALUES (?);",
                [snowflake, username, pincode, snowflake, snowflake, snowflake, snowflake])
                .then(() => {
                    interaction.reply({
                        content: "Thank you for your registration! You can now use all commands.",
                        ephemeral: true
                    });
                }).catch((error) => {
                    if (error.code === "ER_DUP_ENTRY") {
                        return interaction.reply({
                            content: "You already have an account. Display your statistics with `/economy` and `/tier`.",
                            ephemeral: true
                        });
                    } else {
                        logger.error(error)
                        return interaction.reply({
                            content: "Something went wrong while registering your account. Please try again later.",
                            ephemeral: true
                        });
                    }
                });
        } catch (error) {
            logger.error(error);
        }
    }
};
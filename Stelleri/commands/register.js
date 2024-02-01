const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Create a new account with us. Grants access to Tier & Economy commands.')
        .addStringOption(option => option
            .setName('pincode')
            .setDescription('A 4-digit pincode for sensitive commands. Save it safe!')
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
                            content: "You already have an account. Display your statistics with `/economy`, and `/tier`.",
                            ephemeral: true
                        });
                    } else return interaction.reply({
                        content: "Something went wrong while registering your account. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error) {
            console.error(error);
        }
    }
};
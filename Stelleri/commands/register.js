const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Create a new account with us.')
        .addStringOption(option => option.setName('pincode').setDescription('A 4-digit pincode that you will use for sensitive commands. Save it save!').setRequired(true).setMaxLength(4).setMinLength(4)),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const pincode = interaction.options.getString('pincode');

        modules.database.query("INSERT INTO user (snowflake, username, pincode, created_on) VALUES (?, ?, ?, CURRENT_TIMESTAMP()); INSERT INTO tier (snowflake) VALUES (?); INSERT INTO economy (snowflake) VALUES (?);"
        [snowflake, username, pincode, snowflake, snowflake])
            .then(() => {
                interaction.reply({
                    content: "Thank you for your registration! You can now use all commands.",
                    ephemeral: true
                });
            }).catch((error) => {
                if (error.code === "ER_DUP_ENTRY") {
                    return interaction.reply({ content: "You already have an account.", ephemeral: true });
                } else return interaction.reply({
                    content: "Something went wrong while registering your account. Please try again later.",
                    ephemeral: true
                });
            });
    }
};
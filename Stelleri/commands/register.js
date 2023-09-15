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

        modules.database.query(`INSERT INTO user (snowflake, username, pincode, created_on) VALUES ('${snowflake}', '${username}', '${pincode}', CURRENT_TIMESTAMP()); INSERT INTO tier (snowflake) VALUES ('${snowflake}'); INSERT INTO economy (snowflake) VALUES ('${snowflake}');`)
            .then(() => {
                interaction.reply({ content: "Thank you for your registration! You can now use all commands.", ephemeral: true });
            }).catch(async (error) => {
                console.log(error);
                return await interaction.reply({ content: "Either you already have an account, or something else went wrong.", ephemeral: true });
            });
    }
};
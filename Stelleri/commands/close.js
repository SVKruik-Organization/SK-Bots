const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Close your account. You can no longer use account specific commands.')
        .addStringOption(option => option
            .setName('pincode')
            .setDescription('Your 4-digit pincode you chose when registering your account.')
            .setRequired(true)),
    async execute(interaction) {
        try {
            const snowflake = interaction.user.id;
            const inputPincode = interaction.options.getString('pincode');

            modules.database.query("SELECT pincode AS 'pin' FROM user WHERE snowflake = ?;", [snowflake])
                .then((data) => {
                    const dataPincode = data[0].pin;
                    if (inputPincode === dataPincode) {
                        modules.database.query("DELETE FROM user WHERE snowflake = ?;", [snowflake])
                            .then(() => {
                                interaction.reply({
                                    content: "Your account has been successfully closed. If you change your mind, you can always create a new account with the `/register` command.",
                                    ephemeral: true
                                });
                            }).catch(() => {
                                interaction.reply({
                                    content: "This command requires you to have an account. Create an account with the `/register` command.",
                                    ephemeral: true
                                });
                            });
                    } else {
                        interaction.reply({
                            content: "Your pincode is not correct. If you forgot your pincode, you can request it with `/pincode`.",
                            ephemeral: true
                        });
                    }
                }).catch(() => {
                    interaction.reply({
                        content: "Something went wrong while closing your account. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error) {
            console.error(error);
        }
    }
};
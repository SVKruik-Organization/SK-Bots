const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const { sendConfirmButtons } = require('../handlers/closeInteractionHandler.js');

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
                    const match = inputPincode === dataPincode;
                    if (match) {
                        sendConfirmButtons(interaction);
                    } else {
                        interaction.reply({
                            content: "Your pincode is not correct. If you forgot your pincode, you can request it with `/pincode`.",
                            ephemeral: true
                        });
                    }
                }).catch((error) => {
                    console.log(error)
                    return interaction.reply({
                        content: "Something went wrong while closing your account. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error) {
            console.error(error);
        }
    }
};
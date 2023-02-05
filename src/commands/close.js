const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Close your account. You can no longer use account specific accounts.')
        .addStringOption(option => option.setName('pincode').setDescription('Your 4-digit pincode you chose when registering your account.').setRequired(true)),
    async execute(interaction) {
        const database = require("..");
        const snowflake = interaction.user.id;
        const inputPincode = interaction.options.getString('pincode');
        database.promise()
            .execute(`SELECT pincode AS 'pin' FROM user WHERE snowflake = '${snowflake}'`)
            .then(async ([data]) => {
                const dataPincode = data[0].pin;

                if (inputPincode == dataPincode) {
                    database.promise()
                        .execute(`DELETE FROM user WHERE snowflake = '${snowflake}'`)
                        .then(async ([data]) => {
                            await interaction.reply('Your account has been succesfully closed. If you change your mind, you can always create a new account with `/register`.');
                        }).catch(async err => {
                            await interaction.reply('Something went wrong while closing your account. Please try again later.');
                        });
                } else {
                    await interaction.reply('Your pincode is not correct. If you forgot your pincode, you can request it with `/pincode`.');
                }
            }).catch(async err => {
                await interaction.reply('Something went wrong while closing your account. Please try again later.');
            });

    },
};
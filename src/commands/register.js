const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Create a new account with us.')
        .addStringOption(option => option.setName('pincode').setDescription('A 4-digit pincode that you will use for sensitive commands. Save it save!').setRequired(true).setMaxLength(4).setMinLength(4)),
    async execute(interaction) {
        const database = require("..");
        const userSnowflake = interaction.user.id;
        const userTag = interaction.user.tag;
        const pincode = interaction.options.getString('pincode');
        database.promise()
            .execute(`INSERT INTO user (snowflake, tag, pincode, created_on) VALUES ('${userSnowflake}', '${userTag}', ${pincode}, CURDATE());`)
            .then(() => {
                database.promise()
                    .execute(`SELECT id FROM user WHERE snowflake = '${userSnowflake}';`)
                    .then(async ([data]) => {
                        database.promise()
                            .execute(`INSERT INTO level (user_id, level, xp) VALUES (${data[0].id}, 1, 0);`)
                            .then(async () => {
                                database.promise()
                                    .execute(`INSERT INTO economy (user_id, wallet, bank) VALUES (${data[0].id}, 0, 0);`)
                                    .then(async () => {
                                        await interaction.reply('Thank you for your registration! You can now use economy and level commands.');
                                    }).catch(async err => {
                                        await interaction.reply('Something went wrong while creating your account. Please try again later.');
                                    });
                            }).catch(async err => {
                                await interaction.reply('Something went wrong while creating your account. Please try again later.');
                            });
                    }).catch(async err => {
                        await interaction.reply('Something went wrong while creating your account. Please try again later.');
                    });
            }).catch(async err => {
                await interaction.reply('Something went wrong while creating your account. Please try again later.');
            });
    },
};
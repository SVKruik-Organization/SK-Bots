const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Create a new account with us.')
        .addStringOption(option => option.setName('pincode').setDescription('A 4-digit pincode that you will use for sensitive commands. Save it save!').setRequired(true).setMaxLength(4).setMinLength(4)),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const pincode = interaction.options.getString('pincode');

        modules.database.promise()
            .execute(`INSERT INTO user (snowflake, username, warnings, pincode, created_on) VALUES ('${snowflake}', '${username}', 0, '${pincode}', CURDATE());`)
            .then(() => {
                modules.database.promise()
                    .execute(`SELECT id FROM user WHERE snowflake = '${snowflake}';`)
                    .then(async ([data]) => {
                        modules.database.promise()
                            .execute(`INSERT INTO tier (user_id, level, xp) VALUES (${data[0].id}, 1, 0);`)
                            .then(async () => {
                                modules.database.promise()
                                    .execute(`INSERT INTO economy (user_id, wallet, bank) VALUES (${data[0].id}, 0, 0);`)
                                    .then(async () => {
                                        await interaction.reply({ content: "Thank you for your registration! You can now use economy and tier commands.", ephemeral: true });
                                    }).catch(async () => {
                                        await interaction.reply({ content: "Either you already have an account, or something else went wrong.", ephemeral: true });
                                    });
                            }).catch(async () => {
                                await interaction.reply({ content: "Either you already have an account, or something else went wrong.", ephemeral: true });
                            });
                    }).catch(async () => {
                        await interaction.reply({ content: "Either you already have an account, or something else went wrong.", ephemeral: true });
                    });
            }).catch(async () => {
                await interaction.reply({ content: "Either you already have an account, or something else went wrong.", ephemeral: true });
            });
    },
};
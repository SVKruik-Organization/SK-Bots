const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const modules = require('..');
const dateInfo = modules.getDate();
const date = dateInfo.date;
const time = dateInfo.time;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pincode')
        .setDescription('Change or get your 4-digit pincode.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choose what you want to do with your pincode.')
                .setRequired(true)
                .addChoices(
                    { name: 'Get Pincode', value: 'get' },
                    { name: 'Change Pincode', value: 'change' }
                ))
        .addStringOption(option => option.setName('new-pincode').setDescription("Your new pincode. Leave blank if you don't want to change it.").setRequired(false).setMaxLength(4).setMinLength(4)),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const actionType = interaction.options.getString('action');
        const newPincode = interaction.options.getString('new-pincode');

        if (actionType == "get") {
            modules.database.promise()
                .execute(`SELECT pincode AS pin FROM user WHERE snowflake = '${snowflake}';`)
                .then(async ([data]) => {
                    await interaction.reply({ content: `Your Pincode is: \`${data[0].pin}\`.`, ephemeral: true });
                }).catch(() => {
                    return interaction.reply({ content: "You do not have an account yet. Create an account with the `/register` command.", ephemeral: true });
                });
        } else if (actionType == "change" && newPincode != null) {
            modules.database.promise()
                .execute(`UPDATE user SET pincode = '${newPincode}' WHERE snowflake = '${snowflake}';`)
                .then(async () => {
                    await interaction.reply({ content: `Your pincode has been succesfully changed. New pincode: \`${newPincode}\`.`, ephemeral: true });
                }).catch(() => {
                    return interaction.reply({ content: "You do not have an account yet. Create an account with the `/register` command.", ephemeral: true });
                });
        } else {
            await interaction.reply({ content: "With this actiontype you need to fill in the optional input, the new pincode. Please try again.", ephemeral: true });
        };

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(() => {
                const data = `${time} [WARNING] Command usage increase unsuccessful, ${username} does not have an account yet.\n`;
                console.log(data);
                fs.appendFile(`./logs/${date}.log`, data, (err) => {
                    if (err) console.log(`${time} [ERROR] Error appending to log file.`);
                });
                return;
            });
    },
};
const { SlashCommandBuilder } = require('discord.js');

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
        const actionType = interaction.options.getString('action');
        const newPincode = interaction.options.getString('new-pincode');

        if (actionType == "get") {
            modules.database.promise()
                .execute(`SELECT pincode AS pin FROM user WHERE snowflake = '${snowflake}';`)
                .then(async ([data]) => {
                    await interaction.reply("Your Pincode is: `" + data[0].pin + "`");
                }).catch(err => {
                    console.log(err)
                    return console.log("You do not have an account yet. Generate an account with the `/register` command.");
                });
        } else if (actionType == "change" && newPincode != null) {
            modules.database.promise()
                .execute(`UPDATE user SET pincode = '${newPincode}' WHERE snowflake = '${snowflake}';`)
                .then(async () => {
                    await interaction.reply("Your pincode has been succesfully changed.");
                }).catch(err => {
                    console.log(err)
                    return console.log("You do not have an account yet. Generate an account with the `/register` command.");
                });
        } else {
            await interaction.reply("You need to give a new pincode.");
        };

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(err => {
                return console.log("Command usage increase unsuccessful, user does not have an account yet.");
            });
    },
};
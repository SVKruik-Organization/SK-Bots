const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const logger = require('../utils/log.js');

module.exports = {
    cooldown: config.cooldowns.D,
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
        .addStringOption(option => option.setName('new-pincode').setDescription("Your new pincode. Leave blank if you don't want to change it. Max 4 digits.").setRequired(false).setMaxLength(4).setMinLength(4)),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const actionType = interaction.options.getString('action');
        const newPincode = interaction.options.getString('new-pincode');

        if (actionType === "get") {
            modules.database.query("SELECT pincode AS pin FROM user WHERE snowflake = ?;", [snowflake])
                .then((data) => {
                    interaction.reply({ content: `Your Pincode is: \`${data[0].pin}\`.`, ephemeral: true });
                }).catch(() => {
                    return interaction.reply({
                        content: "You do not have an account yet. Create an account with the `/register` command.",
                        ephemeral: true
                    });
                });
        } else if (actionType === "change" && newPincode != null) {
            modules.database.query("UPDATE user SET pincode = ? WHERE snowflake = ?;", [newPincode, snowflake])
                .then(() => {
                    interaction.reply({
                        content: `Your pincode has been Successfully changed. New pincode: \`${newPincode}\`.`,
                        ephemeral: true
                    });
                    logger.log(`${username} has changed their pincode.`, "info");
                }).catch(() => {
                    return interaction.reply({
                        content: "You do not have an account yet. Create an account with the `/register` command.",
                        ephemeral: true
                    });
                });
        } else {
            interaction.reply({
                content: "With this actiontype you need to fill in the optional input, the new pincode. Please try again.",
                ephemeral: true
            });
        }
    }
};
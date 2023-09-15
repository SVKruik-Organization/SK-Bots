const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const fs = require('fs');
const modules = require('..')

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('block')
        .setDescription('Block a user from using this bot.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choose wheter you want to add or remove someone from the blacklist.')
                .setRequired(true)
                .addChoices(
                    { name: 'Add', value: 'add' },
                    { name: 'Remove', value: 'remove' }
                ))
        .addUserOption(option => option.setName('target').setDescription('The person you want to add or remove from the blacklist.').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const targetUsername = interaction.options.getUser('target').username;
        const targetSnowflake = interaction.options.getUser('target').id;
        const actionType = interaction.options.getString('action');
        let data;
        let message;

        fs.readFile('../users.json', 'utf-8', (err, jsonData) => {
            if (err) {
                return console.error('Error reading file:', err);
            } else {
                data = JSON.parse(jsonData);
                
                if (actionType === "add") {
                    if (data.blockedUsers.includes(targetSnowflake)) {
                        return interaction.reply({ content: "User is already blacklisted. To remove a member from the blacklist, use the `remove` option." });
                    } else {
                        data.blockedUsers.push(targetSnowflake);
                        modules.log(`${targetUsername} was added to the blacklist by ${interaction.user.username}.`, "alert");
                        message = `<@${targetSnowflake}> has been added to the blacklist. They are no longer able to use my commands.`;
                    };
                } else if (actionType === "remove") {
                    if (!data.blockedUsers.includes(targetSnowflake)) {
                        return interaction.reply({ content: "User is not on the blacklist. To blacklist a member, use the `add` option." });
                    } else {
                        const index = data.blockedUsers.indexOf(targetSnowflake);
                        if (index > -1) data.blockedUsers.splice(index, 1);
                        modules.log(`${targetUsername} was removed from the blacklist by ${interaction.user.username}.`, "alert");
                        message = `<@${targetSnowflake}> has been removed from the blacklist. They are now able to use my commands again.`;
                    };
                };

                fs.writeFile('../users.json', JSON.stringify(data, null, 4), (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                    } else interaction.reply({ content: message });
                });
            }
        });
    }
};
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..')

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('block')
        .setDescription('Block a user from using this bot.')
        .addUserOption(option => option.setName('target').setDescription('The target member.').setRequired(true))
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Whether you want to modify or check the user status.')
                .setRequired(true)
                .addChoices(
                    { name: 'Add', value: 'add' },
                    { name: 'Remove', value: 'remove' },
                    { name: 'Check', value: 'check' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const targetUsername = interaction.options.getUser('target').username;
        const targetSnowflake = interaction.options.getUser('target').id;
        const actionType = interaction.options.getString('action');

        let status = 2;
        if (actionType === "add") {
            status = 1;
        } else if (actionType === "remove") status = 0;

        if (status < 2) {
            modules.database.query("UPDATE user SET blocked = ? WHERE snowflake = ?", [status, targetSnowflake])
                .then((data) => {
                    if (data.affectedRows === 0) return interaction.reply({ content: `User <@${targetSnowflake}> does not have an account yet.` });
                    const index = modules.blockedUsers.indexOf(targetSnowflake);
                    if (status === 0) {
                        if (index > -1) modules.blockedUsers.splice(index, 1);
                        modules.log(`${targetUsername} was removed from the blacklist by ${interaction.user.username}.`, "alert");
                        interaction.reply({ content: `<@${targetSnowflake}> has been removed from the blacklist. They are now able to use my commands again.` });
                    } else if (status === 1) {
                        if (index !== -1) modules.blockedUsers.push(targetSnowflake);
                        modules.log(`${targetUsername} was added to the blacklist by ${interaction.user.username}.`, "alert");
                        interaction.reply({ content: `<@${targetSnowflake}> has been added to the blacklist. They are no longer able to use my commands.` });
                    }
                }).catch(() => {
                interaction.reply({
                    content: "Something went wrong while modifying the block status of this user. Please try again later.",
                    ephemeral: true
                });
            });
        } else {
            modules.database.query("SELECT blocked FROM user WHERE snowflake = ?", [targetSnowflake])
                .then((data) => {
                    if (!data.length) return interaction.reply({
                        content: `User <@${targetSnowflake}> does not have an account yet.`,
                        ephemeral: true
                    });
                    interaction.reply({ content: `Blocked status of user <@${targetSnowflake}>: \`${data[0].blocked}\`` });
                }).catch(() => {
                interaction.reply({
                    content: "Something went wrong while checking the block status of this user. Please try again later.",
                    ephemeral: true
                });
            });
        }
    }
};
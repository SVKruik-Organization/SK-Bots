const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..')

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Add a super user for use of admin commands.')
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
            modules.database.query("UPDATE user SET super = ? WHERE snowflake = ?", [status, targetSnowflake])
                .then((data) => {
                    if (data.affectedRows === 0) return interaction.reply({ content: `User <@${targetSnowflake}> does not have an account yet.` })
                    if (status === 0) {
                        modules.log(`${targetUsername} was removed from the super users by ${interaction.user.username}.`, "alert");
                        interaction.reply({ content: `<@${targetSnowflake}> has been removed from the super users. They are no longer able to use my admin commands.` });
                    } else if (status === 1) {
                        modules.log(`${targetUsername} was added to the super users by ${interaction.user.username}.`, "alert");
                        interaction.reply({ content: `<@${targetSnowflake}> has been added to the super users. They are now able to use my admin commands.` });
                    }

                }).catch(() => {
                interaction.reply({
                    content: "Something went wrong while modifying the super status of this user. Please try again later.",
                    ephemeral: true
                });
            });
        } else {
            modules.database.query("SELECT super FROM user WHERE snowflake = ?", [targetSnowflake])
                .then((data) => {
                    if (!data.length) return interaction.reply({
                        content: `User <@${targetSnowflake}> does not have an account yet.`,
                        ephemeral: true
                    });
                    interaction.reply({ content: `Super status of user <@${targetSnowflake}>: \`${data[0].super}\`` });
                }).catch(() => {
                interaction.reply({
                    content: "Something went wrong while checking the super status of this user. Please try again later.",
                    ephemeral: true
                });
            });
        }

    }
};
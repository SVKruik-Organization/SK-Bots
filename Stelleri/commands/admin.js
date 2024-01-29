const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Add a super user for use of admin commands.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option
            .setName('target')
            .setDescription('The target member.')
            .setRequired(true))
        .addStringOption(option => option
            .setName('action')
            .setDescription('Whether you want to modify or check the user status.')
            .setRequired(true)
            .addChoices(
                { name: 'Add', value: 'add' },
                { name: 'Remove', value: 'remove' },
                { name: 'Check', value: 'check' }
            )),
    async execute(interaction) {
        try {
            const targetUsername = interaction.options.getUser('target').username;
            const targetSnowflake = interaction.options.getUser('target').id;
            const actionType = interaction.options.getString('action');

            // Action Filtering
            let status = 2;
            if (actionType === "add") {
                status = 1;
            } else if (actionType === "remove") status = 0;

            // Modify
            if (status < 2) {
                modules.database.query("UPDATE user SET super = ? WHERE snowflake = ?", [status, targetSnowflake])
                    .then((data) => {
                        // Validation
                        if (data.affectedRows === 0) return interaction.reply({
                            content: `User <@${targetSnowflake}> does not have an account yet.`,
                            ephemeral: true
                        })

                        // Remove
                        if (status === 0) {
                            logger.log(`${targetUsername} was removed from the super users by '${interaction.user.username}@${interaction.user.id}'.`, "alert");
                            interaction.reply({
                                content: `<@${targetSnowflake}> has been removed from the super users. They are no longer able to use my admin commands.`,
                                ephemeral: true
                            });

                            // Add
                        } else if (status === 1) {
                            logger.log(`${targetUsername} was added to the super users by '${interaction.user.username}@${interaction.user.id}'.`, "alert");
                            interaction.reply({
                                content: `<@${targetSnowflake}> has been added to the super users. They are now able to use my admin commands.`,
                                ephemeral: true
                            });
                        }
                    }).catch(() => {
                        interaction.reply({
                            content: "Something went wrong while modifying the super status of this user. Please try again later.",
                            ephemeral: true
                        });
                    });

                // Check
            } else {
                modules.database.query("SELECT super FROM user WHERE snowflake = ?", [targetSnowflake])
                    .then(async (data) => {
                        // Validation
                        if (!data.length) return interaction.reply({
                            content: `User <@${targetSnowflake}> does not have an account yet.`,
                            ephemeral: true
                        });

                        interaction.reply({
                            content: `Super status of user <@${targetSnowflake}>: \`${data[0].super === 1}\``,
                            ephemeral: true
                        });
                    }).catch(() => {
                        interaction.reply({
                            content: "Something went wrong while checking the super status of this user. Please try again later.",
                            ephemeral: true
                        });
                    });
            }
        } catch (error) {
            console.error(error);
        }
    }
};
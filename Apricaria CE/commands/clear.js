const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const userUtils = require('../utils/user.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('clear')
        .setNameLocalizations({
            nl: "opruimen"
        })
        .setDescription('Bulk delete messages inside the current channel.')
        .setDescriptionLocalizations({
            nl: "Berichten in bulk verwijderen binnen het huidige kanaal."
        })
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addIntegerOption(option => option
            .setName('amount')
            .setNameLocalizations({
                nl: "hoeveelheid"
            })
            .setDescription('Amount of messages to delete.')
            .setDescriptionLocalizations({
                nl: "De hoeveelheid berichten die verwijderd moeten worden."
            })
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(50)),
    async execute(interaction) {
        try {
            // Permission Validation
            if (!(await userUtils.checkAdmin(interaction))) return interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Please try again later, or contact moderation to receive elevated permissions.`,
                ephemeral: true
            });

            const amount = interaction.options.getInteger('amount');
            await interaction.reply({
                content: `Deleting ${amount} messages . . .`,
                ephemeral: true
            });

            // Bulk Delete
            setTimeout(() => {
                interaction.deleteReply();
                interaction.channel.bulkDelete(amount).catch(() => {
                    interaction.editReply({
                        content: "Atleast one of the messages you are trying to delete is older than \`14\` days. Discord is not allowing me to do that, so you will have to delete them manually (or lower your clear amount to potentially exclude the erroneous message).",
                        ephemeral: true
                    });
                });
            }, 1000);
        } catch (error) {
            logger.error(error);
        }
    }
};
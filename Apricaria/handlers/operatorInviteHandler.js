const { ButtonBuilder, ActionRowBuilder } = require('discord.js');
const modules = require('..');
const logger = require('../utils/logger.js');
const userUtils = require('../utils/user.js');

/**
 * Handle Operator invite rejection.
 * @param {object} message Discord Message Object
 */
function handleDeclineCommand(message) {
    const declineButton = new ButtonBuilder()
        .setCustomId(`declineOperatorInvite`)
        .setLabel(`Decline`)
        .setStyle('Danger');

    return message.reply({ content: `Hello there, <@${message.author.id}>! Are you sure you want to decline your pending Operator invites?`, components: [new ActionRowBuilder().addComponents(declineButton)] });
}

function handleDeclineInteraction(interaction) {
    modules.database.query("SELECT om_owner.* FROM operator_member om_member JOIN operator_member om_owner ON om_member.team_tag = om_owner.team_tag WHERE om_member.snowflake = ? AND om_owner.team_owner = 1; DELETE FROM operator_member WHERE snowflake = ? AND invite_pending = 1;", [interaction.user.id, interaction.user.id])
        .then(async (data) => {
            interaction.message.edit({ content: `Alright, I declined any pending Operator invites and notified the inviters.`, components: [] });

            // Notify Team Owner
            if (data[0].length === 0) return;
            for (let i = 0; i < data[0].length; i++) {
                const teamOwner = data[0][i];
                const teamOwnerUser = await userUtils.findUserById(teamOwner.snowflake);
                teamOwnerUser.send({ content: `<@${interaction.user.id}> has declined the Operator invite to join your team.` })
                    .catch(() => {
                        logger.log(`Sending Operator invite decline message to team owner was not succesful.`);
                    });
            }
        }).catch((error) => {
            logger.error(error);
            return interaction.message.edit({ content: `Something went wrong while removing your invite. Please try again later.`, components: [] });
        });
}

module.exports = {
    "handleDeclineCommand": handleDeclineCommand,
    "handleDeclineInteraction": handleDeclineInteraction
}
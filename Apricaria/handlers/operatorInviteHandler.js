const { ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const modules = require('..');
const logger = require('../utils/logger.js');
const userUtils = require('../utils/user.js');

/**
 * Handle Operator invite rejection.
 * @param {object} message Discord Message Object
 */
function handleDeclineInit(message) {
    modules.database.query("SELECT om_owner.*, username, edition FROM operator_member om_member JOIN operator_member om_owner ON om_member.team_tag = om_owner.team_tag LEFT JOIN user_general ON user_general.snowflake = om_owner.snowflake LEFT JOIN operator_team ON operator_team.team_tag = om_owner.team_tag WHERE om_member.snowflake = ? AND om_member.invite_pending = 1 AND om_owner.team_owner = 1;", [message.author.id])
        .then((data) => {
            if (data.length === 0) return message.reply({
                content: `Hello there, <@${message.author.id}>! You do not have any pending Operator invites at the moment.`
            });

            const stringOptions = [];
            for (let i = 0; i < data.length; i++) {
                stringOptions.push(new StringSelectMenuOptionBuilder()
                    .setLabel(`Decline ${data[i].username}`)
                    .setDescription(`Edition: ${data[i].edition}, Owner: ${data[i].username}`)
                    .setValue(`operatorInviteDeclineTeamTag-${data[i].team_tag}`));
            }

            const select = new StringSelectMenuBuilder()
                .setCustomId('operatorInviteDeclineSelectMenu')
                .setPlaceholder('Make a selection.')
                .addOptions(stringOptions);

            return message.reply({
                content: `Hello there, <@${message.author.id}>! What invite would you like to decline?`,
                components: [new ActionRowBuilder().addComponents(select)]
            });
        }).catch((error) => {
            logger.error(error);
            return message.reply({
                content: `Something went wrong while loading your pending invites. Please try again later.`
            });
        });
}

async function handleDeclineSelect(interaction) {
    const selectedTeamTag = interaction.values[0].split("-")[1];
    const declineButton = new ButtonBuilder()
        .setCustomId(`declineOperatorInvite-${selectedTeamTag}`)
        .setLabel("Decline")
        .setStyle("Danger");

    await interaction.message.reply({
        content: "Are you sure you want to decline this Operator invite? This action is irreversibele by you, and you must be invited again.",
        components: [new ActionRowBuilder().addComponents(declineButton)]
    });
    interaction.message.delete();
}

function handleDeclineFinal(interaction) {
    const teamTag = interaction.customId.split("-")[1];
    modules.database.query("SELECT * FROM operator_member WHERE team_tag = ? AND team_owner = 1; DELETE FROM operator_member WHERE snowflake = ? AND invite_pending = 1 AND team_tag = ?;", [teamTag, interaction.user.id, teamTag])
        .then(async (data) => {
            interaction.message.edit({
                content: `Alright, I declined the pending invite and sent a message to ${data[0][0] ? `<@${data[0][0].snowflake}>` : "the inviter"}.`,
                components: []
            });

            // Notify Team Owner
            if (data[0].length === 0) return;
            const teamOwnerUser = await userUtils.findUserById(data[0][0].snowflake);
            teamOwnerUser.send({ content: `<@${interaction.user.id}> has declined the Operator invite to join your team.` })
                .catch(() => {
                    logger.log(`Sending Operator invite decline message to team owner was not succesful.`);
                });
        }).catch((error) => {
            logger.error(error);
            return interaction.message.reply({
                content: `Something went wrong while removing your invite. Please try again later.`,
                components: []
            });
        });
}

module.exports = {
    "handleDeclineInit": handleDeclineInit,
    "handleDeclineSelect": handleDeclineSelect,
    "handleDeclineFinal": handleDeclineFinal
}
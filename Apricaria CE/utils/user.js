const modules = require('..');
const logger = require('./logger.js');
const config = require('../assets/config.js');

/**
 *
 * @param {string} userId Find a specific User by snowflake (id).
 * @returns Discord User Object
 */
async function findUserById(userId) {
    return await modules.client.users.fetch(userId);
}

/**
 * Check if the user has the rights to perform this command.
 * @param {object} interaction Discord Interaction Object
 * @returns {boolean} If the user is an Administrator.
 */
async function checkAdmin(interaction) {
    try {
        const data = await modules.database.query("SELECT user_snowflake FROM user_administrator WHERE user_snowflake = ? AND guild_snowflake = ?;", [interaction.user.id, interaction.guild.id]);
        if (data.length === 0) return false;
        const member = await interaction.guild.members.cache.get(interaction.user.id);
        const hasRole = await member.roles.cache.some(role => role.name === `${config.general.name} Administrator`);
        return hasRole;
    } catch (error) {
        logger.error(error);
        return false;
    }
}

/**
 * Check if someone is an Operator for elevated commands in the current server.
 * @param {object} interaction Discord Interaction Object
 * @returns {}
 */
async function checkOperator(interaction) {
    try {
        const data = await modules.database.query("SELECT guild.team_tag, account_status, team_owner FROM operator_member LEFT JOIN guild ON operator_member.team_tag = guild.team_tag WHERE operator_member.snowflake = ? AND guild.snowflake = ?;", [interaction.user.id, interaction.guild.id]);
        if (data.length === 0) {
            await interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Note that this is an Operator command, so you need additional permissionsand a **special account**. This is not the \`/register\` account. Please try again later, or contact <@${config.general.authorSnowflake}> if you think this is a mistake.`,
                ephemeral: true
            });
            return { hasPermissions: false, data: [] };
        } else if (data[0].account_status < 2) {
            await interaction.reply({
                content: "I see you already have an account, but it is not verified for this server yet (the Operator team that manages this server). Verification is required for use of Operator commands. Please verify your account and try again later.",
                ephemeral: true
            });
            return { hasPermissions: false, data: data[0] };
        }
        return { hasPermissions: true, data: data[0] };
    } catch (error) {
        logger.error(error);
        return { hasPermissions: false, data: [] };
    }
}


module.exports = {
    "checkAdmin": checkAdmin,
    "checkOperator": checkOperator,
    "findUserById": findUserById
}

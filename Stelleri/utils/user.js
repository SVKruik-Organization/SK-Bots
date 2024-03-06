const modules = require('..');
const logger = require('./logger.js');
const config = require('../assets/config.js');

/**
 *
 * @param {string} userId Find a specific User by snowflake (id).
 * @returns Discord User Object
 */
async function findUserById(userId) {
    const user = await modules.client.users.fetch(userId);
    return user;
}

/**
 * Check if the user has the rights to perform this command.
 * @param {string} snowflake Discord User ID of the interaction author.
 * @param {object} guild Discord Guild Object of the guild the interaction is in.
 * @returns {boolean} If the user is an Administrator.
 */
async function checkAdmin(snowflake, guild) {
    try {
        const data = await modules.database.query("SELECT user_snowflake FROM user_administrator WHERE user_snowflake = ? AND guild_snowflake = ?;", [snowflake, guild.id]);
        if (data.length === 0) return false;
        const member = await guild.members.cache.get(snowflake);
        const hasRole = await member.roles.cache.some(role => role.name === `${config.general.name} Administrator`);
        return hasRole;
    } catch (error) {
        logger.error(error);
        return false;
    }
}

/**
 * Check if someone is an Operator for elevated commands
 * @param {string} snowflake Discord User ID of the interaction author.
 * @param {object} guild Discord Guild Object of the guild the interaction is in.
 * @returns {}
 */
async function checkOperator(snowflake, guild, interaction) {
    try {
        const data = await modules.database.query("SELECT guild.team_tag, invite_pending, verified, team_owner FROM operator_member LEFT JOIN guild ON operator_member.team_tag = guild.team_tag WHERE operator_member.snowflake = ? AND guild.snowflake = ?;", [snowflake, guild.id]);
        if (data.length === 0) {
            interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Note that this is an Operator command, so you need additional permissions. Please try again later, or contact moderation if you think this is a mistake.`,
                ephemeral: true
            });
            return { hasPermissions: false, data: [] };
        } else if (data[0].invite_pending) {
            interaction.reply({
                content: "You did not accept the invite yet. You should have received a message with instructions (send by me or your buddy). Please refer to the instructions and try again later.",
                ephemeral: true
            });
            return { hasPermissions: false, data: data[0] };
        } else if (!data[0].verified) {
            interaction.reply({
                content: "I see you already have an account, but it is not verified yet. Verification is required for use of Operator commands. Please verify your account and try again later.",
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

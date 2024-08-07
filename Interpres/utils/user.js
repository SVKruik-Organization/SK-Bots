const modules = require('..');
const logger = require('./logger.js');
const config = require('../config.js');

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

module.exports = {
    "checkAdmin": checkAdmin,
    "findUserById": findUserById
}

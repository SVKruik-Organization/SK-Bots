const modules = require('..');
const dateUtils = require('../utils/date');
const logger = require('../utils/logger');

/**
 * Handle Operator invite rejection.
 * @param {object} message Discord Message Object
 */
function handleDecline(message) {
    const snowflake = message.author.id;
    const username = message.author.username;
    const date = dateUtils.getDate(message.createdTimestamp).today;

    modules.database.query("DELETE FROM operator WHERE snowflake = ? AND invite_pending = 1;", [snowflake])
        .then(() => {
            // WIP - https://github.com/SVKruik-Organization/Discord-Bots/issues/67
            return message.reply(`Hello there, <@${snowflake}>! I have removed your pending Operator invite(s) if there were any.`);
        }).catch((error) => {
            logger.error(error);
            return message.reply(`Something went wrong while removing your invite. Please try again later.`);
        });
}

module.exports = {
    "handleDecline": handleDecline
}
const modules = require('..');
const logger = require('../utils/logger.js');

/**
 * Log a new purchase.
 * @param {number} cost The total cost of the purchase.
 * @param {string} product The name of the bought product.
 * @param {number} quantity The amount of products bought.
 * @param {string} type The type of purchase.
 * @param {string} interaction Discord Interaction Object
 * @param {number} remaining The remaining Bits in their wallet after purchase.
 * @param {string} guildSnowflake The Guild ID of the purchase location.
 * @returns Status
 */
async function post(cost, product, quantity, type, interaction, remaining, guildSnowflake) {
    try {
        let query;
        switch (product) {
            case "xp15":
                query = `UPDATE user_inventory SET xp15 = xp15 + ${quantity} WHERE snowflake = ${interaction.user.id}`;
                break;
            case "xp50":
                query = `UPDATE user_inventory SET xp50 = xp50 + ${quantity} WHERE snowflake = ${interaction.user.id}`;
                break;
            case "role_color":
                query = `UPDATE user_inventory SET role_color = role_color + ${quantity} WHERE snowflake = ${interaction.user.id}`;
                break;
            default:
                break;
        }
        if (!query) return false;

        const response = await modules.database.query(`INSERT INTO purchase (snowflake, cost, product, quantity, type, date, remaining_bits, method, guild_snowflake) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, "Stelleri Discord Bot", ?); ${query}`, [interaction.user.id, cost, product, quantity, type, remaining, guildSnowflake])
        if (response && response[0] && response[0].affectedRows) {
            logger.log(`Successfully updated purchase history for '${interaction.user.username}@${interaction.user.id}' ${product}@${quantity}.`, "info");
            return true;
        } else return false;
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    "post": post
}

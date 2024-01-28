const modules = require('..');
const logger = require('../utils/logger');

/**
 * Log a new purschase.
 * @param {number} cost The total cost of the purschase.
 * @param {string} product The name of the bought product.
 * @param {number} quantity The amount of products bought.
 * @param {string} type The type of purschase.
 * @param {string} snowflake The User ID of the client.
 * @param {number} remaining The remaining Bits in their wallet after purschase.
 */
function post(cost, product, quantity, type, snowflake, remaining) {
    let query;
    switch (product) {
        case "xp15":
            query = `UPDATE user_inventory SET xp15 = xp15 + ${quantity} WHERE snowflake = ${snowflake}`;
            break;
        case "xp50":
            query = `UPDATE user_inventory SET xp50 = xp50 + ${quantity} WHERE snowflake = ${snowflake}`;
        default:
            break;
    }
    if (!query) return;

    modules.database.query(`INSERT INTO purschase_history (snowflake, cost, product, quantity, type, date, remaining_bits, method) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, "Stelleri Discord Bot"); ${query}`, [snowflake, cost, product, quantity, type, remaining])
        .then(() => {
            logger.log(`Successfully updated purschase history for ${snowflake} ${product}@${quantity}.`, "info");
        }).catch((error) => {
            console.log(error);
            logger.log("Something went wrong while trying updating the purschase history.", "warning");
        });
}

module.exports = {
    "post": post
}

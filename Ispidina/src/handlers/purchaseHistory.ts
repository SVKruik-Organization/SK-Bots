import { Interaction } from 'discord.js';
import { database } from '../index.js';
import { logError, logMessage } from '../utils/logger.js';
import { general } from '../config.js';

/**
 * Store a new purchase in the database.
 * @param cost The total cost of the purchase.
 * @param product The name of the bought product.
 * @param quantity The amount of products bought.
 * @param type The type of purchase.
 * @param interaction Discord Interaction Object
 * @param remaining The remaining Bits in their wallet after purchase.
 * @returns Status
 */
export async function post(cost: number, product: string, quantity: number, type: string, interaction: Interaction, remaining: number): Promise<boolean> {
    try {
        let query;
        switch (product) {
            case "xp15":
                query = `UPDATE user_inventory SET xp15 = xp15 + ${quantity} WHERE snowflake = ${interaction.user.id}`;
                break;
            case "xp50":
                query = `UPDATE user_inventory SET xp50 = xp50 + ${quantity} WHERE snowflake = ${interaction.user.id}`;
                break;
            case "role_cosmetic":
                query = `UPDATE user_inventory SET role_cosmetic = role_cosmetic + ${quantity} WHERE snowflake = ${interaction.user.id}`;
                break;
            default:
                break;
        }
        if (!query) return false;

        const response: any = await database.query(`INSERT INTO purchase (snowflake, balance_change, product, quantity, type, date, remaining_bits, method, guild_snowflake) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, "${general.name} Discord Bot", ?); ${query}`, [interaction.user.id, -1 * cost, product, quantity, type, remaining, interaction.guild?.id])
        if (response && response[0] && response[0].affectedRows) {
            logMessage(`Successfully updated purchase history for '${interaction.user.username}@${interaction.user.id}' ${product}@${quantity}.`, "info");
            return true;
        } else return false;
    } catch (error: any) {
        logError(error);
        return false;
    }
}

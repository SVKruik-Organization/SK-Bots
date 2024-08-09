import { economy } from '../config.js';
import { logError, logMessage } from '../utils/logger.js';

/**
 * Initialize the handler to start increasing back accounts every hour.
 */
export function initInterestHandler(): void {
    logMessage(`Started Bank interest increase interval with a rate of ${economy.interestRate}% every hour.`, "info");
    setInterval(async () => {
        try {
            const { database } = await import("../index.js");
            await database.query("UPDATE economy SET bank = ROUND(bank * ?, 0) WHERE 1 = 1;", [economy.interestRate])
            logMessage(`Awarded all Bank accounts with a ${economy.interestRate}% interest bonus.`, "info");
        } catch (error: any) {
            logError(error);
        }
    }, 3600000);
}

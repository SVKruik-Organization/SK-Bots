const modules = require('..');
const config = require('../config.js');
const logger = require('./logger.js');

function init() {
    logger.log(`Started Bank interest increase interval with a rate of ${config.economy.interestRate}% every hour.`, "info");
    setInterval(() => {
        try {
            modules.database.query("UPDATE economy SET bank = ROUND(bank * ?, 0) WHERE 1 = 1;", [config.economy.interestRate])
                .then(logger.log(`Awarded all Bank accounts with a ${config.economy.interestRate}% interest bonus.`, "info"))
                .catch((error) => {
                    logger.error(error);
                    logger.log("Something went wrong while processing interest.", "warning");
                });
        } catch (error) {
            logger.error(error);
        }
    }, 3600000); // Every Hour
}

module.exports = {
    "init": init
}

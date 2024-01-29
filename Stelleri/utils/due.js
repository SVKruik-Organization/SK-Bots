const modules = require('..');
const logger = require('./logger.js');
const { getDate } = require('./date.js');

/**
 * Index once on startup.
 * After that, checking will happen on memory.
 */
try {
    modules.database.query("SELECT T.snowflake, T.expiry, T.description FROM (SELECT snowflake, xp_active_expiry AS expiry, xp_active AS description FROM user_inventory UNION ALL SELECT snowflake, daily_expiry, 'daily' FROM user) as T WHERE T.expiry IS NOT NULL;")
        .then((data) => {
            const dueDates = [];
            for (let i = 0; i <= data.length; i++) {
                if (i === data.length) {
                    logger.log("Fetched all due dates.", "info");
                    modules.dueDates = dueDates;
                    enableWatcher();
                } else dueDates.push(dueDateConstructor(data[i]));
            }
        }).catch((error) => {
            console.error(error);
            logger.log("Loading due dates went wrong. Aborting.", "fatal");
        });
} catch (error) {
    console.error(error);
}

function dueDateConstructor(data) {
    return {
        "snowflake": data.snowflake,
        "expiry": getDate(data.expiry, null).today,
        "description": data.description
    }
}

function dueAdd(snowflake, type) {
    try {
        // + 24 Hours
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + 1);

        // Daily Reward Collection
        if (type === "daily") {
            modules.database.query("UPDATE user SET daily_expiry = DATE_ADD(NOW(), INTERVAL 1 DAY) WHERE snowflake = ?;", [snowflake])
                .then(() => {
                    logger.log(`Successfully added Daily Reward cooldown for user '${snowflake}' ${type}@${newDate.toLocaleDateString()} to the database.`, "info");
                    modules.dueDates.push({
                        "snowflake": snowflake,
                        "expiry": getDate(newDate, null).today,
                        "description": type
                    });
                }).catch(() => {
                    logger.log("Something went wrong while updating due dates.", "warning");
                });

            // XP-Booster Activation
        } else if (type === "xp15" || type === "xp50") {
            modules.dueDates.push({
                "snowflake": snowflake,
                "expiry": getDate(newDate, null).today,
                "description": type
            });
        }
    } catch (error) {
        console.error(error);
    }
}

function enableWatcher() {
    // Every 5 Minutes
    purgeExpired();
    setInterval(() => {
        purgeExpired();
    }, 300000);
}

function purgeExpired() {
    try {
        if (modules.dueDates.length === 0) return logger.log("Due dates already up-to-date (none pending).", "info");
        const expiredDueDates = modules.dueDates.filter(dueDate => Date.parse(getDate(dueDate.expiry, null).today) < Date.parse(getDate(null, null).today));
        if (expiredDueDates.length === 0) return logger.log("Due dates already up-to-date (none expired).", "info");

        // Update Database
        for (let i = 0; i < expiredDueDates.length; i++) {
            if (expiredDueDates[i].description === "daily") {
                modules.database.query("UPDATE user SET daily_expiry = NULL WHERE snowflake = ?", [expiredDueDates[i].snowflake])
                    .catch(() => {
                        logger.log("Updating expired due dates went wrong for type 'daily'.", "warning");
                    });
            } else if (expiredDueDates[i].description === "xp15" || expiredDueDates[i].description === "xp50") {
                modules.database.query("UPDATE user_inventory SET xp_active = 'None', xp_active_expiry = NULL WHERE snowflake = ?", [expiredDueDates[i].snowflake])
                    .catch(() => {
                        logger.log(`Updating expired due dates went wrong for type '${expiredDueDates[i].description}'.`, "warning");
                    });
            }
        }

        // Update Memory
        modules.dueDates = modules.dueDates.filter(dueDate => Date.parse(getDate(dueDate.expiry, null).today) > Date.parse(getDate(null, null).today));
        logger.log("Updated expired due dates.", "info");
    } catch (error) {
        console.error(error);
    }
}


module.exports = {
    "dueAdd": dueAdd
}

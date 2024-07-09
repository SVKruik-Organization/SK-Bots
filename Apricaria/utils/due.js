const modules = require('..');
const logger = require('./logger.js');
const { getDate } = require('./date.js');
const embedConstructor = require('./embed.js');
const { time } = require('@discordjs/formatters');

/**
 * Index once on startup.
 * After that, checking will happen in-memory.
 */
try {
    modules.database.query("SELECT T.snowflake, T.expiry, T.description, T.data FROM (SELECT snowflake, xp_active_expiry AS expiry, xp_active AS description, NULL AS data FROM user_inventory UNION ALL SELECT snowflake, daily_expiry, 'daily', null FROM user_general UNION ALL SELECT snowflake, date_start, 'event', event_ticket FROM event LEFT JOIN event_attendee ON event_attendee.event_ticket = event.ticket WHERE date_start > NOW()) AS T WHERE T.expiry IS NOT NULL;")
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
            logger.error(error);
            logger.log("Loading due dates went wrong. Aborting.", "fatal");
        });
} catch (error) {
    logger.error(error);
}

function dueDateConstructor(data) {
    return {
        "snowflake": data.snowflake,
        "expiry": getDate(data.expiry, null).today,
        "description": data.description,
        "data": data.data
    }
}

/**
 * Add a due date for automatic tracking.
 * Depending on type parameter will be stored in memory or database.
 * @param {object} interaction Discord Interaction Object
 * @param {string} type The type of due date. Can be one of the following: daily, xp15, xp50 and event
 * @param {string} expiry The expiry datetime.
 * @param {string} data Additional payload.
 */
function dueAdd(interaction, type, expiry, data) {
    try {
        // Daily Reward Collection
        if (type === "daily") {
            modules.database.query("UPDATE user SET daily_expiry = DATE_ADD(NOW(), INTERVAL 1 DAY) WHERE snowflake = ?;", [interaction.user.id])
                .then((data) => {
                    // Validation
                    if (!data.affectedRows) return logger.log(`Could not update due date, AS user '${interaction.user.id}' does not have an account yet.`, "warning");
                    logger.log(`Recorded Daily Reward cooldown for user '${interaction.user.username}'@'${interaction.user.id}' ${type}@${expiry.toLocaleString()}.`, "info");
                    modules.dueDates.push({
                        "snowflake": interaction.user.id,
                        "expiry": getDate(expiry, null).today,
                        "description": type,
                        "data": data
                    });
                }).catch((error) => {
                    logger.error(error);
                    return logger.log("Something went wrong while updating due dates.", "warning");
                });

            // XP-Booster Activation & Event Attendee
        } else if (type === "xp15" || type === "xp50" || type === "event") {
            modules.dueDates.push({
                "snowflake": interaction.user.id,
                "expiry": getDate(expiry, null).today,
                "description": type,
                "data": data
            });
        }
    } catch (error) {
        logger.error(error);
    }
}

function enableWatcher() {
    // 5 Minutes accuracy for XP & Daily, purge retroactively
    purgeExpired();
    processEvents();
    setInterval(() => {
        purgeExpired();
        processEvents();
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
                    .catch((error) => {
                        logger.error(error);
                        return logger.log("Updating expired due dates went wrong for type 'daily'.", "warning");
                    });
            } else if (expiredDueDates[i].description === "xp15" || expiredDueDates[i].description === "xp50") {
                modules.database.query("UPDATE user_inventory SET xp_active = 'None', xp_active_expiry = NULL WHERE snowflake = ?", [expiredDueDates[i].snowflake])
                    .catch((error) => {
                        logger.error(error);
                        return logger.log(`Updating expired due dates went wrong for type '${expiredDueDates[i].description}'.`, "warning");
                    });
            }
        }

        // Update Memory
        modules.dueDates = modules.dueDates.filter(dueDate => Date.parse(getDate(dueDate.expiry, null).today) > Date.parse(getDate(null, null).today));
        logger.log("Updated expired due dates.", "info");
    } catch (error) {
        logger.error(error);
    }
}

function processEvents() {
    // Advanced setup for Event
    try {
        const events = modules.dueDates.filter(dueDate => dueDate.description === "event" && dueDate.expiry > getDate(null, null).today);
        for (let i = 0; i < events.length; i++) {
            const interval = 15; // Minutes
            const timeDifference = events[i].expiry.getTime() - getDate(null, null).today.getTime();

            // Event is starting within {interval} minutes
            if (timeDifference > 0 && timeDifference <= interval * 60 * 1000) {
                modules.database.query("SELECT snowflake FROM event_attendee WHERE event_ticket = ?; SELECT * FROM event WHERE ticket = ?;", [events[i].data, events[i].data])
                    .then(async (data) => {
                        const commencingEvent = data[1][0];
                        for (let i = 0; i <= data[0].length; i++) {
                            if (i === data[0].length) {
                                // Delete from Due Dates
                                modules.dueDates = modules.dueDates.filter(dueDate => dueDate.data !== commencingEvent.ticket);
                            } else {
                                // User Notification
                                const user = await modules.client.users.fetch(data[0][i].snowflake);
                                if (user) {
                                    const date = getDate(commencingEvent.date_start, null);

                                    // Standard Fields A
                                    const embedFields = [
                                        { name: "Title", value: commencingEvent.title, inline: true },
                                        { name: "Date", value: time(date.today), inline: true }];

                                    // Location
                                    if (commencingEvent.online) {
                                        embedFields.push({ name: "Location", value: `<#${commencingEvent.location}>`, inline: true });
                                    } else embedFields.push({ name: "Location", value: commencingEvent.location });

                                    // Standard Fields B
                                    embedFields.push({ name: "Description", value: `${commencingEvent.description}` });

                                    const embed = embedConstructor.create("Event Starting Soon!", "You are receiving this message because you have registered for the following event:", user, embedFields, ["event"]);
                                    user.send({ embeds: [embed] });
                                }
                            }
                        }
                    });
            }
        }
    } catch (error) {
        logger.error(error);
        logger.log("Parsing Event dates went wrong. Aborting.", "fatal");
    }
}

module.exports = {
    "dueAdd": dueAdd
}

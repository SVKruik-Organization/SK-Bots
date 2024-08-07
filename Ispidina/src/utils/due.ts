import { database, customClient } from '..';
import { logMessage, logError } from './logger';
import { getDate } from './date';
import { create } from './embed';
import { time } from '@discordjs/formatters';
import { DueDate } from '../types';
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';
let dueDates: Array<DueDate> = [];

/**
 * Index once on startup.
 * After that, checking will happen in-memory.
 */
try {
    database.query("SELECT T.snowflake, T.expiry, T.description, T.data FROM (SELECT snowflake, xp_active_expiry AS expiry, xp_active AS description, NULL AS data FROM user_inventory UNION ALL SELECT snowflake, daily_expiry, 'daily', null FROM user_general UNION ALL SELECT snowflake, date_start, 'event', event_ticket FROM event LEFT JOIN event_attendee ON event_attendee.event_ticket = event.ticket WHERE date_start > NOW()) AS T WHERE T.expiry IS NOT NULL;")
        .then((data: Array<DueDate>) => {
            const newDueDates: Array<DueDate> = [];
            for (let i = 0; i <= data.length; i++) {
                if (i === data.length) {
                    logMessage("Fetched all due dates.", "info");
                    dueDates = newDueDates;
                    enableWatcher();
                } else dueDates.push(dueDateConstructor(data[i]));
            }
        }).catch((error: any) => {
            logError(error);
            logMessage("Loading due dates went wrong. Aborting.", "fatal");
        });
} catch (error: any) {
    logError(error);
}

function dueDateConstructor(data: DueDate) {
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
 * @param interaction Discord Interaction Object
 * @param type The type of due date. Can be one of the following: daily, xp15, xp50 and event
 * @param expiry The expiry datetime.
 * @param data Additional payload.
 */
function dueAdd(interaction: ChatInputCommandInteraction | ButtonInteraction, type: string, expiry: Date, data: string | null) {
    try {
        // Daily Reward Collection
        if (type === "daily") {
            database.query("UPDATE user_general SET daily_expiry = DATE_ADD(NOW(), INTERVAL 1 DAY) WHERE snowflake = ?;", [interaction.user.id])
                .then((data) => {
                    // Validation
                    if (!data.affectedRows) return logMessage(`Could not update due date, as user '${interaction.user.id}' does not have an account yet.`, "warning");

                    const expiryDateObject = getDate(expiry, null);
                    logMessage(`Recorded Daily Reward cooldown for user '${interaction.user.username}'@'${interaction.user.id}' ${type}@${expiryDateObject.today.toLocaleString()}.`, "info");
                    dueDates.push({
                        "snowflake": interaction.user.id,
                        "expiry": expiryDateObject.today,
                        "description": type,
                        "data": data
                    });
                }).catch((error: any) => {
                    logError(error);
                    return logMessage("Something went wrong while updating due dates.", "warning");
                });

            // XP-Booster Activation & Event Attendee
        } else if (type === "xp15" || type === "xp50" || type === "event") {
            dueDates.push({
                "snowflake": interaction.user.id,
                "expiry": getDate(expiry, null).today,
                "description": type,
                "data": data
            });
        }
    } catch (error: any) {
        logError(error);
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
        if (dueDates.length === 0) return logMessage("Due dates already up-to-date (none pending).", "info");
        const expiredDueDates = dueDates.filter(dueDate => getDate(dueDate.expiry, null).today < getDate(null, null).today);
        if (expiredDueDates.length === 0) return logMessage("Due dates already up-to-date (none expired).", "info");

        // Update Database
        for (let i = 0; i < expiredDueDates.length; i++) {
            if (expiredDueDates[i].description === "daily") {
                database.query("UPDATE user_general SET daily_expiry = NULL WHERE snowflake = ?", [expiredDueDates[i].snowflake])
                    .catch((error) => {
                        logError(error);
                        return logMessage("Updating expired due dates went wrong for type 'daily'.", "warning");
                    });
            } else if (expiredDueDates[i].description === "xp15" || expiredDueDates[i].description === "xp50") {
                database.query("UPDATE user_inventory SET xp_active = 'None', xp_active_expiry = NULL WHERE snowflake = ?", [expiredDueDates[i].snowflake])
                    .catch((error) => {
                        logError(error);
                        return logMessage(`Updating expired due dates went wrong for type '${expiredDueDates[i].description}'.`, "warning");
                    });
            }
        }

        // Update Memory
        dueDates = dueDates.filter(dueDate => getDate(dueDate.expiry, null).today > getDate(null, null).today);
        logMessage("Updated expired due dates.", "info");
    } catch (error: any) {
        logError(error);
    }
}

function processEvents() {
    // Advanced setup for Event
    try {
        const events = dueDates.filter(dueDate => dueDate.description === "event" && dueDate.expiry > getDate(null, null).today);
        for (let i = 0; i < events.length; i++) {
            const interval = 15; // Minutes
            const timeDifference = events[i].expiry.getTime() - getDate(null, null).today.getTime();

            // Event is starting within {interval} minutes
            if (timeDifference > 0 && timeDifference <= interval * 60 * 1000) {
                database.query("SELECT snowflake FROM event_attendee WHERE event_ticket = ?; SELECT * FROM event WHERE ticket = ?;", [events[i].data, events[i].data])
                    .then(async (data) => {
                        const commencingEvent = data[1][0];
                        for (let i = 0; i <= data[0].length; i++) {
                            if (i === data[0].length) {
                                // Delete from Due Dates
                                dueDates = dueDates.filter(dueDate => dueDate.data !== commencingEvent.ticket);
                            } else {
                                // User Notification
                                const user = await customClient.users.fetch(data[0][i].snowflake);
                                if (user) {
                                    const date = getDate(commencingEvent.date_start, null);

                                    // Standard Fields A
                                    const embedFields = [
                                        { name: "Title", value: commencingEvent.title, inline: true },
                                        { name: "Date", value: time(date.today), inline: true }];

                                    // Location
                                    if (commencingEvent.online) {
                                        embedFields.push({ name: "Location", value: `<#${commencingEvent.location}>`, inline: true });
                                    } else embedFields.push({ name: "Location", value: commencingEvent.location, inline: false });

                                    // Standard Fields B
                                    embedFields.push({ name: "Description", value: `${commencingEvent.description}`, inline: false });

                                    const embed = create("Event Starting Soon!", "You are receiving this message because you have registered for the following event:", user, embedFields, ["event"]);
                                    user.send({ embeds: [embed] });
                                }
                            }
                        }
                    });
            }
        }
    } catch (error: any) {
        logError(error);
        logMessage("Parsing Event dates went wrong. Aborting.", "fatal");
    }
}

export { dueAdd, dueDates }
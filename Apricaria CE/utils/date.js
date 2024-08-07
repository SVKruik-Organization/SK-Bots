const config = require('../config.js');
const { CommandInteraction } = require('discord.js');

/**
 * Timestamp Calculation
 * @param {Date} datetime Overwrite Date.now.
 * @param {string} preferredLocale Overwrite default locale.
 * @returns Object with date, time, now and the full date string.
 */
function getDate(datetime, preferredLocale) {
    let targetDate = new Date();
    if (datetime) targetDate = new Date(datetime);
    let locale = "en-US";
    if (preferredLocale) locale = preferredLocale;
    const today = new Date(targetDate.toLocaleString(locale, {
        timeZone: config.general.timezone
    }));

    const hh = formatTime(today.getHours());
    const m = formatTime(today.getMinutes());

    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const date = `${dd}-${mm}-${yyyy}`;
    const time = `${hh}:${m}`;
    const fullDate = `${time} ${date}`;

    /**
     * Time formatter.
     * @param {number} value Add an extra zero if the input number is not double-digit.
     * @returns Formatted value.
     */
    function formatTime(value) {
        return value < 10 ? "0" + value : value.toString();
    }

    return { date, time, today, fullDate };
}

/**
 * Calculate the difference between two dates and return hours and minutes.
 * @param {Date} dateFuture The newer date.
 * @param {Date} datePast The older date.
 * @returns Object of remaining hours and minutes.
 */
function difference(dateFuture, datePast) {
    const dateDifference = dateFuture - datePast;
    let remainingHours = Math.floor((dateDifference % 86400000) / 3600000);
    let remainingMinutes = Math.round(((dateDifference % 86400000) % 3600000) / 60000);
    if (remainingMinutes === 60) {
        remainingHours++;
        remainingMinutes = 0;
    }

    return { remainingHours, remainingMinutes };
}

/**
 * Parse seperate date and time input to one Date object.
 * @param {string} rawDate The day/month/year input.
 * @param {string} rawTime The hour:minute input.
 * @returns On error or the parsed date.
 */
function datetimeParser(rawDate, rawTime) {
    const [day, month, year] = rawDate.split("/");
    const [hour, minute] = rawTime.split(":");
    if (day > 31 || month > 12 || year > new Date().getFullYear() + 2 || hour > 23 || minute > 59) return interaction.reply({ content: "Your date/time input is invalid. Please check your inputs try again.", ephemeral: true });
    let fullDate;
    try {
        fullDate = new Date(year, month - 1, day, hour, minute);
        if (isNaN(fullDate.getTime()) || fullDate < getDate(null, null).today) return interaction.reply({ content: "Your date/time input is invalid. Please check your inputs try again.", ephemeral: true });
    } catch (error) {
        return interaction.reply({ content: "Your date/time input is invalid. Please check your inputs try again.", ephemeral: true });
    }

    return fullDate;
}

module.exports = {
    "getDate": getDate,
    "difference": difference,
    "datetimeParser": datetimeParser
}

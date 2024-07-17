/**
 * Timestamp Calculation
 * @param {Date} datetime Overwrite Date.now.
 * @param {string} preferredLocale Overwrite default locale.
 * @returns Object with date, time and now.
 */
function getDate(datetime, preferredLocale) {
    let targetDate = new Date();
    if (datetime) targetDate = new Date(datetime);
    let locale = "en-US";
    if (preferredLocale) locale = preferredLocale;
    const today = new Date(targetDate.toLocaleString(locale, {
        timeZone: "Europe/Amsterdam"
    }));

    const hh = formatTime(today.getHours());
    const m = formatTime(today.getMinutes());

    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const date = `${dd}-${mm}-${yyyy}`;
    const time = `${hh}:${m}`;

    /**
     * Time formatter.
     * @param {number} value Add an extra zero if the input number is not double-digit.
     * @returns Formatted value.
     */
    function formatTime(value) {
        return value < 10 ? "0" + value : value.toString();
    }

    return { date, time, today };
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

module.exports = {
    "getDate": getDate,
    "difference": difference
}

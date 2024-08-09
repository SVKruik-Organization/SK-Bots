import { general } from '../config.js';

/**
 * Timestamp Calculation
 * @param datetime Overwrite Date.now.
 * @param preferredLocale Overwrite default locale.
 * @returns Object with date, time and now.
 */
export function getDate(datetime: Date | null, preferredLocale: string | null): { date: string, time: string, today: Date, fullDate: string } {
    let targetDate: Date = new Date();
    if (datetime) targetDate = new Date(datetime);
    let locale: string = "en-US";
    if (preferredLocale) locale = preferredLocale;
    const today: Date = new Date(targetDate.toLocaleString(locale, {
        timeZone: general.timezone
    }));

    const hh: string = formatTime(today.getHours());
    const m: string = formatTime(today.getMinutes());

    const dd: string = String(today.getDate()).padStart(2, '0');
    const mm: string = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy: number = today.getFullYear();

    const date: string = `${dd}-${mm}-${yyyy}`;
    const time: string = `${hh}:${m}`;

    /**
     * Time formatter.
     * @param value Add an extra zero if the input number is not double-digit.
     * @returns Formatted value.
     */
    function formatTime(value: number): string {
        return value < 10 ? "0" + value : value.toString();
    }

    const fullDate: string = `${time} ${date}`;
    return { date, time, today, fullDate };
}

/**
 * Calculate the difference between two dates and return hours and minutes.
 * @param dateFuture The newer date.
 * @param datePast The older date.
 * @returns Object of remaining hours and minutes.
 */
export function difference(dateFuture: Date, datePast: Date): Difference {
    const dateDifference: number = dateFuture.getTime() - datePast.getTime();
    let remainingHours: number = Math.floor((dateDifference % 86400000) / 3600000);
    let remainingMinutes: number = Math.round(((dateDifference % 86400000) % 3600000) / 60000);
    if (remainingMinutes === 60) {
        remainingHours++;
        remainingMinutes = 0;
    }

    return { remainingHours, remainingMinutes };
}

export type Difference = {
    remainingHours: number,
    remainingMinutes: number
}

/**
 * Parse seperate date and time input to one Date object.
 * @param rawDate The day/month/year input.
 * @param rawTime The hour:minute input.
 * @returns On error or the parsed date.
 */
export function datetimeParser(rawDate: string, rawTime: string): Date | boolean {
    const day: number = parseInt(rawDate.split("/")[0]);
    const month: number = parseInt(rawDate.split("/")[1]);
    const year: number = parseInt(rawDate.split("/")[2]);

    const hour: number = parseInt(rawTime.split(":")[0]);
    const minute: number = parseInt(rawTime.split(":")[1]);

    if (day > 31 || month > 12 || year > new Date().getFullYear() + 2 || hour > 23 || minute > 59) return false;
    let fullDate: Date;
    try {
        fullDate = new Date(year, month - 1, day, hour, minute);
        if (isNaN(fullDate.getTime()) || fullDate < getDate(null, null).today) return false;
    } catch (error: any) {
        return false
    }

    return fullDate;
}

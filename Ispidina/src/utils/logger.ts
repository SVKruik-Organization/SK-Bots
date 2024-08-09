import { getDate } from './date.js';
import { NextFunction, Response } from "express";
import fs from 'node:fs';

/**
 * Log messages to the log file.
 * @param data The data to log to the file.
 * @param rawType The type of message. For example: warning, alert, info, fatal, none.
 * @returns Status.
 */
export function logMessage(data: string, rawType: string): void {
    try {
        let logData: string;
        let type: string = rawType;
        if (!rawType) type = "none";

        if (type === "none") {
            logData = `${data}\n`;
        } else logData = `${getDate(null, null).time} [${type.toUpperCase()}] ${data}\n`;

        write(logData);
        console.log(logData);
        if (type === "fatal") throw new Error("Fatal log type. Terminated process.");
    } catch (error: any) {
        logError(error);
    }
}

/**
 * Log error messages to the log file.
 * @param data The error to write to the file.
 */
export function logError(data: any): void {
    const logData: string = `${getDate(null, null).time} [ERROR] ${data.stack}\n\n`;
    write(logData);
    console.error(logData);
}

/**
 * The writing to the log file itself.
 * @param data The text to write to the file.
 */
export function write(data: string): void {
    fs.appendFile(`./logs/${getDate(null, null).date}.log`, data, (error) => {
        if (error) console.error(`${getDate(null, null).time} [ERROR] Error appending to log file.`);
    });
}

/**
 * Logger for Express requests.
 * @param req The request.
 * @param res The responds.
 * @param next Send downstream.
 */
export function apiMiddleware(req: any, _res: Response, next: NextFunction): void {
    logMessage(`API Request || Agent: ${req.headers["user-agent"]} || ${req.method} ${req.url} || Body: ${req.body ? `(100 char limit) ${JSON.stringify(req.body).slice(0, 100)}` : "None"}`, "info");
    next();
}

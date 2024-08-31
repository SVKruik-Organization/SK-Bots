const dateCalculation = require('./date.js');
const fs = require('node:fs');

/**
 * Log messages to the log file.
 * @param {string} data The data to log to the file.
 * @param {string} rawType The type of message. For example: warning, alert, info, fatal, none.
 * @returns Status.
 */
function log(data, rawType) {
    try {
        let logData;
        let type = rawType;
        if (!rawType) type = "none";
        if (type === "none") {
            logData = `${data}\n`;
        } else logData = `${dateCalculation.getDate().time} [${type.toUpperCase()}] ${data}\n`;
        write(logData);
        console.log(logData);
        if (type === "fatal") throw new Error("Fatal log type. Terminated process.");
        return true;
    } catch (error) {
        error(error);
        return false;
    }
}

/**
 * Log error messages to the log file.
 * @param {Error | string} data The error to write to the file.
 */
function error(data) {
    const logData = `${dateCalculation.getDate().time} [ERROR] ${typeof data === "string" ? data : data.stack}\n`;
    write(logData);
    console.error(logData);
}

/**
 * The writing to the log file itself.
 * @param {string} data The text to write to the file.
 */
function write(data) {
    fs.appendFile(`./logs/${dateCalculation.getDate().date}.log`, data, (error) => {
        if (error) {
            console.error(`${dateCalculation.getDate().time} [ERROR] Error appending to log file.`);
            return false;
        }
    });
}

/**
 * Logger for Express requests.
 * @param req The request.
 * @param res The responds.
 * @param next Send downstream.
 */
function apiMiddleware(req, _res, next) {
    log(`API Request || Agent: ${req.headers["user-agent"]} || HTTP ${req.httpVersion} ${req.method} ${req.url} || IP: ${req.ip} || Body: ${req.body ? `(100 char limit) ${JSON.stringify(req.body).slice(0, 100)}` : "None"}`, "info");
    next();
}

module.exports = {
    "log": log,
    "error": error,
    "apiMiddleware": apiMiddleware
}

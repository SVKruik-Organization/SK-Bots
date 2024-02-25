const dateCalculation = require('./date.js');
const fs = require('node:fs');

/**
 * Log messages to the log file.
 * @param {string} data The data to log to the file.
 * @param {string} type The type of message. For example: warning, alert, info, fatal, none.
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
        fs.appendFile(`./logs/${dateCalculation.getDate().date}.log`, logData, (err) => {
            if (err) {
                console.log(`${dateCalculation.getDate().time} [ERROR] Error appending to log file.`);
                return false;
            }
        });
        console.log(logData);
        if (type === "fatal") return process.exit(1);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

module.exports = {
    "log": log
}

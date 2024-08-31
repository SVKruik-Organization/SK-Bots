const logger = require('../utils/logger.js');
const fs = require('node:fs');

/**
 * Suppresses temperature warnings.
 * @param {object} message Discord Message Object
 */
function handleAcknowledge(message) {
    try {
        const acknowledgeType = message.content.split(" ")[1];
        switch (acknowledgeType) {
            case "temperature":
                // Values
                const duration = 1;
                let value = message.content.split(" ")[2];
                if (!value || value === "true") {
                    value = true;
                } else if (value === "false") value = false;
                if (typeof value !== "boolean") value = false;

                // File Write & Reply
                const sensorSettings = JSON.parse(fs.readFileSync(__dirname + '/../settings/sensors.json', "utf-8"));
                sensorSettings.acknowledgeHighTemperature = value;
                fs.writeFileSync(__dirname + "/../settings/sensors.json", JSON.stringify(sensorSettings, null, 2), "utf-8");
                return message.reply({ content: `Received. ${value ? `Suppressed high temperature notifications for \`${duration}\` hour.` : "Re-enabled high temperature notifications."}` });
            default:
                return message.reply({ content: `Hello there <@${message.author.id}>, \`${message.content}\` is not a valid Acknowledge type.` });
        }
    } catch (error) {
        logger.error(error);
        return message.reply({ content: "Something went wrong while processing your acknowledgement. Please try again later." });
    }
}

module.exports = {
    "handleAcknowledge": handleAcknowledge
}

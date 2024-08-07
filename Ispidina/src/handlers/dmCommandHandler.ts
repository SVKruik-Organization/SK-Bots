import { Message } from 'discord.js';
import { logError } from '../utils/logger';
import fs from 'node:fs';
import { Settings } from "../types";

/**
 * Suppresses temperature warnings for one hour.
 * @param message Discord Message Object
 */
export function handleAcknowledge(message: Message): Promise<Message> {
    try {
        const acknowledgeType: string = message.content.split(" ")[1];
        switch (acknowledgeType) {
            case "temperature":
                // Values
                const duration: number = 1;
                let value: string | boolean = message.content.split(" ")[2];
                if (!value || value === "true") {
                    value = true;
                } else if (value === "false") value = false;
                if (typeof value !== "boolean") value = false;

                // File Write & Reply
                const sensorSettings: Settings = JSON.parse(fs.readFileSync(__dirname + '/../settings/sensors.json', "utf-8"));
                sensorSettings.acknowledgeHighTemperature = value;
                fs.writeFileSync(__dirname + "/../settings/sensors.json", JSON.stringify(sensorSettings, null, 2), "utf-8");
                return message.reply({ content: `Received. ${value ? `Suppressed high temperature notifications for \`${duration}\` hour.` : "Re-enabled high temperature notifications."}` });
            default:
                return message.reply({ content: `Hello there <@${message.author.id}>, \`${message.content}\` is not a valid Acknowledge type.` });
        }
    } catch (error: any) {
        logError(error);
        return message.reply({ content: "Something went wrong while processing your acknowledgement. Please try again later." });
    }
}

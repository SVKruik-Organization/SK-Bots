import { Message } from 'discord.js';
import { logError } from '../utils/logger.js';
import fs from 'node:fs';
import { Settings } from '../types.js';
import { getDirname } from '../utils/file.js';

/**
 * Suppresses temperature warnings.
 * @param message Discord Message Object
 */
export async function handleAcknowledge(message: Message): Promise<Message> {
    try {
        const acknowledgeType: string = message.content.split(" ")[1];
        switch (acknowledgeType) {
            case "temperature":
                // Values
                let value: string | boolean = message.content.split(" ")[2];
                if (!value || value === "true") {
                    value = true;
                } else if (value === "false") value = false;
                if (typeof value !== "boolean") value = false;

                // File Write & Reply
                const dirName: string = getDirname(import.meta.url);
                const sensorSettings: Settings = JSON.parse(fs.readFileSync(dirName + '/../settings/sensors.json', "utf-8"));
                sensorSettings.acknowledgeHighTemperature = value;
                fs.writeFileSync(dirName + "/../settings/sensors.json", JSON.stringify(sensorSettings, null, 2), "utf-8");
                return await message.reply({ content: `Received. ${value ? `Suppressed high temperature notifications.` : "Re-enabled high temperature notifications."}` });
            default:
                return await message.reply({ content: `Hello there <@${message.author.id}>, \`${message.content}\` is not a valid Acknowledge type.` });
        }
    } catch (error: any) {
        logError(error);
        return await message.reply({ content: "Something went wrong while processing your acknowledgement. Please try again later." });
    }
}

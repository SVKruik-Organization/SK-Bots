import { SensorMessage, UplinkMessage } from "./types.js";
import { Channel, connect, Message, Replies } from 'amqplib';
import { database, customClient } from './index.js';
import { logError, logMessage } from './utils/logger.js';
import { colors, general } from './config.js';
import { findUserById } from './utils/user.js';
import fs from 'node:fs';
import { EmbedBuilder, TextBasedChannel, User } from 'discord.js';
import { time } from '@discordjs/formatters';
import * as shell from 'shelljs';
import { getDirname } from "./utils/file.js";

export let channel: Channel | undefined = undefined;

/**
 * Initialize the Uplink listener to handle incoming tasks.
 */
export async function initUplink() {
    try {
        // Setup
        channel = await (await connect({
            "protocol": "amqp",
            "hostname": process.env.AMQP_HOST,
            "port": parseInt(process.env.AMQP_PORT as string),
            "username": process.env.AMQP_USERNAME,
            "password": process.env.AMQP_PASSWORD

        })).createChannel();

        const exchange: Replies.AssertExchange = await channel.assertExchange("bot-exchange", "direct", { durable: false });
        const queue: Replies.AssertQueue = await channel.assertQueue("", { exclusive: true });
        channel.bindQueue(queue.queue, exchange.exchange, general.name);

        // Listen
        logMessage(`Uplink listening on '${exchange.exchange}'@'${general.name}'`, "info");
        channel.consume(queue.queue, async (message: Message | null) => {
            // Setup
            if (!message) return;
            const messageContent: UplinkMessage = JSON.parse(message.content.toString());
            logMessage(`New Uplink message from || ${messageContent.sender} ||`, "info");

            // Handle
            await messageHandler(messageContent);
            if (channel) channel.ack(message);
        }, { noAck: false });
    } catch (error: any) {
        logError(error);
    }
}

/**
 * Switch the incoming tasks to the right handler.
 * @param message 
 */
async function messageHandler(message: UplinkMessage) {
    switch (message.task) {
        case "Broadcast":
            await broadcastHandler(JSON.parse(message.content as string));
            break;
        case "Temperature":
            await temperatureHandler(message.content as SensorMessage);
            break;
        case "Deploy":
            deploymentHandler(message);
            break;
        default:
            console.log(message);
            break;
    }
}

/**
 * Broadcast the new release message to participating guilds.
 * @param data The release payload containing all the data like description and author information.
 * @returns On error
 */
async function broadcastHandler(data: any) {
    try {
        if (data.draft || !data.author) return;
        const release = {
            // Author Information
            "author_username": data.author.login,
            "author_avatar": data.author.avatar_url,
            "author_url": data.author.html_url,

            // Release Information
            "release_name": data.name,
            "release_version": data.tag_name,
            "release_description": data.body,
            "release_url": data.html_url,
            "release_prerelease": data.prerelease,
            "release_branch": data.target_commitish,
            "release_date": new Date(data.published_at)
        }

        /**
         * Format the raw release description by length and adding a link to the release.
         * @param input The raw description.
         * @returns The formatted description with a link to the release.
         */
        function format(input: string) {
            let processedInput: string = input;
            processedInput = processedInput.substring(0, 219);
            processedInput += ` . . . [see full details](${release.release_url})`;
            return processedInput;
        }

        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(colors.bot)
            .setTitle("New version released!")
            .setDescription(`New features will soon be shipped to <@${general.clientId}> in your server.`)
            .setAuthor({ name: release.author_username, iconURL: release.author_avatar, url: release.author_url })
            .setURL(release.release_url)
            .addFields(
                { name: 'Description', value: format(release.release_description) },
                { name: 'Note', value: `While it does not happen often, there might be some downtime while I update everything. I strive for a smooth transition, but if any problems do arise, don't hesitate to reach out to <@${general.authorId}>.` })
            .addFields(
                { name: 'Version', value: `\`${release.release_version}\``, inline: true },
                { name: 'Published On', value: time(release.release_date), inline: true },
                { name: 'Branch', value: `\`${release.release_branch}\``, inline: true })
            .setTimestamp()
            .setFooter({ text: `Embed created by ${general.name}` });

        const guilds: Array<{ channel_broadcast: string }> = await database.query("SELECT channel_broadcast FROM guild LEFT JOIN guild_settings ON guild_settings.guild_snowflake = snowflake WHERE broadcast_update = 1;");
        for (let i = 0; i < guilds.length; i++) {
            if (!guilds[i].channel_broadcast) continue;
            const channel: TextBasedChannel | null = await customClient.channels.fetch(guilds[i].channel_broadcast) as TextBasedChannel | null;
            if (channel) await channel.send({ embeds: [embed] });
        }
        logMessage(`Successfully broadcasted the release information for ${release.release_version} to all participating guilds.`, "info");
    } catch (error) {
        logError(error);
    }
}

/**
 * Send a message to the author when the temperature of the Tide computer is too high.
 * @param data The sensor payload containing the temperature and CPU data.
 * @returns On error.
 */
async function temperatureHandler(data: SensorMessage) {
    try {
        if (!(data satisfies SensorMessage)) return;
        const sensorSettings: { acknowledgeHighTemperature: boolean } = JSON.parse(fs.readFileSync(`${getDirname(import.meta.url)}/../settings/sensors.json`, "utf-8"));
        if (data.temperatureData.main > 45 && sensorSettings.acknowledgeHighTemperature === false) {
            const author: User = await findUserById(general.authorId);

            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.warning)
                .setTitle("High CPU Temperature Warning")
                .addFields(
                    { name: "Model", value: `\`${data.cpuData.brand}\``, inline: true },
                    { name: "Device Name", value: `\`${data.deviceName}\``, inline: true },
                    { name: "\u200B", value: "\u200B", inline: true })
                .addFields(
                    { name: "Speed", value: `\`${data.cpuData.speed}\` Ghz`, inline: true },
                    { name: "Temperature", value: `\`${data.temperatureData.main}\` °C`, inline: true },
                    { name: "Memory Usage", value: `\`${Math.round(data.memoryData.used / (1024 ** 3))}\`/\`${Math.round(data.memoryData.total / (1024 ** 3))}\` GiB`, inline: true })
                .setTimestamp()
                .setFooter({ text: "Send '/acknowledge temperature' to suppress." });
            author.send({ embeds: [embed] });
        }
    } catch (error) {
        logError(error);
    }
}

/**
 * Runs the deployment script that updates & restarts Apricaria, Stelleri and the Monitor.
 * @param messageContent The Uplink message
 */
function deploymentHandler(messageContent: UplinkMessage) {
    try {
        if (process.platform !== "linux") return;
        logMessage(`Received new deploy task from ${messageContent.sender}. Running deployment script for Apricaria & Stelleri.`, "alert");
        shell.exec("bash deploy.sh");
    } catch (error) {
        logError(error);
    }
}
const modules = require('.');
const logger = require('./utils/logger.js');
const config = require('./config.js');
const { findUserById } = require('./utils/user.js');
const fs = require('node:fs');
const { EmbedBuilder } = require('discord.js');
const { time } = require('@discordjs/formatters');
const exec = require('child_process').exec;

/**
 * Initialize the Uplink listener to handle incoming tasks.
 */
async function init() {
    // Setup Direct
    const channel = modules.uplink;
    if (!channel) return;
    const directExchange = await channel.assertExchange("unicast-bots", "direct", { durable: false });
    const directQueue = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(directQueue.queue, directExchange.exchange, config.general.name);
    logger.log(`Uplink listening on '${directExchange.exchange}'@'${config.general.name}'`, "info");
    channel.consume(directQueue.queue, async (message) => await messageHandler(message, channel), {
        noAck: false
    });

    // Setup Broadcast
    const fanoutExchange = await channel.assertExchange("broadcast-bots", "fanout", { durable: false });
    const broadcastQueue = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(broadcastQueue.queue, fanoutExchange.exchange, "");
    logger.log(`Uplink listening on '${fanoutExchange.exchange}'@'${config.general.name}'`, "info");
    channel.consume(broadcastQueue.queue, async (message) => await messageHandler(message, channel), {
        noAck: false
    });
}

/**
 * Switch the incoming tasks to the right handler.
 * @param {object} message 
 * @param {object} channel
 */
async function messageHandler(message, channel) {
    channel.ack(message);
    const messageContent = JSON.parse(message.content.toString());
    logger.log(`New Uplink message from '${messageContent.sender}' for reason ${messageContent.reason}'`, "info");

    switch (messageContent.task) {
        case "Broadcast":
            if (messageContent.content.length) await broadcastHandler(JSON.parse(messageContent.content));
            break;
        case "Temperature":
            if (messageContent.content.length) await temperatureHandler(JSON.parse(messageContent.content));
            break;
        case "Deploy":
            deploymentHandler(messageContent);
            break;
        default:
            break;
    }
}

/**
 * Broadcast the new release message to participating guilds.
 * @param {object} data The release payload containing all the data like description and author information.
 * @returns On error
 */
async function broadcastHandler(data) {
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
         * @param {string} input The raw description.
         * @returns The formatted description with a link to the release.
         */
        function format(input) {
            let processedInput = input;
            processedInput = processedInput.substring(0, 219);
            processedInput += ` . . . [see full details](${release.release_url})`;
            return processedInput;
        }

        const embed = new EmbedBuilder()
            .setColor(config.colors.bot)
            .setTitle("New version released!")
            .setDescription(`New features will soon be shipped to <@${config.general.clientId}> in your server.`)
            .setAuthor({ name: release.author_username, iconURL: release.author_avatar, url: release.author_url })
            .setURL(release.release_url)
            .addFields(
                { name: 'Description', value: format(release.release_description) },
                { name: 'Note', value: `While it does not happen often, there might be some downtime while I update everything. I strive for a smooth transition, but if any problems do arise, don't hesitate to reach out to <@${config.general.authorId}>.` })
            .addFields(
                { name: 'Version', value: `\`${release.release_version}\``, inline: true },
                { name: 'Published On', value: time(release.release_date), inline: true },
                { name: 'Branch', value: `\`${release.release_branch}\``, inline: true })
            .setTimestamp()
            .setFooter({ text: `Embed created by ${config.general.name}` });

        const guilds = await modules.database.query("SELECT channel_broadcast FROM guild LEFT JOIN guild_settings ON guild_settings.guild_snowflake = snowflake WHERE broadcast_update = 1;");
        for (let i = 0; i < guilds.length; i++) {
            if (!guilds[i].channel_broadcast) continue;
            const channel = await modules.client.channels.fetch(guilds[i].channel_broadcast);
            if (channel) channel.send({ embeds: [embed] });
        }
        logger.log(`Successfully broadcasted the release information for ${release.release_version} to all participating guilds.`, "info");
    } catch (error) {
        logger.error(error);
    }
}

/**
 * Send a message to the author when the temperature of the Tide computer is too high.
 * @param {object} data The sensor payload containing the temperature and CPU data.
 * @returns On error.
 */
async function temperatureHandler(data) {
    try {
        if (!data || !("cpuData" in data) || !("temperatureData" in data)) return;
        const sensorSettings = JSON.parse(fs.readFileSync(__dirname + '/settings/sensors.json', "utf-8"));
        if (data.temperatureData.main > 45 && sensorSettings.acknowledgeHighTemperature === false) {
            const author = await findUserById(config.general.authorId);

            const embed = new EmbedBuilder()
                .setColor(config.colors.warning)
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

            author.send({
                embeds: [embed]
            });
        }
    } catch (error) {
        logger.error(error);
    }
}

/**
 * Runs the deployment script that updates & restarts Apricaria, Stelleri and the Monitor.
 * @param {object} messageContent The Uplink message
 */
function deploymentHandler(messageContent) {
    try {
        if (process.platform !== "linux") return
        logger.log(`Received new deploy task from ${messageContent.sender}. Running deployment script for Apricaria & Stelleri.`, "alert");
        exec("bash deploy.sh", (error, stdout, _stderr) => {
            logger.log(stdout, "info");
            if (error) logger.error(error);
        });
    } catch (error) {
        logger.error(error);
    }
}

module.exports = {
    "init": init
}
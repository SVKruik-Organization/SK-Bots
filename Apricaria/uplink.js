const modules = require('.');
const logger = require('./utils/logger.js');
const amqpConfig = require('./assets/amqp.js');
const config = require('./assets/config.js');
const { findUserById } = require('./utils/user.js');
const fs = require('node:fs');
const { EmbedBuilder } = require('discord.js');
const { time } = require('@discordjs/formatters');

/**
 * Initialize the Uplink listener to handle incoming tasks.
 */
async function init() {
    // Setup
    const channel = modules.uplink;
    const exchange = await channel.assertExchange(amqpConfig.exchanges.bots, amqpConfig.exchange_types.direct, { durable: false });
    const queue = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(queue.queue, exchange.exchange, config.general.name);

    // Listen
    logger.log(`Uplink listening on ${exchange.exchange}`, "info");
    channel.consume(queue.queue, async (message) => {
        const messageContent = JSON.parse(message.content.toString());
        logger.log(`New Uplink message from || ${messageContent.sender} ||`, "info");
        await messageHandler(messageContent);
        channel.ack(message);
    }, {
        noAck: false
    });
}

/**
 * Switch the incoming tasks to the right handler.
 * @param {object} message 
 */
async function messageHandler(message) {
    switch (message.task) {
        case "Broadcast":
            await broadcastHandler(JSON.parse(message.content));
            break;
        case "Temperature":
            await temperatureHandler(message.content);
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
            .setColor(config.general.color)
            .setTitle("New version released!")
            .setDescription(`New features will soon be shipped to <@${config.general.clientId}> in your server.`)
            .setAuthor({ name: release.author_username, iconURL: release.author_avatar, url: release.author_url })
            .setURL(release.release_url)
            .addFields(
                { name: 'Description', value: format(release.release_description) },
                { name: 'Note', value: `While it does not happen often, there might be some downtime while I update everything. I strive for a smooth transition, but if any problems do arise, don't hesitate to reach out to <@${config.general.authorSnowflake}>.` })
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
            const author = await findUserById(config.general.authorSnowflake);

            const embed = new EmbedBuilder()
                .setColor("#FF4C4C")
                .setTitle("High CPU Temperature Warning")
                .addFields(
                    { name: "Model", value: data.cpuData.brand, inline: true },
                    { name: "Speed", value: `\`${data.cpuData.speed}\` Ghz`, inline: true },
                    { name: "Temperature", value: `\`${data.temperatureData.main}\` °C`, inline: true })
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
    if (process.platform !== "linux") return
    logger.log(`Received new deploy task from ${messageContent.sender}. Running deployment script for Apricaria & Stelleri.`, "alert");
    shell.exec("bash deploy.sh");
}

module.exports = {
    "init": init
}
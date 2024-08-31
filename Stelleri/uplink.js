const modules = require('.');
const logger = require('./utils/logger.js');
const config = require('./config.js');

async function init() {
    // Setup
    const channel = modules.uplink;
    const exchange = await channel.assertExchange("unicast-bots", "direct", { durable: false });
    const queue = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(queue.queue, exchange.exchange, config.general.name);

    // Listen
    logger.log(`Uplink listening on '${exchange.exchange}'@'${config.general.name}'`, "info");
    channel.consume(queue.queue, async (message) => await messageHandler(message, channel), {
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
        default:
            break;
    }
}

module.exports = {
    "init": init
}
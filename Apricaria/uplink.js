const modules = require('.');
const logger = require('./utils/logger.js');
const amqpConfig = require('./assets/amqp.js');
const config = require('./assets/config.js');

async function init() {
    // Setup
    const channel = modules.uplink;
    const exchange = await channel.assertExchange(amqpConfig.exchanges.bots, amqpConfig.exchange_types.direct, { durable: false });
    const queue = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(queue.queue, exchange.exchange, config.general.name);

    // Listen
    logger.log(`Uplink listening on ${exchange.exchange}`, "info");
    channel.consume(queue.queue, (message) => {
        const messageContent = JSON.parse(message.content.toString());
        logger.log(`New Uplink message from || ${messageContent.sender} ||`, "info");
        messageHandler(messageContent);
        channel.ack(message);
    }, {
        noAck: false
    });
}

function messageHandler(message) {
    switch (message.task) {
        case "log":
            logger.log(`Log Task: ${message.content}`, "info");
            break;
        default:
            console.log(message);
            break;
    }
}

module.exports = {
    "init": init
}
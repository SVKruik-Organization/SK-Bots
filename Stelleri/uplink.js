const modules = require('.');
const logger = require('./utils/logger.js');
const config = require('./config.js');

async function init() {
    // Setup
    const channel = modules.uplink;
    const exchange = await channel.assertExchange("bot-exchange", "direct", { durable: false });
    const queue = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(queue.queue, exchange.exchange, config.general.name);

    // Listen
    logger.log(`Uplink listening on '${exchange.exchange}'@'${config.general.name}'`, "info");
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
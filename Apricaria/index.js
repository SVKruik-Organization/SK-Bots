require('dotenv').config();
const mariadb = require('mariadb');
const amqp = require('amqplib');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const commandHandler = require('./handlers/commandHandler.js');
const eventHandler = require('./handlers/eventHandler.js');
const logger = require('./utils/logger.js');
const interest = require('./utils/interest.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildMessagePolls
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction
    ]
});
client.login(process.env.BOT_TOKEN);
logger.log("\n\t------", "none");

// Database Connection
const database = mariadb.createPool({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.DB_USERNAME,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    multipleStatements: true
});

// Uplink Connection
async function uplinkConnection() {
    try {
        return await (await amqp.connect({
            "protocol": "amqp",
            "hostname": process.env.AMQP_HOST,
            "port": parseInt(process.env.AMQP_PORT),
            "username": process.env.AMQP_USERNAME,
            "password": process.env.AMQP_PASSWORD
        })).createChannel();
    } catch (error) {
        logger.error(error);
    }
}
uplinkConnection().then(async (channel) => {
    module.exports.uplink = channel;
    require('./uplink.js').init();
});

// Exporting Values
module.exports = {
    "client": client,
    "database": database,
    "dueDates": []
};

// Initializers
commandHandler.init(client);
eventHandler.init(client);
interest.init();
client.cooldowns = new Collection();
require('./utils/due.js').dueDates;
require('./server.js');
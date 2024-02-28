require('dotenv').config();
const mariadb = require('mariadb');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const commandHandler = require('./handlers/commandHandler.js');
const eventHandler = require('./handlers/eventHandler.js');
const logger = require('./utils/logger.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages
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

// Exporting Values
module.exports = {
    "client": client,
    "database": database,
    "dueDates": []
};

// Initializers
commandHandler.init(client);
eventHandler.init(client);
client.cooldowns = new Collection();
require('./utils/due.js').dueDates;
require('./utils/interest.js').init();
require('./server.js');
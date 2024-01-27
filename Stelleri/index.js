require('dotenv').config();
const mariadb = require('mariadb');
const { Client, Collection } = require('discord.js');
const commandHandler = require('./handlers/commandHandler.js');
const eventHandler = require('./handlers/eventHandler.js');
const logger = require('./utils/log.js');
const client = new Client({
    intents: [
        'Guilds',
        'GuildMessages',
        'MessageContent',
        'GuildMembers',
        'GuildMessageReactions',
        'DirectMessages'
    ],
    partials: [
        'Channel',
        'Message',
        'Reactions'
    ]
});
client.login(process.env.TOKEN);
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

// Indexing super & blocked users
let superUsers = [];
let blockedUsers = [];
database.query("SELECT snowflake, super, blocked FROM user WHERE super = 1 OR blocked = 1;")
    .then((data) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].super === 1) {
                superUsers.push(data[i].snowflake);

            } else blockedUsers.push(data[i].snowflake);
        }
        logger.log("Fetched all users.", "info");
    }).catch(() => {
        logger.log("Loading Users went wrong. Aborting.", "fatal");
    });

// Exporting Values
module.exports = {
    "client": client,
    "database": database,
    "superUsers": superUsers,
    "blockedUsers": blockedUsers
};

// Command Handler
commandHandler.init(client);

// Event Handler
eventHandler.init(client);

// Cooldowns
client.cooldowns = new Collection();

require('dotenv').config();
const mariadb = require('mariadb');
const { Client, Collection } = require('discord.js');
const commandHandler = require('./handlers/commandHandler.js');
const eventHandler = require('./handlers/eventHandler.js');
const logger = require('./utils/logger.js');
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
const superUsers = [];
const blockedUsers = [];
try {
    database.query("SELECT snowflake, super, blocked FROM user WHERE super = true OR blocked = true;")
        .then((data) => {
            for (let i = 0; i <= data.length; i++) {
                if (data.length === i) {
                    logger.log("Fetched all users.", "info");
                } else {
                    if (data[i].super === true) {
                        superUsers.push(data[i].snowflake);
                    } else if (data[i].blocked === true) blockedUsers.push(data[i].snowflake);
                }
            }
        }).catch(() => {
            return logger.log("Loading Users went wrong. Aborting.", "fatal");
        });
} catch (error) {
    console.error(error);
}

// Exporting Values
module.exports = {
    "client": client,
    "database": database,
    "superUsers": superUsers,
    "blockedUsers": blockedUsers,
    "dueDates": []
};

// Initializers
commandHandler.init(client);
eventHandler.init(client);
client.cooldowns = new Collection();
require('./utils/due.js').dueDates;
require('./utils/interest.js').init();
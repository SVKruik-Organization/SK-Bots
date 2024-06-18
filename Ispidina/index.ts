require('dotenv').config();
import mariadb, { Pool } from 'mariadb';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { initEventHandler } from './handlers/eventHandler';
import { initCommandHandler } from './handlers/commandHandler';

const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildScheduledEvents
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction
    ]
});
client.login(process.env.BOT_TOKEN);

// Database Connection
if (!process.env.PORT) process.exit(1);
const database: Pool = mariadb.createPool({
    host: process.env.HOST,
    port: parseInt(process.env.PORT),
    user: process.env.DB_USERNAME,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    multipleStatements: true
});

// Handlers
initEventHandler(client);
initCommandHandler(client);

// Exporting Values
export { client, database } 
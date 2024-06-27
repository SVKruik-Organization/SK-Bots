require('dotenv').config();
import mariadb, { Pool } from 'mariadb';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { initEventHandler } from './handlers/eventHandler';
import { initCommandHandler } from './handlers/commandHandler';
import { Command } from './assets/types';

const client = new Client({
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
client.commands = new Collection<string, Command>();
client.cooldowns = new Collection<string, Collection<string, Date>>();

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

// Exporting Values & Boot
export { client, database }
client.login(process.env.BOT_TOKEN);

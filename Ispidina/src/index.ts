import "dotenv/config";
import mariadb, { Pool } from 'mariadb';
import { initEventHandler } from './handlers/eventHandler';
import { initCommandHandler } from './handlers/commandHandler';
import { Command } from './types';
import { Collection, Client as DiscordClient, GatewayIntentBits, Partials } from 'discord.js';

interface CustomClientProperties {
    commands: Collection<string, Command>;
    cooldowns: Collection<string, Collection<string, Date>>;
}
interface CustomClient extends DiscordClient, CustomClientProperties { }

// Create a client instance using the extended interface
const customClient = new DiscordClient({
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
}) as CustomClient;
customClient.commands = new Collection<string, Command>();
customClient.cooldowns = new Collection<string, Collection<string, Date>>();

// Database Connection
if (!process.env.HOST || !process.env.PORT) throw new Error("Missing database credentials.");
const database: Pool = mariadb.createPool({
    host: process.env.HOST,
    port: parseInt(process.env.PORT),
    user: process.env.DB_USERNAME,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    multipleStatements: true
});

// Handlers
initEventHandler(customClient);
initCommandHandler(customClient);

// Exporting Values & Boot
export { customClient, database }
customClient.login(process.env.BOT_TOKEN);

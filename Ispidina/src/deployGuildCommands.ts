import { CommandWrapper } from "./types.js";
import "dotenv/config";
import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js';
import { GuildUnfetchedBase } from "./types.js";
import { general } from "./config.js";
import mariadb from "mariadb";
import { readdirSync } from "node:fs"
const commandFiles: Array<string> = readdirSync(`${getDirname(import.meta.url)}/commands`).filter((file: string) => file.endsWith('.js'));
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN as string);
import { logError } from "./utils/logger.js";
import { getDirname } from "./utils/file.js";

const commands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [];
for (const file of commandFiles) {
    try {
        const command: CommandWrapper = await import(`./commands/${file}`);
        commands.push(command.default.data.toJSON());
    } catch (error: any) {
        logError(error);
    }
}

// Database Connection
const database = mariadb.createPool({
    host: process.env.HOST,
    port: parseInt(process.env.PORT as string),
    user: process.env.DB_USERNAME,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    multipleStatements: true
});

// Deploy
try {
    const queryData: Array<GuildUnfetchedBase> = await database.query("SELECT * FROM guild WHERE disabled = 0 AND production = 0;");
    console.log("\n");
    for (let i = 0; i < queryData.length; i++) {
        const data: Array<any> = await rest.put(
            Routes.applicationGuildCommands(general.clientId, queryData[i].snowflake),
            { body: commands },
        ) as Array<any>;
        console.log(`Successfully loaded ${data.length} commands for guild ${queryData[i].name}.`);
    }
    console.log("\n");
    process.exit(0);
} catch (error: any) {
    logError(error);
}

import { Command } from "./types";
import "dotenv/config";
import { REST, Routes } from 'discord.js';
import { GuildUnfetchedBase } from "./types";
import { general } from "./config";
import mariadb from "mariadb";
import { readdirSync } from "node:fs"
const commandFiles: Array<string> = readdirSync(`${__dirname}/commands`).filter((file: string) => file.endsWith(''));
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN as string);
import { logError } from "./utils/logger";

const commands: Array<Command> = [];
for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`).default;
        console.log(command);
        commands.push(command.data.toJSON());
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
    database.query("SELECT * FROM guild WHERE disabled = 0 AND production = 0;")
        .then(async (queryData: Array<GuildUnfetchedBase>) => {
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
        }).catch((error: any) => {
            logError(error);
        });
} catch (error: any) {
    logError(error);
}

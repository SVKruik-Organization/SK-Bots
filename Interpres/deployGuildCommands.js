require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { general } = require('./config.js');
const mariadb = require('mariadb');
const fs = require('node:fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const logger = require('./utils/logger.js');

const commands = [];
for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    } catch (error) {
        logger.error(error);
    }
}

// Database Connection
const database = mariadb.createPool({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.DB_USERNAME,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    multipleStatements: true
});

// Deploy
try {
    database.query("SELECT * FROM guild WHERE disabled = 0 AND production = 0;")
        .then(async (queryData) => {
            console.log("\n");
            for (let i = 0; i < queryData.length; i++) {
                const data = await rest.put(
                    Routes.applicationGuildCommands(general.clientId, queryData[i].snowflake),
                    { body: commands },
                );
                console.log(`Successfully loaded ${data.length} commands for guild ${queryData[i].name}.`);
            }
            console.log("\n");
            process.exit(1);
        }).catch((error) => {
            logger.error(error);
        });
} catch (error) {
    logger.error(error);
}

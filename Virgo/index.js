require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2');
const config = require('./assets/config.js');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions
	],
});
const blockedUsers = ['1'];
client.login(process.env.TOKEN);

// Guild Loading
for (let i = 0; i < config.general.guildId.length; i++) {
	const guild = client.guilds.fetch(config.general.guildId[i]);
	if (!guild) {
		console.log("\n[FATAL] Guild not found. Aborting.\n");
		process.exit();
	};
};
console.log("[INFO] Fetched all guilds.");

/**
 * Timestamp Calculation
 * @returns Object with date, time and new Date().
 */
function getDate() {
	const today = new Date();
	const s = String(today.getSeconds()).padStart(2, '0');
	const m = String(today.getMinutes()).padStart(2, '0');
	const hh = String(today.getHours()).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const yyyy = today.getFullYear();
	const date = `${dd}-${mm}-${yyyy}`;
	const time = `${hh}:${m}:${s}`;

	return { date, time, today };
};

// Database
const database = mysql.createPool({
	host: process.env.HOST,
	user: process.env.USER,
	database: process.env.DATABASE,
	password: process.env.PASSWORD
});
database.promise()
	.execute("SHOW databases")
	.then(() => {
		console.log("[INFO] Database connection established.\n");
	}).catch((err) => {
		console.log("[FATAL] Connecting to the database went wrong. Aborting.", err);
		process.exit();
	});

// Exporting Values & Functions
module.exports = {
	"client": client,
	"database": database,
	"getDate": getDate
};

// Command Handler
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		return console.log(`[ERROR] Error at ${filePath}.`);
	};
};

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	if (blockedUsers.includes(interaction.user.id)) {
		return await interaction.reply({ content: 'You are not allowed to use me. Contact the moderators to appeal.', ephemeral: true });
	};

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`[WARN] No command matching ${interaction.commandName} was found.`);
		return;
	};

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	};
});

// Event Handler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	};
};
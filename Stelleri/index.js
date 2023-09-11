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
		const data = `\n${this.getDate().time} [FATAL] Guild not found. Aborting.\n`;
		console.log(data);
		fs.appendFile(`./logs/${this.getDate().date}.log`, data, (err) => {
			if (err) console.log(`${getDate().time} [ERROR] Error appending to log file.`);
		});
		return process.exit();
	};
};
const data = `${getDate().time} [INFO] Fetched all guilds.\n`;
console.log(data);
fs.appendFile(`./logs/${getDate().date}.log`, data, (err) => {
	if (err) console.log(`${getDate().time} [ERROR] Error appending to log file.`);
});

/**
 * Timestamp Calculation
 * @returns Object with date, time and new Date().
 */
function getDate() {
	const today = new Date();

	const hh = formatTime(today.getHours());
	const m = formatTime(today.getMinutes());
	const s = formatTime(today.getSeconds());

	const dd = String(today.getDate()).padStart(2, '0');
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const yyyy = today.getFullYear();

	const date = `${dd}-${mm}-${yyyy}`;
	const time = `${hh}:${m}:${s}`;

	/**
	 * Time formatter.
	 * @param {number} value Add an extra zero if the input number is not double digit.
	 * @returns Formatted value.
	 */
	function formatTime(value) {
		return value < 10 ? "0" + value : value.toString();
	};

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
		const data = `${getDate().time} [INFO] Database connection established.\n`;
		console.log(data);
		fs.appendFile(`./logs/${getDate().date}.log`, data, (err) => {
			if (err) console.log(`${getDate().time} [ERROR] Error appending to log file.`);
		});
	}).catch(() => {
		const data = `${getDate().time} [FATAL] Connecting to the database went wrong. Aborting.`;
		console.log(data);
		fs.appendFile(`./logs/${getDate().date}.log`, data, (err) => {
			if (err) console.log(`${getDate().time} [ERROR] Error appending to log file.`);
		});

		return process.exit();
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
		const data = `${getDate().time} [ERROR] Error at ${filePath}.`;
		console.log(data);
		fs.appendFile(`./logs/${getDate().date}.log`, data, (err) => {
			if (err) console.log(`${getDate().time} [ERROR] Error appending to log file.`);
		});
		return;
	};
};

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	if (blockedUsers.includes(interaction.user.id)) {
		return await interaction.reply({ content: 'You are not allowed to use my commands. Contact the moderators to appeal if you think this is a mistake.', ephemeral: true });
	};

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		const data = `${time} [WARNING] No command matching ${interaction.commandName} was found.`;
		console.log(data);
		fs.appendFile(`./logs/${date}.log`, data, (err) => {
			if (err) console.log(`${time} [ERROR] Error appending to log file.`);
		});
		return;
	};

	try {
		await command.execute(interaction);
	} catch (error) {
		const data = `${time} [ERROR] There was an error while executing || ${interaction.commandName} ||`;
		console.log(data);
		fs.appendFile(`./logs/${date}.log`, data, (err) => {
			if (err) console.log(`${time} [ERROR] Error appending to log file.`);
		});
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	};

	console.log("Test A");
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
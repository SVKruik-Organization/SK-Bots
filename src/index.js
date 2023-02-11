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
const guild = client.guilds.fetch(config.general.guildId);
if (!guild) {
	console.log("\n[FATAL] Guild not found. Aborting.\n");
	process.exit();
};

const database = mysql.createPool({
	host: process.env.HOST,
	user: process.env.USER,
	database: process.env.DATABASE,
	password: process.env.PASSWORD
});

database.promise()
	.execute("SHOW databases")
	.then(() => {
		console.log("\nDatabase connection established.\n");
	}).catch(() => {
		return console.log("[ERROR] Connecting to the database went wrong.");
	});

// Modules
module.exports = {
	client,
	database
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
		return console.log(`[FATAL] Error at ${filePath}.`);
	};
};

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	if (blockedUsers.includes(interaction.user.id)) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
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
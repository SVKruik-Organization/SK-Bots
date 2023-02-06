require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Database
const database = mysql.createPool({
	host: '127.0.0.1',
	user: 'root',
	database: 'discord',
	password: ''
});

database.promise()
	.execute("SHOW databases")
	.then(() => {
		console.log("Database connection established.\n");
	}).catch(() => {
		return console.log("Connecting to the database went wrong.");
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
		return console.log(`Error at ${filePath};.`);
	};
};

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

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

client.login(process.env.TOKEN);
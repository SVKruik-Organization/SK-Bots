require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const config = require('./assets/config.js');
const mariadb = require('mariadb');
const { Client, Collection, EmbedBuilder } = require('discord.js');
const client = new Client({
    intents: [
        'Guilds',
        'GuildMessages',
        'MessageContent',
        'GuildMembers',
        'GuildMessageReactions',
        'DirectMessages'
    ],
    partials: [
        'Channel',
        'Message',
        'Reactions'
    ]
});
client.login(process.env.TOKEN);
log("\n\t------", "none");

// Database Connection
const database = mariadb.createPool({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.DB_USERNAME,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    multipleStatements: true
});

// Indexing super & blocked users
let superUsers = [];
let blockedUsers = [];
database.query("SELECT snowflake, super, blocked FROM user WHERE super = 1 OR blocked = 1;")
    .then((data) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].super === 1) {
                superUsers.push(data[i].snowflake);

            } else blockedUsers.push(data[i].snowflake);
        }
        log("Fetched all users.", "info");
    }).catch(() => {
        log("Loading Users went wrong. Aborting.", "fatal");
    });

// Indexing Guilds and settings
database.query("SELECT * FROM guild WHERE disabled = 0;")
    .then((data) => {
        data.forEach(async (guild) => Promise.resolve(await guildConstructor(guild)).then((data) => module.exports.guilds.push(data)));
        log("Fetched all guilds.", "info");
    }).catch(() => {
        log("Loading Guild settings went wrong. Aborting.", "fatal");
    });

/**
 * Process raw data from the database to a refined object for further reading from.
 * Instead of raw channel snowflakes, it puts the entire Discord Channel object.
 * @param {object} guild A Guild object from the database.
 * @returns 
 */
async function guildConstructor(guild) {
    // Guild Fetching
    const fetchedGuild = await client.guilds.fetch(guild.snowflake);
    if (!fetchedGuild) {
        log(`Guild '${guild.name}'@'${guild.snowflake}' not found.`, "warning");
        return;
    }

    // Channel Fetching Prepare
    const errorMessage = "is configured, but not found. Corresponding command disabled for this run.";
    function channelFetch(channelId, name) {
        let target = false;
        if (channelId && channelId.length === 19) {
            const fetchedChannel = client.channels.cache.get(channelId);
            if (fetchedChannel) {
                target = fetchedChannel;
            } else log(`Guild '${guild.name}' ${name} Channel ${errorMessage}`, "warning");
        }
        return target;
    }

    // Channel Fetching
    const channel_event = channelFetch(guild.channel_event, "Event");
    const channel_suggestion = channelFetch(guild.channel_suggestion, "Suggestion");
    const channel_snippet = channelFetch(guild.channel_snippet, "Snippet");
    const channel_rules = channelFetch(guild.channel_rules, "Rules");

    // Role Fetching
    let role_blinded = false;
    if (guild.role_blinded && guild.role_blinded.length === 19) {
        const fetchedRole = fetchedGuild.roles.cache.find(role => role.id === guild.role_blinded);
        if (fetchedRole) {
            role_blinded = fetchedRole;
        } else log(`Guild '${guild.name}' Blinded Role ${errorMessage}`, "warning");
    }

    // Completed Guild Object
    return {
        "guildObject": fetchedGuild,
        "name": guild.name,
        "register_snowflake": guild.register_snowflake,
        "channel_event": channel_event,
        "channel_suggestion": channel_suggestion,
        "channel_snippet": channel_snippet,
        "channel_rules": channel_rules,
        "role_power": guild.role_power,
        "role_blinded": role_blinded,
        "locale": guild.locale,
        "disabled": guild.disabled
    }
}

/**
 * Default Discord.JS Embed constructor. 
 * @param {string} title The title of the embed.
 * @param {string} subfieldTitle The sub-header of the embed.
 * @param {object} interaction Discord Interaction object.
 * @param {Array<object>} fields The fields to add. Needs to have a 'name' and 'value' key.
 * @returns The constructed embed.
 */
function embedConstructor(title, subfieldTitle, interaction, fields) {
    return new EmbedBuilder()
        .setColor(config.general.color)
        .setTitle(title)
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
        .addFields({ name: '----', value: subfieldTitle })
        .addFields(fields)
        .addFields({ name: '----', value: 'Meta' })
        .setTimestamp()
        .setFooter({ text: `Embed created by ${config.general.name}` });
}

/**
 * 
 * @param {string} guildId Find a specific indexed Guild by snowflake (id).
 * @returns 
 */
function findGuildById(guildId) {
    return module.exports.guilds.find(guild => guild.guildObject.id === guildId);
}

/**
 * Timestamp Calculation
 * @param {string} preferredLocale Overwrite default locale.
 * @returns Object with date, time and new Date().
 */
function getDate(preferredLocale) {
    let locale = "en-US";
    if (preferredLocale) locale = preferredLocale;
    const today = new Date(new Date().toLocaleString(locale, {
        timeZone: "Europe/Amsterdam"
    }));

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
     * @param {number} value Add an extra zero if the input number is not double-digit.
     * @returns Formatted value.
     */
    function formatTime(value) {
        return value < 10 ? "0" + value : value.toString();
    }

    return { date, time, today };
}

/**
 * Log messages to the log file.
 * @param {string} data The data to log to the file.
 * @param {string} type The type of message. For example: warning, alert, info, fatal, none.
 * @returns Status.
 */
function log(data, rawType) {
    let logData;
    let type = rawType;
    if (!rawType) type = "none";
    if (type === "none") {
        logData = `${data}\n`;
    } else logData = `${getDate().time} [${type.toUpperCase()}] ${data}\n`;
    fs.appendFile(`./logs/${getDate().date}.log`, logData, (err) => {
        if (err) {
            console.log(`${getDate().time} [ERROR] Error appending to log file.`);
            return false;
        }
    });
    console.log(logData);
    if (type === "fatal") return process.exit(1);
    return true;
}

// Exporting Values & Functions
module.exports = {
    "client": client,
    "database": database,
    "log": log,
    "superUsers": superUsers,
    "blockedUsers": blockedUsers,
    "guilds": [],
    "findGuildById": findGuildById,
    "getDate": getDate,
    "embedConstructor": embedConstructor
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
    } else return log(`Error at ${filePath}.`, "error");
}

// Event Handler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else client.on(event.name, (...args) => event.execute(...args));
}

// Cooldowns
client.cooldowns = new Collection();
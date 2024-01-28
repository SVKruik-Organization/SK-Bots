const modules = require('..');
const logger = require('./logger.js');

// Indexing Guilds and settings
modules.database.query("SELECT * FROM guild WHERE disabled = 0;")
    .then((data) => {
        data.forEach(async (guild) => Promise.resolve(await guildConstructor(guild, modules.client)).then((data) => module.exports.guilds.push(data)));
        logger.log("Fetched all guilds.", "info");
    }).catch(() => {
        logger.log("Loading Guild settings went wrong. Aborting.", "fatal");
    });

/**
 * Process raw data from the database to a refined object for further reading from.
 * Instead of raw channel snowflakes, it puts the entire Discord Channel object.
 * @param {object} guild A Guild object from the database.
 * @param {object} client Discord Client Object
 * @returns
 */
async function guildConstructor(guild, client) {
    // Guild Fetching
    const fetchedGuild = await client.guilds.fetch(guild.snowflake);
    if (!fetchedGuild) {
        logger.log(`Guild '${guild.name}'@'${guild.snowflake}' not found.`, "warning");
        return;
    }

    // Channel Fetching Prepare
    const errorMessage = "is configured, but not found. Corresponding command disabled for this run.";

    /**
     * Fetch a Discord Channel. Only works when the target channel is indexed/cached.
     * @param {string} channelId The ID of the channel.
     * @param {string} name The name of the channel.
     * @returns Channel
     */
    async function channelFetch(channelId, name) {
        let target = null;
        if (!channelId) return target;
        try {
            const fetchedChannel = await client.channels.fetch(channelId);
            if (fetchedChannel) {
                target = fetchedChannel;
            } else logger.log(`Guild '${guild.name}' ${name} Channel ${errorMessage}`, "warning");
        } catch (error) {
            return target;
        }
        return target;
    }

    // Channel Fetching
    const channel_event = await channelFetch(guild.channel_event, "Event");
    const channel_suggestion = await channelFetch(guild.channel_suggestion, "Suggestion");
    const channel_snippet = await channelFetch(guild.channel_snippet, "Snippet");
    const channel_rules = await channelFetch(guild.channel_rules, "Rules") || client.channels.cache.get(fetchedGuild.rulesChannelId) || null;

    // Role Fetching
    let role_blinded = null;
    if (guild.role_blinded && guild.role_blinded.length === 19) {
        const fetchedRole = fetchedGuild.roles.cache.find(role => role.id === guild.role_blinded);
        if (fetchedRole) {
            role_blinded = fetchedRole;
        } else logger.log(`Guild '${guild.name}' Blinded Role ${errorMessage}`, "warning");
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
 *
 * @param {string} guildId Find a specific indexed Guild by snowflake (id).
 * @returns
 */
function findGuildById(guildId) {
    return module.exports.guilds.find(guild => guild.guildObject.id === guildId);
}

module.exports = {
    "guildConstructor": guildConstructor,
    "findGuildById": findGuildById,
    "guilds": [],
}
const modules = require('..');
const logger = require('./log.js');

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

    function channelFetch(channelId, name) {
        let target = false;
        if (channelId && channelId.length === 19) {
            const fetchedChannel = client.channels.cache.get(channelId);
            if (fetchedChannel) {
                target = fetchedChannel;
            } else logger.log(`Guild '${guild.name}' ${name} Channel ${errorMessage}`, "warning");
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
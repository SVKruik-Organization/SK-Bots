const modules = require('..');
const logger = require('./logger.js');

// Indexing Guilds & Settings
try {
    modules.database.query("SELECT * FROM guild LEFT JOIN guild_settings ON guild_settings.guild_snowflake = guild.snowflake WHERE disabled = 0 AND production = 0;")
        .then(async (data) => {
            const guilds = [];
            for (let i = 0; i <= data.length; i++) {
                if (i === data.length) {
                    logger.log("Fetched all guilds.", "info");
                    module.exports.guilds = guilds;
                } else {
                    const guildObject = await guildConstructor(data[i]);
                    if (guildObject) guilds.push(guildObject);
                }
            }
        }).catch((error) => {
            logger.error(error);
            return logger.log("Loading Guild settings went wrong. Aborting.", "fatal");
        });
} catch (error) {
    logger.error(error);
}

/**
 * Process raw data from the database to a refined object for further reading from.
 * Instead of raw channel snowflakes, it puts the entire Discord Channel object.
 * @param {object} guild A Guild object from the database.
 * @returns
 */
async function guildConstructor(guild) {
    try {
        // Guild Fetching
        const fetchedGuild = await modules.client.guilds.fetch(guild.snowflake);
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
                const fetchedChannel = await modules.client.channels.fetch(channelId);
                if (fetchedChannel) {
                    target = fetchedChannel;
                } else logger.log(`Guild '${guild.name}' ${name} Channel ${errorMessage}`, "warning");
            } catch (error) {
                return target;
            }
            return target;
        }

        // Channel Fetching
        const channel_admin = await channelFetch(guild.channel_admin, "Admin");
        const channel_event = await channelFetch(guild.channel_event, "Event");
        const channel_suggestion = await channelFetch(guild.channel_suggestion, "Suggestion");
        const channel_snippet = await channelFetch(guild.channel_snippet, "Snippet");
        const channel_broadcast = await channelFetch(guild.channel_broadcast, "Broadcast");
        const channel_rules = await channelFetch(guild.channel_rules, "Rules") || modules.client.channels.cache.get(fetchedGuild.rulesChannelId) || null;

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
            // Guild
            "guildObject": fetchedGuild,
            "team_tag": guild.team_tag,
            "name": guild.name,
            "channel_admin": channel_admin,
            "channel_event": channel_event,
            "channel_suggestion": channel_suggestion,
            "channel_snippet": channel_snippet,
            "channel_broadcast": channel_broadcast,
            "channel_rules": channel_rules,
            "role_blinded": role_blinded,
            "locale": guild.locale,
            "disabled": guild.disabled,

            // Settings
            "xp15": guild.xp15,
            "xp50": guild.xp50,
            "level_up_reward_base": guild.level_up_reward_base,
            "role_cosmetic_price": guild.role_cosmetic_price,
            "role_cosmetic_power": guild.role_cosmetic_power,
            "role_level_power": guild.role_level_power,
            "role_level_max": guild.role_level_max,
            "role_level_enable": guild.role_level_enable,
            "role_level_color": guild.role_level_color,
            "jackpot": guild.jackpot,
            "welcome": guild.welcome,
            "xp_increase_normal": guild.xp_increase_normal,
            "xp_increase_slash": guild.xp_increase_slash,
            "xp_increase_purchase": guild.xp_increase_purchase
        }
    } catch (error) {
        if (error.status !== 404) {
            logger.error(error);
            return {};
        }
    }
}

/**
 *
 * @param {string} guildId Find a specific indexed Guild by snowflake (id).
 * @returns Discord Guild Object
 */
function findGuildById(guildId) {
    return module.exports.guilds.find(guild => guild.guildObject.id === guildId);
}

module.exports = {
    "guildConstructor": guildConstructor,
    "findGuildById": findGuildById,
    "guilds": [],
}

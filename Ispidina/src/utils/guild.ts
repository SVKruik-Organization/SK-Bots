import { CategoryChannel, Channel, Role, TextBasedChannel } from 'discord.js';
import { database, customClient } from '../index.js';
import { GuildFull, GuildUnfetchedFull } from '../types.js';
import { logMessage, logError } from '../utils/logger.js';
export let guilds: Array<GuildFull> = [];

// Indexing Guilds & Settings
try {
    const data: Array<GuildUnfetchedFull> = await database.query("SELECT * FROM guild LEFT JOIN guild_settings ON guild_settings.guild_snowflake = guild.snowflake WHERE disabled = 0 AND production = 0;")
    const newGuilds: Array<GuildFull> = [];
    for (let i = 0; i <= data.length; i++) {
        if (i === data.length) {
            logMessage("Fetched all guilds.", "info");
            guilds = newGuilds;
        } else {
            const guild_object = await guildConstructor(data[i]);
            if (guild_object) guilds.push(guild_object);
        }
    }
} catch (error: any) {
    logError(error);
    logMessage("Loading Guild settings went wrong. Aborting.", "fatal");
}

/**
 * Process raw data from the database to a refined object for further reading from.
 * Instead of raw channel snowflakes, it puts the entire Discord Channel object.
 * @param guild A joined Guild object from the database.
 * @returns
 */
async function guildConstructor(guild: GuildUnfetchedFull): Promise<GuildFull | undefined> {
    try {
        // Guild Fetching
        const fetchedGuild = await customClient.guilds.fetch(guild.snowflake);
        const errorMessage = "is configured, but not found. Corresponding command disabled for this run.";
        if (!fetchedGuild) {
            logMessage(`Guild '${guild.name}'@'${guild.snowflake}' not found.`, "warning");
            return undefined;
        }

        /**
         * Fetch a Discord Channel. Only works when the target channel is indexed/cached.
         * @param channelId The ID of the channel.
         * @param name The name of the channel.
         * @returns Channel
         */
        async function channelFetch(channelId: string, name: string) {
            let target: Channel | null = null;
            if (!channelId) return target;
            try {
                const fetchedChannel = await customClient.channels.fetch(channelId) as Channel | null;
                if (fetchedChannel) {
                    target = fetchedChannel;
                } else logMessage(`Guild '${guild.name}' ${name} Channel ${errorMessage}`, "warning");
            } catch (error: any) {
                return null;
            }
            return target;
        }

        // Channel Fetching
        const channel_admin: TextBasedChannel | null = await channelFetch(guild.channel_admin, "Admin") as TextBasedChannel | null;
        const channel_event: TextBasedChannel | null = await channelFetch(guild.channel_event, "Event") as TextBasedChannel | null;
        const channel_suggestion: TextBasedChannel | null = await channelFetch(guild.channel_suggestion, "Suggestion") as TextBasedChannel | null;
        const channel_snippet: TextBasedChannel | null = await channelFetch(guild.channel_snippet, "Snippet") as TextBasedChannel | null;
        const channel_broadcast: TextBasedChannel | null = await channelFetch(guild.channel_broadcast, "Broadcast") as TextBasedChannel | null;
        let channel_rules = await channelFetch(guild.channel_rules, "Rules") as TextBasedChannel | null;
        if (!channel_rules && fetchedGuild.rulesChannelId) channel_rules = customClient.channels.cache.get(fetchedGuild.rulesChannelId) as TextBasedChannel | null;
        const channel_ticket: CategoryChannel | null = await channelFetch(guild.channel_ticket, "Ticket") as CategoryChannel | null;

        // Role Fetching - Blinded
        let role_blinded = null;
        if (guild.role_blinded && guild.role_blinded.length === 19) {
            const fetchedRole: Role | undefined = fetchedGuild.roles.cache.find(role => role.id === guild.role_blinded);
            if (fetchedRole) {
                role_blinded = fetchedRole;
            } else logMessage(`Guild '${guild.name}' Blinded Role ${errorMessage}`, "warning");
        }

        // Role Fetching - Support
        let role_support = null;
        if (guild.role_support && guild.role_support.length === 19) {
            const fetchedRole: Role | undefined = fetchedGuild.roles.cache.find(role => role.id === guild.role_support);
            if (fetchedRole) {
                role_support = fetchedRole;
            } else logMessage(`Guild '${guild.name}' Support Role ${errorMessage}`, "warning");
        }

        // Completed Guild Object
        return {
            // Guild
            "guild_object": fetchedGuild,
            "team_tag": guild.team_tag,
            "name": guild.name,
            "channel_admin": channel_admin,
            "channel_event": channel_event,
            "channel_suggestion": channel_suggestion,
            "channel_snippet": channel_snippet,
            "channel_broadcast": channel_broadcast,
            "channel_rules": channel_rules,
            "channel_ticket": channel_ticket,
            "role_blinded": role_blinded,
            "role_support": role_support,
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
            "xp_increase_reaction": guild.xp_increase_reaction,
            "xp_increase_poll": guild.xp_increase_poll,
            "xp_increase_message": guild.xp_increase_message,
            "xp_increase_slash": guild.xp_increase_slash,
            "xp_increase_purchase": guild.xp_increase_purchase,
            "xp_formula": guild.xp_formula,
            "guild_date_creation": guild.guild_date_creation,
            "guild_date_update": guild.guild_date_update
        }
    } catch (error: any) {
        if (error.status !== 404) {
            logError(error);
            return undefined;
        }
    }
}

/**
 *
 * @param guildId Find a specific indexed Guild by snowflake (id).
 * @returns Discord Guild Object
 */
export function findGuildById(guildId: string | null): GuildFull | undefined {
    if (!guildId) return undefined;
    return guilds.find((guild) => guild.guild_object.id === guildId);
}

/**
 * Add a new guild to the in-memory storage.
 * @param guild The new guild to add.
 */
export function addGuild(guild: GuildFull): void {
    guilds.push(guild);
}

/**
 * Completely sets the array of current guilds to a new array.
 * @param newGuilds The new guilds to set to.
 */
export function setGuilds(newGuilds: Array<GuildFull>): void {
    guilds = newGuilds;
}

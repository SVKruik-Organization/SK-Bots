import { CategoryChannel, Guild, Role, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder, TextBasedChannel } from 'discord.js';
import { cooldowns } from "./config"

export type CommandWrapper = {
    default: Command
}

export type Command = {
    cooldown: cooldowns,
    data: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder,
    execute: Function,
    autocomplete: Function | undefined
}

export type EventWrapper = {
    default: BotEvent
}

export type BotEvent = {
    name: string,
    once: boolean,
    execute: Function
}

export type DueDate = {
    snowflake: string,
    expiry: Date,
    description: string,
    data: string | null
}

export type EmbedField = {
    name: string,
    value: string,
    inline: boolean
}

export interface GuildUnfetchedBase {
    snowflake: string;
    team_tag: string | null;
    name: string;
    channel_admin: string;
    channel_ticket: string;
    channel_event: string;
    channel_suggestion: string;
    channel_snippet: string;
    channel_rules: string;
    channel_broadcast: string;
    role_blinded: string;
    role_support: string;
    disabled: boolean;
    guild_date_creation: Date;
    guild_date_update: Date;
}

export interface GuildUnfetchedFull extends GuildUnfetchedBase {
    xp15: number;
    xp50: number;
    level_up_reward_base: number;
    role_cosmetic_price: number;
    role_cosmetic_power: number;
    role_level_power: number;
    role_level_max: number;
    role_level_enable: boolean;
    role_level_color: string;
    jackpot: number;
    welcome: boolean;
    xp_increase_reaction: number;
    xp_increase_poll: number;
    xp_increase_message: number;
    xp_increase_slash: number;
    xp_increase_purchase: number;
    xp_formula: string;
}

export interface GuildFull {
    guild_object: Guild;
    team_tag: string | null;
    name: string;
    channel_admin: TextBasedChannel | null;
    channel_ticket: CategoryChannel | null;
    channel_event: TextBasedChannel | null;
    channel_suggestion: TextBasedChannel | null;
    channel_snippet: TextBasedChannel | null;
    channel_rules: TextBasedChannel | null;
    channel_broadcast: TextBasedChannel | null;
    role_blinded: Role | null;
    role_support: Role | null;
    disabled: boolean;
    guild_date_creation: Date;
    guild_date_update: Date | null;
    xp15: number;
    xp50: number;
    level_up_reward_base: number;
    role_cosmetic_price: number;
    role_cosmetic_power: number;
    role_level_power: number;
    role_level_max: number;
    role_level_enable: boolean;
    role_level_color: string;
    jackpot: number;
    welcome: boolean;
    xp_increase_reaction: number;
    xp_increase_poll: number;
    xp_increase_message: number;
    xp_increase_slash: number;
    xp_increase_purchase: number;
    xp_formula: string;
}

export type OperatorCheck = {
    hasPermissions: boolean,
    data: Array<{
        team_tag: string,
        account_status: number,
        team_owner: string
    }>
}

export type Settings = {
    acknowledgeHighTemperature: boolean
}

export type HoistedOptions = {
    name: string,
    value: string,
    type: number
}

export type UplinkMessage = {
    sender: string,
    recipient: string,
    trigger_source: string,
    reason: string,
    task: string,
    content: string | SensorMessage,
    timestamp: Date
}

export type SensorMessage = {
    cpuData: any,
    temperatureData: any,
    memoryData: any,
    deviceName: string
}
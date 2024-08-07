import { SlashCommandBuilder } from "discord.js"
import { cooldowns } from "./config"

export type Command = {
    cooldown: cooldowns,
    data: SlashCommandBuilder,
    execute: Function
}

export interface GuildBase {
    snowflake: string;
    team_tag: string;
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
    locale: string;
    disabled: boolean;
    production: boolean;
    guild_date_creation: Date;
    guild_date_update: Date;
}
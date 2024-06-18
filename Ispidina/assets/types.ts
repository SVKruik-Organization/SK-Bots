import { SlashCommandBuilder } from "discord.js"
import { cooldowns } from "./config"

export type Command = {
    cooldown: cooldowns,
    data: SlashCommandBuilder,
    execute: Function,
    guildSpecific: boolean
}
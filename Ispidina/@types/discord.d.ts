import { Command } from "assets/types";
import { Collection } from "discord.js";

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, Command>;
        cooldowns: Collection<string, Collection>
    }
}
import { Client, Events, Guild, Interaction, Message } from 'discord.js';
import { customClient } from '..';
import { tier } from '../config';
import { increaseXp } from '../handlers/userIncreaseHandler';
import { findGuildById } from '../utils/guild';
import { handleAcknowledge } from '../handlers/dmCommandHandler';
import { BotEvent } from '../types';

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message) {
        // Validation
        if (message.author.bot) return;

        // Message inside Server/Guild
        if (message.guild) {
            const targetGuild = findGuildById(message.guild.id);
            let xpReward = tier.message;
            if (targetGuild && targetGuild.xp_increase_message) xpReward = targetGuild.xp_increase_message;
            const guild: Guild = { "id": message.guild.id } as Guild;
            const interaction: Interaction = {
                "user": message.author,
                "client": customClient as Client<true>,
                "channelId": message.channelId,
                "guild": guild
            } as Interaction
            increaseXp(interaction, xpReward);

            // Message inside DM
        } else {
            if (message.content.charAt(0) !== "/") return;
            switch (message.content.split(" ")[0]) {
                case "/acknowledge":
                    handleAcknowledge(message);
                    break;
                default:
                    return await message.reply({ content: `Hello there <@${message.author.id}>, \`${message.content}\` is not a valid DM command.` });
            }
        }
    }
} satisfies BotEvent;
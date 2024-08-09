import { Client, Events, Guild, Interaction, MessageReaction, User } from 'discord.js';
import { logError } from '../utils/logger.js';
import { customClient } from '../index.js';
import { tier } from '../config.js';
import { findGuildById } from '../utils/guild.js';
import { increaseXp } from '../handlers/userIncreaseHandler.js';
import { BotEvent } from '../types.js';

export default {
    name: Events.MessagePollVoteRemove,
    once: false,
    execute(event: MessageReaction, user: User) {
        try {
            const targetGuild = findGuildById(event.message.guildId);
            let xpReward = tier.poll;
            if (targetGuild && targetGuild.xp_increase_poll) xpReward = targetGuild.xp_increase_poll;
            const guild: Guild = { "id": event.message.guildId } as Guild;
            const interaction: Interaction = {
                "user": user,
                "client": customClient as Client<true>,
                "channelId": event.message.channelId,
                "guild": guild
            } as Interaction
            increaseXp(interaction, -xpReward);
        } catch (error: any) {
            logError(error);
        }
    }
} satisfies BotEvent;
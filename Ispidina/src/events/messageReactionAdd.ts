import { Client, Events, Guild, Interaction, MessageReaction, User } from 'discord.js';
import { logError } from '../utils/logger';
import { customClient } from '..';
import { tier } from '../config';
import { findGuildById } from '../utils/guild';
import { increaseXp } from '../handlers/userIncreaseHandler';
import { BotEvent } from '../types';

export default {
    name: Events.MessageReactionAdd,
    once: false,
    execute(event: MessageReaction, user: User) {
        try {
            const targetGuild = findGuildById(event.message.guildId);
            let xpReward = tier.react;
            if (targetGuild && targetGuild.xp_increase_reaction) xpReward = targetGuild.xp_increase_reaction;
            const guild: Guild = { "id": event.message.guildId } as Guild;
            const interaction: Interaction = {
                "user": user,
                "client": customClient as Client<true>,
                "channelId": event.message.channelId,
                "guild": guild
            } as Interaction
            increaseXp(interaction, xpReward);
        } catch (error: any) {
            logError(error);
        }
    }
} satisfies BotEvent;
import { EmbedBuilder, Events, GuildMember } from 'discord.js';
import { general } from '../config.js';
import { create } from '../utils/embed.js';
import { findUserById } from '../utils/user.js';
import { database } from '../index.js';
import { logError, logMessage } from '../utils/logger.js';
import { BotEvent } from '../types.js';

export default {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(guildMember: GuildMember) {
        try {
            const data: Array<{ welcome: boolean }> = await database.query("SELECT welcome FROM guild_settings WHERE guild_snowflake = ?;", [guildMember.guild.id]);
            if (data.length > 0 && data[0].welcome) {
                const welcomeEmbed: EmbedBuilder = create(`Welcome to ${guildMember.guild.name}!`, "We are glad to have you!", guildMember.user, [
                    { "name": "About Me", "value": `I am <@${general.clientId}>, a General Purpose bot made by <@${general.authorId}>. I am in charge of the Level and Economy system, and keeping the server tidy. I also have fun commands, like 'Rock, Paper, Scissor' and utility commands to make management easier.`, inline: false },
                    { "name": "Level & Economy", "value": `Participating is entirely up to you! By default, you are not in this program. If you would like to opt-in, use the \`/register\` command! You can collect your daily reward by using \`/daily\` command. With Bits you can purchase cosmetics (role colors) and XP-Boosters.`, inline: false },
                    { "name": "Concluding", "value": `Well that's all from me I guess, if you have questions or concerns, you can contact <@${general.authorId}> and the moderators of **${guildMember.guild.name}**. We hope you like your stay, and GLHF!`, inline: false }
                ], []);
                const user = await findUserById(guildMember.user.id);
                if (user) user.send({ embeds: [welcomeEmbed] });
            } else return logMessage(`Guild '${guildMember.guild.name}@${guildMember.guild.id}' settings not found, welcome message could not be sent.`, "warning");
        } catch (error: any) {
            logError(error);
            return logMessage(`Sending welcome message for guild '${guildMember.guild.name}@${guildMember.guild.id}' went wrong.`, "warning");
        }
    }
} satisfies BotEvent;
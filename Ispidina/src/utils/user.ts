import { customClient, database } from '..';
import { logError } from './logger';
import { general } from '../config';
import { ChatInputCommandInteraction, GuildMember, User } from 'discord.js';
import { OperatorCheck } from '../types';

/**
 *
 * @param userId Find a specific User by snowflake (id).
 * @returns Discord User Object
 */
export async function findUserById(userId: string): Promise<User> {
    return await customClient.users.fetch(userId);
}

/**
 * Check if the user has the rights to perform this command.
 * @param interaction Discord Interaction Object
 * @returns If the user is an Administrator.
 */
export async function checkAdmin(interaction: ChatInputCommandInteraction): Promise<boolean> {
    try {
        // Guild
        if (!interaction.guild) return false;
        const data: Array<string> = await database.query("SELECT user_snowflake FROM user_administrator WHERE user_snowflake = ? AND guild_snowflake = ?;", [interaction.user.id, interaction.guild.id]);
        if (data.length === 0) return false;

        // Member
        const member: GuildMember | undefined = interaction.guild.members.cache.get(interaction.user.id);
        if (!member) return false;

        // Role
        const hasRole: boolean = member.roles.cache.some(role => role.name === `${general.name} Administrator`);
        return hasRole;
    } catch (error: any) {
        logError(error);
        return false;
    }
}

/**
 * Check if someone is an Operator for elevated commands in the current server.
 * @param interaction Discord Interaction Object
 * @returns
 */
export async function checkOperator(interaction: ChatInputCommandInteraction): Promise<OperatorCheck> {
    try {
        if (!interaction.guild) return { hasPermissions: false, data: [] };
        const data = await database.query("SELECT guild.team_tag, account_status, team_owner FROM operator_member LEFT JOIN guild ON operator_member.team_tag = guild.team_tag WHERE operator_member.snowflake = ? AND guild.snowflake = ?;", [interaction.user.id, interaction.guild.id]);
        if (data.length === 0) {
            await interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Note that this is an Operator command, so you need additional permissionsand a **special account**. This is not the \`/register\` account. Please try again later, or contact <@${general.authorId}> if you think this is a mistake.`,
                ephemeral: true
            });
            return { hasPermissions: false, data: [] };
        } else if (data[0].account_status < 2) {
            await interaction.reply({
                content: "I see you already have an account, but it is not verified for this server yet (the Operator team that manages this server). Verification is required for use of Operator commands. Please verify your account and try again later.",
                ephemeral: true
            });
            return { hasPermissions: false, data: data[0] };
        }
        return { hasPermissions: true, data: data[0] };
    } catch (error: any) {
        logError(error);
        return { hasPermissions: false, data: [] };
    }
}

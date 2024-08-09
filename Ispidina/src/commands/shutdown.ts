import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { cooldowns, general } from '../config.js';
import { database } from '../index.js';
import { logError, logMessage } from '../utils/logger.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setNameLocalizations({
            nl: "uitschakelen"
        })
        .setDescription(`Turn ${general.name} off. This action is irreversible from Discord, a manual restart required.`)
        .setDescriptionLocalizations({
            nl: `Zet ${general.name} uit. Deze actie is onomkeerbaar vanuit Discord, een handmatige herstart is vereist.`
        })
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Permission Validation
            if (interaction.user.id !== general.authorId) return await interaction.reply({
                content: `This command is reserved for my developer, <@${general.authorId}>, only. If you are experiencing problems with (one of) the commands, please contact him.`,
                ephemeral: true
            });

            // Database Connection
            await database.end();
            logMessage("Terminated database connection. Shutting down.", "alert");

            await interaction.reply({ content: `${general.name} is logging off. Bye!` });
            setTimeout(() => process.exit(0), 1000);
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
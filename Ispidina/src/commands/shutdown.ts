const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const modules = require('..');
const logger = require('../utils/logger');

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
            if (interaction.user.id !== general.authorId) return interaction.reply({
                content: `This command is reserved for my developer, <@${general.authorId}>, only. If you are experiencing problems with (one of) the commands, please contact him.`,
                ephemeral: true
            });

            // Database Connection
            await database.end();
            logMessage("Terminated database connection. Shutting down.", "alert");

            await return interaction.reply({ content: `${general.name} is logging off. Bye!` });
            setTimeout(() => process.exit(0), 1000);
        } catch (error: any) {
            logError(error);
        }
    }
};
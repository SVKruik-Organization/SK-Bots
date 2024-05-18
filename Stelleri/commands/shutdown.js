const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setNameLocalizations({
            nl: "uitschakelen"
        })
        .setDescription(`Turn ${config.general.name} off. This action is irreversible from Discord, a manual restart required.`)
        .setDescriptionLocalizations({
            nl: `Zet ${config.general.name} uit. Deze actie is onomkeerbaar vanuit Discord, een handmatige herstart is vereist.`
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        try {
            // Permission Validation
            if (interaction.user.id !== config.general.authorSnowflake) return interaction.reply({
                content: `This command is reserved for my developer, <@${config.general.authorSnowflake}>, only. If you are experiencing problems with (one of) the commands, please contact him.`,
                ephemeral: true
            });

            await modules.database.end();
            logger.log("Terminated database connection. Shutting down.", "alert");
            interaction.reply({ content: `${config.general.name} is logging off. Bye!` });
            setTimeout(() => {
                process.exit(0);
            }, 1000);
        } catch (error) {
            logger.error(error);
        }
    },
    guildSpecific: false
};
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const logger = require('../utils/log.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Turn the bot off. This action is irreversible from Discord, manual restart required.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await modules.database.end();
        logger.log("Terminated database connection. Shutting down.", "alert");
        interaction.reply(`${config.general.name} is logging off. Bye!`);
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }
};
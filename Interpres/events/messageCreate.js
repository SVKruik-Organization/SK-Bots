const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        if (message.author.bot) return;

        // Guild Message
        if (message.guildId) {
        } else if (message.content.startsWith(process.env.DM_COMMAND_PREFIX)) {

            // DM Message - Commands
            switch (message.content) {
                default:
                    message.reply(`Hello there, <@${message.author.id}>! \`${message.content}\` is not a valid DM command.`);
                    break;
            }
        }
    }
};
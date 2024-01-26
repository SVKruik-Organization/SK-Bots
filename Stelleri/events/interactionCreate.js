const { Events } = require('discord.js');
const modules = require('..');
const { Collection } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/log.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        if (!modules.superUsers.includes(interaction.user.id) && modules.blockedUsers.includes(interaction.user.id)) {
            logger.log(`${interaction.user.username} tried using || ${interaction.commandName} || but was unable to because they are blacklisted.`, "info");
            return interaction.reply({
                content: 'You are not allowed to use my commands. Please contact the moderators to appeal if you think this is a mistake.',
                ephemeral: true
            });
        }

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return logger.log(`No command matching ${interaction.commandName} was found.`, "warning");

        if (!modules.superUsers.includes(interaction.user.id)) {
            const { cooldowns } = modules.client;
            if (!cooldowns.has(command.data.name))
                cooldowns.set(command.data.name, new Collection());

            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const defaultCooldownDuration = 3;
            const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
                    return interaction.reply({
                        content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
                        ephemeral: true
                    });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        }

        try {
            command.execute(interaction);
        } catch (error) {
            logger.log(`There was an error while executing || ${interaction.commandName} ||`, "error");
            interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            console.log(error);
        }

        modules.database.query("UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = ?; UPDATE tier SET xp = xp + ? WHERE snowflake = ?; SELECT * FROM tier WHERE snowflake = ?",
            [interaction.user.id, config.tier.slashCommand, interaction.user.id, interaction.user.id])
            .then((data) => {
                if (data[2][0].xp >= (2 * (data[2][0].level + 1) + 30)) {
                    modules.database.query("UPDATE tier SET level = level + 1, xp = 0 WHERE snowflake = ?;", [interaction.user.id])
                        .then(() => {
                            const newLevel = data[2][0].level + 1;
                            const channel = modules.client.channels.cache.get(interaction.channelId);
                            channel.send({ content: `Nice! <@${interaction.user.id}> just leveled up and reached level ${newLevel}! 🎉` });
                        }).catch((err) => {
                        console.log(err);
                        return logger.log(`XP increase unsuccessful, ${interaction.user.username} does not have an account yet.`, "warning");
                    });
                }

            }).catch((err) => {
            console.log(err);
            return logger.log(`Command usage increase unsuccessful, ${interaction.user.username} does not have an account yet.`, "warning");
        });

        logger.log(`${interaction.user.username} used || ${interaction.commandName} ||`, "info");
    }
};
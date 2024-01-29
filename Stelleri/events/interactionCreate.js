const { Events } = require('discord.js');
const modules = require('..');
const { Collection } = require('discord.js');
const config = require('../assets/config.js');
const logger = require('../utils/logger.js');
const shopInteractionHandler = require('../handlers/shopInteractionHandler.js');
const xpIncreaseHandler = require('../handlers/xpIncreaseHandler.js');
const boosterInteractionHandler = require('../handlers/boosterInteractionHandler.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Select Menu Interactions
        if (interaction.isStringSelectMenu()) {
            // View Shop Options
            if (interaction.customId === "shopSelectMenu" && interaction.values[0] === "catalog") {
                interaction.reply({ content: "Received. Catalog is WIP.", ephemeral: true });

                // View Shop Options
            } else if (interaction.customId === "shopSelectMenu" && interaction.values[0] === "buy") {
                shopInteractionHandler.shopOptions(interaction);

                // View Shop Purschase Options
            } else if (interaction.customId === "shopBuyMenu") {
                shopInteractionHandler.purschaseOptions(interaction, interaction.values[0]);

                // Activate XP-Booster
            } else if (interaction.customId === "activateBoosterMenu") {
                boosterInteractionHandler.confirmActivateDialog(interaction, interaction.values[0]);
            }
        }

        // Button Interactions
        if (interaction.isButton()) {
            // Purschase Quantity Modal Open
            if (interaction.customId === 'openShopBuyModal') {
                await shopInteractionHandler.modal(interaction, interaction.message.components[0].components[0].data.label.split(" ")[1]);

                // Confirm Booster Activation
            } else if (interaction.customId === "confirmBoosterActivate") {
                boosterInteractionHandler.confirmActivate(interaction);

                // Cancel Booster Activation
            } else if (interaction.customId === "cancelBoosterActivate") {
                boosterInteractionHandler.cancelActivate(interaction);
            }
        }

        // Modal Interactions
        if (interaction.isModalSubmit()) {
            if (interaction.customId === "shopBuyModal") {
                shopInteractionHandler.modalInputHandler(interaction);
            }
        }

        // Normal Slash Interactions
        if (!interaction.isChatInputCommand()) return;
        // Blacklist
        if (!modules.superUsers.includes(interaction.user.id) && modules.blockedUsers.includes(interaction.user.id)) {
            logger.log(`'${interaction.user.username}@${interaction.user.id}' tried using the || ${interaction.commandName} || command, but was unable to because they are blacklisted.`, "info");
            return interaction.reply({
                content: 'You are not allowed to use my commands. Please contact the moderators to appeal if you think this is a mistake.',
                ephemeral: true
            });
        }

        // Validation
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return logger.log(`No command matching ${interaction.commandName} was found.`, "warning");

        // Cooldown
        if (!modules.superUsers.includes(interaction.user.id)) {
            const { cooldowns } = interaction.client;
            if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Collection());

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

        // Executing
        try {
            command.execute(interaction);
        } catch (error) {
            logger.log(`There was an error while executing || ${interaction.commandName} ||`, "error");
            interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            console.error(error);
        }

        // Experience
        xpIncreaseHandler.increaseXp(interaction.user.id, interaction.user.username, config.tier.slashCommand, true, interaction.channelId, interaction.client);

        // Logging
        let options = [];
        interaction.options._hoistedOptions.forEach(element => {
            options.push(`${element.name}: ${element.value}`);
        });
        const processedOptions = ` with the following options: ${JSON.stringify(options)}`;
        logger.log(`'${interaction.user.username}@${interaction.user.id}' used || ${interaction.commandName} || command${options.length > 0 ? processedOptions : ""} in guild '${interaction.guild.name}@${interaction.guild.id}'`, "info");
    }
};
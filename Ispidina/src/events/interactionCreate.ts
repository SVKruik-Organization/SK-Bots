const { Events } = require('discord.js');
const modules = require('..');
const { Collection } = require('discord.js');
const config = require('../config');
const logger = require('../utils/logger');
const shopInteractionHandler = require('../handlers/shopInteractionHandler');
const userIncreaseHandler = require('../handlers/userIncreaseHandler');
const boosterInteractionHandler = require('../handlers/boosterInteractionHandler');
const { customShopCatalog } = require('../utils/embed');
const closeInteractionHandler = require('../handlers/closeInteractionHandler');
const eventSignUpHandler = require('../handlers/eventSignUpHandler');
const guildUtils = require('../utils/guild');
const dateUtils = require('../utils/date');
const operatorHandler = require('../handlers/operatorHandler');
const ticketHandler = require('../handlers/ticketHandler');

export default {
    name: Events.InteractionCreate,
    async execute(interaction: ChatInputCommandInteraction) {
        // Select Menu Interactions
        if (interaction.isStringSelectMenu()) {
            // View Shop Options Overview
            if (interaction.customId === "shopSelectMenu" && interaction.values[0] === "catalog") {
                customShopCatalog(interaction);

                // View Shop Buy Options
            } else if (interaction.customId === "shopSelectMenu" && interaction.values[0] === "buy") {
                shopInteractionHandler.shopOptions(interaction);

                // View Shop Purchase Options
            } else if (interaction.customId === "shopBuyMenu") {
                shopInteractionHandler.purchaseOptions(interaction, interaction.values[0]);

                // Activate XP-Booster
            } else if (interaction.customId === "activateBoosterMenu") {
                boosterInteractionHandler.confirmActivateDialog(interaction, interaction.values[0]);

                // Operator Invite Decline Selection Menu
            } else if (interaction.customId === "operatorInviteDeclineSelectMenu") {
                operatorHandler.handleDeclineSelect(interaction);

                // Operator Selection Menu
            } else if (interaction.customId === "operatorSelectMenu") {
                operatorHandler.handleSelectionMenu(interaction);

                // Operator Modify Menu
            } else if (interaction.customId === "operatorModifyMenu") {
                operatorHandler.handleModifyMenu(interaction);

                // Operator Modify Remove Menu
            } else if (interaction.customId === "operatorModifyRemoveMenu") {
                operatorHandler.handleModifyRemoveMenu(interaction);

            }
        }

        // Button Interactions
        if (interaction.isButton()) {
            // Purchase Quantity Modal Open
            if (interaction.customId === 'openShopBuyModal') {
                await shopInteractionHandler.modal(interaction, interaction.message.components[0].components[0].data.label.split(" ")[1]);

                // Confirm Booster Activation
            } else if (interaction.customId === "confirmBoosterActivate") {
                boosterInteractionHandler.confirmActivate(interaction);

                // Cancel Booster Activation
            } else if (interaction.customId === "cancelBoosterActivate") {
                boosterInteractionHandler.cancelActivate(interaction);

                // Confirm Account Close
            } else if (interaction.customId === "confirmAccountClose") {
                closeInteractionHandler.confirmAccountClose(interaction);

                // Cancel Account Close
            } else if (interaction.customId === "cancelAccountClose") {
                closeInteractionHandler.cancelAccountClose(interaction);

                // Event Sign Up   
            } else if (interaction.customId.includes("eventSignUp")) {
                eventSignUpHandler.signUp(interaction);

                // Operator Invite Decline
            } else if (interaction.customId.includes("declineOperatorInvite")) {
                operatorHandler.handleDeclineFinal(interaction);

                // Operator Invite Cancel Decline
            } else if (interaction.customId.includes("cancelOperatorInvite")) {
                operatorHandler.handleDeclineCancel(interaction);

                // Close Ticket Channel
            } else if (interaction.customId.includes("closeTicketChannel")) {
                ticketHandler.closeChannel(interaction);

            }
        }

        // Modal Interactions
        if (interaction.isModalSubmit()) {
            if (interaction.customId === "shopBuyModal") {
                shopInteractionHandler.modalInputHandler(interaction);
            }
        }

        // Autocomplete
        if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return logMessage(`No command for ${interaction.commandName} was found.`, "warning");
            await command.autocomplete(interaction);
        }

        // Normal Slash Interactions
        if (!interaction.isChatInputCommand()) return;

        // Validation
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return interaction.reply({
            content: "This command is not supported (for now). Please try again later.",
            ephemeral: true
        });

        if (interaction.guild) {
            // Blocked User
            const blockedUsers = await database.query("SELECT user_snowflake FROM user_blocked WHERE user_snowflake = ? AND guild_snowflake = ?;", [interaction.user.id, interaction.guild.id]);
            if (blockedUsers.length !== 0) return interaction.reply({
                content: "You are on the blocked users list, and you are therefore unable to use my commands. If you think this is a mistake, please contact moderation to appeal.",
                ephemeral: true
            });

            // Administrator User Cooldown Exception
            const adminUsers = await database.query("SELECT user_snowflake FROM user_administrator WHERE user_snowflake = ? AND guild_snowflake = ?;", [interaction.user.id, interaction.guild.id]);
            if (adminUsers.length === 0 || interaction.user.id !== general.authorId) {

                // Cooldown Logic
                const { cooldowns } = interaction.client;
                if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Collection());

                const now = getDate(null, null).today;
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

            // Experience Increase
            const targetGuild = findGuildById(interaction.guild.id);
            let xpReward = tier.slashCommand;
            if (targetGuild && targetGuild.xp_increase_slash) xpReward = targetGuild.xp_increase_slash;
            userIncreaseHandler.increaseXp(interaction, xpReward);
        }

        // Logging
        let options = [];
        interaction.options._hoistedOptions.forEach(element => {
            options.push(`${element.name}: ${element.value}`);
        });
        const processedOptions = ` with the following options: ${JSON.stringify(options)}`;
        logMessage(`'${interaction.user.username}@${interaction.user.id}' used || ${interaction.commandName} || command${options.length > 0 ? processedOptions : ""} in guild '${interaction.guild ? interaction.guild.name : "DM_COMMAND"}@${interaction.guild ? interaction.guild.id : "DM_COMMAND"}'`, "info");

        // Executing
        try {
            command.execute(interaction);
        } catch (error: any) {
            logMessage(`There was an error while executing || ${interaction.commandName} ||`, "error");
            return interaction.reply({ content: 'There was an fatal error while executing this command!', ephemeral: true });
            logError(error);
        }

        // Command Usage
        userIncreaseHandler.increaseCommand(interaction.user.id, interaction.commandName);
    }
};
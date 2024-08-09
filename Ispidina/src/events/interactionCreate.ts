import { ActionRow, ComponentType, Events, Interaction, MessageActionRowComponent } from 'discord.js';
import { customClient, database } from '../index.js';
import { Collection } from 'discord.js';
import { general, tier } from '../config.js';
import { logError, logMessage } from '../utils/logger.js';
import { modal, modalInputHandler, purchaseOptions, shopOptions } from '../handlers/shopInteractionHandler.js';
import { increaseXp, increaseCommand } from '../handlers/userIncreaseHandler.js';
import { cancelActivate, confirmActivate, confirmActivateDialog } from '../handlers/boosterInteractionHandler.js';
import { customShopCatalog } from '../utils/embed.js';
import { cancelAccountClose, confirmAccountClose } from '../handlers/closeInteractionHandler.js';
import { signUp } from '../handlers/eventSignUpHandler.js';
import { findGuildById } from '../utils/guild.js';
import { getDate } from '../utils/date.js';
import { handleDeclineCancel, handleDeclineFinal, handleDeclineSelect, handleModifyMenu, handleModifyRemoveMenu, handleSelectionMenu } from '../handlers/operatorHandler.js';
import { closeChannel } from '../handlers/ticketHandler.js';
import { BotEvent, HoistedOptions } from '../types.js';

export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction) {
        // Select Menu Interactions
        if (interaction.isStringSelectMenu()) {
            // View Shop Options Overview
            if (interaction.customId === "shopSelectMenu" && interaction.values[0] === "catalog") {
                customShopCatalog(interaction);

                // View Shop Buy Options
            } else if (interaction.customId === "shopSelectMenu" && interaction.values[0] === "buy") {
                shopOptions(interaction);

                // View Shop Purchase Options
            } else if (interaction.customId === "shopBuyMenu") {
                purchaseOptions(interaction, interaction.values[0]);

                // Activate XP-Booster
            } else if (interaction.customId === "activateBoosterMenu") {
                confirmActivateDialog(interaction, interaction.values[0]);

                // Operator Invite Decline Selection Menu
            } else if (interaction.customId === "operatorInviteDeclineSelectMenu") {
                handleDeclineSelect(interaction);

                // Operator Selection Menu
            } else if (interaction.customId === "operatorSelectMenu") {
                handleSelectionMenu(interaction);

                // Operator Modify Menu
            } else if (interaction.customId === "operatorModifyMenu") {
                handleModifyMenu(interaction);

                // Operator Modify Remove Menu
            } else if (interaction.customId === "operatorModifyRemoveMenu") {
                handleModifyRemoveMenu(interaction);

            }
        }

        // Button Interactions
        if (interaction.isButton()) {
            // Purchase Quantity Modal Open
            if (interaction.customId === 'openShopBuyModal') {
                const actionRow: ActionRow<MessageActionRowComponent> = interaction.message.components[0];
                const button: MessageActionRowComponent = actionRow.components[0];
                const label: string | null = button.type === ComponentType.Button ? button.label : null;
                if (!label) return;
                await modal(interaction, label.split(" ")[1]);

                // Confirm Booster Activation
            } else if (interaction.customId === "confirmBoosterActivate") {
                confirmActivate(interaction);

                // Cancel Booster Activation
            } else if (interaction.customId === "cancelBoosterActivate") {
                cancelActivate(interaction);

                // Confirm Account Close
            } else if (interaction.customId === "confirmAccountClose") {
                confirmAccountClose(interaction);

                // Cancel Account Close
            } else if (interaction.customId === "cancelAccountClose") {
                cancelAccountClose(interaction);

                // Event Sign Up   
            } else if (interaction.customId.includes("eventSignUp")) {
                signUp(interaction);

                // Operator Invite Decline
            } else if (interaction.customId.includes("declineOperatorInvite")) {
                handleDeclineFinal(interaction);

                // Operator Invite Cancel Decline
            } else if (interaction.customId.includes("cancelOperatorInvite")) {
                handleDeclineCancel(interaction);

                // Close Ticket Channel
            } else if (interaction.customId.includes("closeTicketChannel")) {
                closeChannel(interaction);

            }
        }

        // Modal Interactions
        if (interaction.isModalSubmit()) {
            if (interaction.customId === "shopBuyModal") {
                modalInputHandler(interaction);
            }
        }

        // Autocomplete
        if (interaction.isAutocomplete()) {
            const command = customClient.commands.get(interaction.commandName);
            if (!command) return logMessage(`No command for ${interaction.commandName} was found.`, "warning");
            if (command.autocomplete) await command.autocomplete(interaction);
        }

        // Normal Slash Interactions
        if (!interaction.isChatInputCommand()) return;

        // Validation
        const command = customClient.commands.get(interaction.commandName);
        if (!command) return await interaction.reply({
            content: "This command is not supported (for now). Please try again later.",
            ephemeral: true
        });

        if (interaction.guild) {
            // Blocked User
            const blockedUsers = await database.query("SELECT user_snowflake FROM user_blocked WHERE user_snowflake = ? AND guild_snowflake = ?;", [interaction.user.id, interaction.guild.id]);
            if (blockedUsers.length !== 0) return await interaction.reply({
                content: "You are on the blocked users list, and you are therefore unable to use my commands. If you think this is a mistake, please contact moderation to appeal.",
                ephemeral: true
            });

            // Administrator User Cooldown Exception
            const adminUsers = await database.query("SELECT user_snowflake FROM user_administrator WHERE user_snowflake = ? AND guild_snowflake = ?;", [interaction.user.id, interaction.guild.id]);
            if (adminUsers.length === 0 || interaction.user.id !== general.authorId) {

                // Cooldown Logic
                const cooldowns: Collection<string, Collection<string, Date>> = customClient.cooldowns;
                if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Collection());

                const now: number = getDate(null, null).today.getTime();
                const timestamps: Collection<string, Date> | undefined = cooldowns.get(command.data.name);

                if (timestamps) {
                    const defaultCooldownDuration = 3;
                    const cooldownAmount: number = (command.cooldown ?? defaultCooldownDuration) * 1000;
                    if (timestamps.has(interaction.user.id)) {
                        const userTimestamps: Date | undefined = timestamps.get(interaction.user.id);
                        if (userTimestamps) {
                            const expirationTime: number = userTimestamps.getTime() + cooldownAmount;
                            if (now < expirationTime) {
                                const expiredTimestamp = Math.round(expirationTime / 1000);
                                return await interaction.reply({
                                    content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
                                    ephemeral: true
                                });
                            }
                        }
                    }

                    timestamps.set(interaction.user.id, new Date(now));
                    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
                }
            }

            // Experience Increase
            const targetGuild = findGuildById(interaction.guild.id);
            let xpReward = tier.slashCommand;
            if (targetGuild && targetGuild.xp_increase_slash) xpReward = targetGuild.xp_increase_slash;
            increaseXp(interaction, xpReward);
        }

        // Logging
        const interactionOptions = interaction.options as unknown as any;
        const rawOptions: Array<HoistedOptions> = interactionOptions._hoistedOptions as Array<HoistedOptions>;
        const options: Array<string> = [];
        if (interactionOptions._subcommand) options.push(`subcommand: ${interactionOptions._subcommand}`);
        rawOptions.forEach(element => {
            options.push(`${element.name}: ${element.value}`);
        });
        const processedOptions = ` with the following options: ${JSON.stringify(options)}`;
        logMessage(`'${interaction.user.username}@${interaction.user.id}' used || ${interaction.commandName} || command${options.length > 0 ? processedOptions : ""} in guild '${interaction.guild ? interaction.guild.name : "DM_COMMAND"}@${interaction.guild ? interaction.guild.id : "DM_COMMAND"}'`, "info");

        // Executing
        try {
            command.execute(interaction);
        } catch (error: any) {
            logMessage(`There was an error while executing || ${interaction.commandName} ||`, "error");
            await interaction.reply({ content: 'There was an fatal error while executing this command!', ephemeral: true });
            logError(error);
        }

        // Command Usage
        increaseCommand(interaction.user.id, interaction.commandName);
    }
} satisfies BotEvent;
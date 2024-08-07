import { ButtonInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js';

import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } from 'discord.js';
import { database } from '..';
import { logError, logMessage } from '../utils/logger';
import { increaseXp } from './userIncreaseHandler';
import { tier } from '../config';
import { post } from './purchaseHistory';
import { findGuildById } from '../utils/guild';

/**
 * Handle input when user wants uses the Shop command.
 * @param interaction Discord Interaction Object
 */
export async function shopOptions(interaction: StringSelectMenuInteraction) {
    try {
        database.query("SELECT * FROM guild_settings WHERE guild_snowflake = ?", [interaction.guild?.id])
            .then(async (data) => {
                // Send Purchase Options
                const select = new StringSelectMenuBuilder()
                    .setCustomId('shopBuyMenu')
                    .setPlaceholder('Make a selection.')
                    .addOptions(new StringSelectMenuOptionBuilder()
                        .setLabel('Role Color')
                        .setDescription(`Give your name a custom color. One change. Cost: ${data[0].role_cosmetic_price} Bits`)
                        .setValue('role_cosmetic'))
                    .addOptions(new StringSelectMenuOptionBuilder()
                        .setLabel('XP-Boost 15% 24H')
                        .setDescription(`Temporary XP-boost on all gained Experience. Cost: ${data[0].xp15} Bits`)
                        .setValue('xp15'))
                    .addOptions(new StringSelectMenuOptionBuilder()
                        .setLabel('XP-Boost 50% 24H')
                        .setDescription(`Temporary XP-boost on all gained Experience. Cost: ${data[0].xp50} Bits`)
                        .setValue('xp50'));

                await interaction.update({
                    content: 'Sure! What would you like to purchase?',
                    components: [new ActionRowBuilder().addComponents(select)],
                    ephemeral: true
                });
            }).catch((error: any) => {
                logError(error);
                return interaction.update({
                    content: "Something went wrong while retrieving the required information. Please try again later.",
                    ephemeral: true
                });
            });
    } catch (error: any) {
        logError(error);
    }
}

/**
 * Handle input when user wants to buy something.
 * @param interaction Discord Interaction Object
 * @param purchaseOption The selected product.
 */
export async function purchaseOptions(interaction: StringSelectMenuInteraction, purchaseOption: string) {
    // Buy Amount
    const button = new ButtonBuilder()
        .setCustomId('openShopBuyModal')
        .setLabel(`Buy ${purchaseOption}`)
        .setStyle(ButtonStyle.Success);

    await interaction.update({
        content: 'Thank you for your selection. Click this button to fill in the quantity.',
        components: [new ActionRowBuilder().addComponents(button)],
        ephemeral: true
    });
}

/**
 * Show input for quantity.
 * @param interaction Discord Interaction Object
 * @param product The selected product.
 */
export async function modal(interaction: ButtonInteraction, product: string) {
    const modal = new ModalBuilder()
        .setCustomId('shopBuyModal')
        .setTitle(`Shop Purchase - ${product}`);

    // Input Constructors
    const amountInput = new TextInputBuilder()
        .setCustomId('shopModalAmount')
        .setLabel("How many would you like to buy?")
        .setMinLength(1)
        .setValue("1")
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Amount of items you would like to purchase.");
    const firstActionRow = new ActionRowBuilder().addComponents(amountInput);

    // Show
    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);
}

/**
 * Handle modal input when user wants to buy something.
 * @param interaction Discord Interaction Object
 */
export async function modalInputHandler(interaction: ModalSubmitInteraction) {
    try {
        const amount: number = parseInt(interaction.fields.getTextInputValue('shopModalAmount'));
        const product = interaction.message.components[0].components[0].label.split(" ")[1];
        if (isNaN(amount)) return interaction.update({ content: 'The amount of items you would like to buy should be a number. Please try again.', ephemeral: true });
        if (amount < 1) return interaction.update({ content: 'You must buy atleast one item. Please try again.', ephemeral: true });

        database.query("SELECT xp15, xp50, role_cosmetic_price, wallet, bank, (wallet + bank) AS total FROM guild_settings LEFT JOIN economy ON 1 = 1 WHERE guild_settings.guild_snowflake = ? AND economy.snowflake = ?;", [interaction.guild.id, interaction.user.id])
            .then((pricingData) => {
                if (pricingData.length === 0) return interaction.reply({
                    content: "This command requires you to have an account. Create an account with the `/register` command.",
                    ephemeral: true
                });

                let tempProduct = product;
                if (tempProduct === "role_cosmetic") tempProduct += "_price";
                const cost = pricingData[0][tempProduct];
                const total = cost * amount;
                if (total > pricingData[0].wallet) {
                    let additionalMessage = "";
                    if (total < pricingData[0].total) additionalMessage = ` I did have look at your Bank account, and turns out you do have enough if you would withdraw some Bits. You have \`${pricingData[0].wallet}\` Bits inside your Wallet, and \`${pricingData[0].bank}\` Bits inside your bank account. If you would like to do this, use the \`/economy withdraw\` command, and transfer atleast \`${total - pricingData[0].wallet}\` Bits.`;
                    return interaction.reply({
                        content: `You do not have enough Bits in your Wallet account (\`${pricingData[0].wallet}\`) to complete this purchase with a total cost of \`${total}\` Bits.${additionalMessage}`,
                        ephemeral: true
                    });
                } else {
                    database.query("UPDATE economy SET wallet = wallet - ? WHERE snowflake = ?;", [total, interaction.user.id])
                        .then(async (data) => {
                            // Validation
                            if (!data.affectedRows) return interaction.reply({
                                content: "This command requires you to have an account. Create an account with the `/register` command.",
                                ephemeral: true
                            });

                            const remaining = pricingData[0].wallet - total;
                            logMessage(`'${interaction.user.username}@${interaction.user.id}' has purchased ${amount} ${product}${amount > 1 ? "'s" : ""} for a total price of ${total} Bits in guild '${interaction.guild?.name}@${interaction.guild?.id}'. Bits remaining: ${remaining}.`, "info");

                            // Experience Increase
                            if (!interaction.guild) return;
                            const targetGuild = findGuildById(interaction.guild.id);
                            let xpReward = tier.purchase;
                            if (targetGuild && targetGuild.xp_increase_purchase) xpReward = targetGuild.xp_increase_purchase;
                            increaseXp(interaction, xpReward);

                            // History
                            const historyResponse = await post(total, product, amount, "Shop Command Purchase", interaction, remaining);
                            if (historyResponse) {
                                return interaction.reply({
                                    content: `All set! Thank you so much for your purchase! Your new Wallet balance is \`${remaining}\` Bits.${product.indexOf("xp") >= 0 ? " Remember that you have to activate XP-Boosters for them to work. You can do this by using the \`/inventory activate\` command." : ""}`,
                                    ephemeral: true
                                });
                            } else return interaction.reply({
                                content: "Something went wrong while updating your shopping history. You have not been charged. Please try again later.",
                                ephemeral: true
                            });
                        }).catch((error: any) => {
                            logError(error);
                            return interaction.reply({
                                content: "Something went wrong while updating your information. You have not been charged. Please try again later.",
                                ephemeral: true
                            });
                        });
                }
            }).catch((error: any) => {
                logError(error);
                return interaction.reply({
                    content: "Something went wrong while retrieving the required information. Please try again later.",
                    ephemeral: true
                })
            });
    } catch (error: any) {
        logError(error);
    }
}

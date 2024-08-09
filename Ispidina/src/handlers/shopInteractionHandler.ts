import { ActionRow, ButtonInteraction, ComponentType, MessageActionRowComponent, ModalSubmitInteraction, StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } from 'discord.js';
import { database } from '../index.js';
import { logError, logMessage } from '../utils/logger.js';
import { increaseXp } from './userIncreaseHandler.js';
import { tier } from '../config.js';
import { post } from './purchaseHistory.js';
import { findGuildById } from '../utils/guild.js';

/**
 * Handle input when user wants uses the Shop command.
 * @param interaction Discord Interaction Object
 */
export async function shopOptions(interaction: StringSelectMenuInteraction) {
    try {
        if (!interaction.guild) return;
        const data: Array<{ role_cosmetic_price: number, xp15: number, xp50: number }> = await database.query("SELECT role_cosmetic_price, xp15, xp50 FROM guild_settings WHERE guild_snowflake = ?", [interaction.guild.id]);
        // Send Purchase Options
        const select: StringSelectMenuBuilder = new StringSelectMenuBuilder()
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

        return await interaction.update({
            content: 'Sure! What would you like to purchase?',
            components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)]
        });
    } catch (error: any) {
        logError(error);
        return await interaction.update({
            content: "Something went wrong while retrieving the required information. Please try again later."
        });
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

    return await interaction.update({
        content: 'Thank you for your selection. Click this button to fill in the quantity.',
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)]
    });
}

/**
 * Show input for quantity.
 * @param interaction Discord Interaction Object
 * @param product The selected product.
 */
export async function modal(interaction: ButtonInteraction, product: string) {
    const modal: ModalBuilder = new ModalBuilder()
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
    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(amountInput);

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
        if (!interaction.message || !interaction.guild) return;

        const actionRow: ActionRow<MessageActionRowComponent> = interaction.message.components[0];
        const button: MessageActionRowComponent = actionRow.components[0];
        const label: string | null = button.type === ComponentType.Button ? button.label : null;
        if (!label) return;
        const product = label.split(" ")[1];
        if (isNaN(amount)) return await interaction.editReply({ content: 'The amount of items you would like to buy should be a number. Please try again.' });
        if (amount < 1) return await interaction.editReply({ content: 'You must buy atleast one item. Please try again.' });

        const pricingData: Array<{ xp15: number, xp50: number, role_cosmetic_price: number, wallet: number, bank: number, total: number }> = await database.query("SELECT xp15, xp50, role_cosmetic_price, wallet, bank, (wallet + bank) AS total FROM guild_settings LEFT JOIN economy ON 1 = 1 WHERE guild_settings.guild_snowflake = ? AND economy.snowflake = ?;", [interaction.guild.id, interaction.user.id])
        if (pricingData.length === 0) return await interaction.reply({
            content: "This command requires you to have an account. Create an account with the `/register` command.",
            ephemeral: true
        });

        let tempProduct: string = product;
        if (tempProduct === "role_cosmetic") tempProduct += "_price";
        const cost: number = pricingData[0][tempProduct as "xp15" || "xp50" || "role_cosmetic_price"];
        const total: number = cost * amount;
        if (total > pricingData[0].wallet) {
            let additionalMessage = "";
            if (total < pricingData[0].total) additionalMessage = ` I did have look at your Bank account, and turns out you do have enough if you would withdraw some Bits. You have \`${pricingData[0].wallet}\` Bits inside your Wallet, and \`${pricingData[0].bank}\` Bits inside your bank account. If you would like to do this, use the \`/economy withdraw\` command, and transfer atleast \`${total - pricingData[0].wallet}\` Bits.`;
            return await interaction.reply({
                content: `You do not have enough Bits in your Wallet account (\`${pricingData[0].wallet}\`) to complete this purchase with a total cost of \`${total}\` Bits.${additionalMessage}`,
                ephemeral: true
            });
        } else {
            try {
                const data: { affectedRows: number } = await database.query("UPDATE economy SET wallet = wallet - ? WHERE snowflake = ?;", [total, interaction.user.id]);
                // Validation
                if (!data.affectedRows) return await interaction.reply({
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
                    return await interaction.reply({
                        content: `All set! Thank you so much for your purchase! Your new Wallet balance is \`${remaining}\` Bits.${product.indexOf("xp") >= 0 ? " Remember that you have to activate XP-Boosters for them to work. You can do this by using the \`/inventory activate\` command." : ""}`,
                        ephemeral: true
                    });
                } else return await interaction.reply({
                    content: "Something went wrong while updating your shopping history. You have not been charged. Please try again later.",
                    ephemeral: true
                });
            } catch (error: any) {
                logError(error);
                return await interaction.reply({
                    content: "Something went wrong while updating your information. You have not been charged. Please try again later.",
                    ephemeral: true
                });
            }
        }
    } catch (error: any) {
        logError(error);
        return await interaction.reply({
            content: "Something went wrong while retrieving the required information. Please try again later.",
            ephemeral: true
        });
    }
}

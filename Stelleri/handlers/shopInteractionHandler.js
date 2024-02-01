const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder } = require('discord.js');
const modules = require('..');
const logger = require('../utils/logger.js');
const userIncreaseHandler = require('./userIncreaseHandler.js');
const config = require('../assets/config.js');
const purschaseHistory = require('./purschaseHistory.js');

/**
 * Handle input when user wants uses the Shop command.
 * @param {object} interaction Discord Interaction Object
 */
async function shopOptions(interaction) {
    try {
        modules.database.query("SELECT * FROM guild_settings WHERE snowflake = ?", [interaction.guild.id])
            .then(async (data) => {
                // Send Purschase Options
                const select = new StringSelectMenuBuilder()
                    .setCustomId('shopBuyMenu')
                    .setPlaceholder('Make a selection.')
                    .addOptions(new StringSelectMenuOptionBuilder()
                        .setLabel('Role Color')
                        .setDescription(`Give your name a custom color. One change. Cost: ${data[0].role_color} Bits`)
                        .setValue('role_color'))
                    .addOptions(new StringSelectMenuOptionBuilder()
                        .setLabel('XP-Boost 15% 24H')
                        .setDescription(`Temporary XP-boost on all gained Experience. Cost: ${data[0].xp15} Bits`)
                        .setValue('xp15'))
                    .addOptions(new StringSelectMenuOptionBuilder()
                        .setLabel('XP-Boost 50% 24H')
                        .setDescription(`Temporary XP-boost on all gained Experience. Cost: ${data[0].xp50} Bits`)
                        .setValue('xp50'));

                await interaction.update({
                    content: 'Sure! What would you like to purschase?',
                    components: [new ActionRowBuilder().addComponents(select)],
                    ephemeral: true
                });
            }).catch(() => {
                return interaction.update({
                    content: "Something went wrong while retrieving the required information. Please try again later.",
                    ephemeral: true
                });
            });
    } catch (error) {
        console.error(error);
    }
}

/**
 * Handle input when user wants to buy something.
 * @param {object} interaction Discord Interaction Object
 * @param {string} purschaseOption The selected product.
 */
async function purschaseOptions(interaction, purschaseOption) {
    // Buy Amount
    const button = new ButtonBuilder()
        .setCustomId('openShopBuyModal')
        .setLabel(`Buy ${purschaseOption}`)
        .setStyle('Success');

    await interaction.update({
        content: 'Thank you for your selection. Click this button to fill in the quantity.',
        components: [new ActionRowBuilder().addComponents(button)],
        ephemeral: true
    });
}

/**
 * Show input for quantity.
 * @param {object} interaction Discord Interaction Object
 * @param {string} product The selected product.
 */
async function modal(interaction, product) {
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
 * @param {object} interaction Discord Interaction Object
 */
async function modalInputHandler(interaction) {
    try {
        let amount = interaction.fields.getTextInputValue('shopModalAmount');
        const product = interaction.message.components[0].components[0].label.split(" ")[1];
        if (isNaN(amount)) return interaction.update({ content: 'The amount of items you would like to buy should be a number. Please try again.', ephemeral: true });
        amount = parseInt(amount);
        if (amount === 0) return interaction.update({ content: 'You must atleast buy one item. Please try again.', ephemeral: true });

        modules.database.query("SELECT xp15, xp50, role_color, wallet, bank, (wallet + bank) as total FROM guild_settings LEFT JOIN economy ON 1 = 1 WHERE guild_settings.snowflake = ? AND economy.snowflake = ?;", [interaction.guild.id, interaction.user.id])
            .then((data) => {
                if (data.length === 0) return interaction.reply({
                    content: "This command requires you to have an account. Create an account with the `/register` command.",
                    ephemeral: true
                });

                const cost = data[0][product];
                const total = cost * amount;
                if (total > data[0].wallet) {
                    let additionalMessage = "";
                    if (total < data[0].total) additionalMessage = ` I did have look at your Bank account, and turns out you do have enough if you would withdraw some Bits. You have \`${data[0].wallet}\` Bits inside your Wallet, and \`${data[0].bank}\` Bits inside your bank account. If you would like to do this, use the \`/economy withdraw\` command, and transfer atleast \`${total - data[0].wallet}\` Bits.`;
                    return interaction.reply({
                        content: `You do not have enough Bits in your Wallet account (\`${data[0].wallet}\`) to complete this purschase with a total cost of \`${total}\` Bits.${additionalMessage}`,
                        ephemeral: true
                    });
                } else {
                    modules.database.query("UPDATE economy SET wallet = wallet - ? WHERE snowflake = ?;", [total, interaction.user.id])
                        .then(async (data) => {
                            // Validation
                            if (!data.affectedRows) return interaction.reply({
                                content: "This command requires you to have an account. Create an account with the `/register` command.",
                                ephemeral: true
                            });

                            const remaining = data[0].wallet - total;
                            logger.log(`'${interaction.user.username}@${interaction.user.id}' has purschased ${amount} ${product}${amount > 1 ? "'s" : ""} for a total price of ${total} Bits in guild '${interaction.guild.name}@${interaction.guild.id}'. Bits remaining: ${remaining}.`, "info");
                            
                            // Experience Increase
                            const targetGuild = guildUtils.findGuildById(interaction.guild.id);
                            let xpReward = config.tier.purschase;
                            if (targetGuild && targetGuild.xp_increase_purschase) xpReward = targetGuild.xp_increase_purschase;
                            userIncreaseHandler.increaseXp(interaction.user.id, interaction.user.username, xpReward, interaction.channelId, interaction.client, interaction.user, interaction.guild.id);

                            // History
                            const historyResponse = await purschaseHistory.post(total, product, amount, "Shop Command Purschase", interaction, remaining, interaction.guild.id);
                            if (historyResponse) {
                                interaction.reply({
                                    content: `All set! Thank you so much for your purschase! Your new Wallet balance is \`${remaining}\` Bits.${product.indexOf("xp") >= 0 ? " Remember that you have to activate XP-Boosters for them to work. You can do this by using the \`/inventory activate\` command." : ""}`,
                                    ephemeral: true
                                });
                            } else interaction.reply({
                                content: "Something went wrong while updating your information. You have not been charged. Please try again later.",
                                ephemeral: true
                            });
                        }).catch(() => {
                            return interaction.reply({
                                content: "Something went wrong while updating your information. You have not been charged. Please try again later.",
                                ephemeral: true
                            });
                        });
                }
            }).catch((error) => {
                console.error(error);
                return interaction.reply({
                    content: "Something went wrong while retrieving the required information. Please try again later.",
                    ephemeral: true
                })
            });
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    "shopOptions": shopOptions,
    "purschaseOptions": purschaseOptions,
    "modalInputHandler": modalInputHandler,
    "modal": modal
}

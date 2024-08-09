import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { cooldowns, general } from '../config.js';
import { database } from '../index.js';
import { create } from '../utils/embed.js';
import { logError } from '../utils/logger.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('economy')
        .setNameLocalizations({
            nl: "economie"
        })
        .setDescription('Controls for the economy system. View balance, withdraw and deposit.')
        .setDescriptionLocalizations({
            nl: "Bediening voor het economy systeem. Bekijk saldo, opnemen en inleggen."
        })
        .setDMPermission(true)
        .addSubcommand(option => option
            .setName('withdraw')
            .setNameLocalizations({
                nl: "opnemen"
            })
            .setDescription("Withdraw Bits from your Bank to your Wallet account.")
            .setDescriptionLocalizations({
                nl: "Bits opnemen van uw spaarrekening naar uw betaalrekening."
            })
            .addIntegerOption(option => option
                .setName('amount')
                .setNameLocalizations({
                    nl: "hoeveelheid"
                })
                .setDescription("Amount to withdraw. You must have enough Bits to do this.")
                .setDescriptionLocalizations({
                    nl: "De hoeveelheid om op te nemen. U moet genoeg Bits hebben op uw spaarrekening."
                })
                .setRequired(true)
                .setMinValue(1)))
        .addSubcommand(option => option
            .setName('deposit')
            .setNameLocalizations({
                nl: "inleggen"
            })
            .setDescription("Deposit Bits from your wallet to your bank account.")
            .setDescriptionLocalizations({
                nl: "Bits inleggen van uw betaalrekening naar uw spaarrekening."
            })
            .addIntegerOption(option => option
                .setName('amount')
                .setNameLocalizations({
                    nl: "hoeveelheid"
                })
                .setDescription("Amount to deposit. You must have enough Bits to do this.")
                .setDescriptionLocalizations({
                    nl: "De hoeveelheid om in te leggen. U moet genoeg Bits hebben op uw betaalrekening."
                })
                .setRequired(true)
                .setMinValue(100)))
        .addSubcommand(option => option
            .setName('balance')
            .setNameLocalizations({
                nl: "saldo"
            })
            .setDescription("Check your current balance.")
            .setDescriptionLocalizations({
                nl: "Bekijk uw saldo."
            })),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const snowflake: string = interaction.user.id;
            const amount: number = interaction.options.getInteger("amount") as number;
            const actionType: string = interaction.options.getSubcommand();
            const userData = await database.query("SELECT wallet, bank FROM economy WHERE snowflake = ?;", [snowflake]);
            if (userData.length === 0) return await interaction.reply({
                content: "This command requires you to have an account. Create an account with the `/register` command.",
                ephemeral: true
            });

            if (actionType === "withdraw") {
                try {
                    if (amount > userData[0].bank) return await interaction.reply({
                        content: `You do not have enough Bits to perform this command. You have \`${userData[0].bank}\` Bits saved inside your Bank account, but you tried to withdraw \`${amount}\` Bits.`,
                        ephemeral: true
                    });
                    await database.query("UPDATE economy SET wallet = wallet + ?, bank = bank - ? WHERE snowflake = ?; INSERT INTO purchase (snowflake, balance_change, product, quantity, type, remaining_bits, method, guild_snowflake) VALUES (?, ?, 'withdraw', 1, 'Economy Command Withdraw', ?, ?, ?);",
                        [amount, amount, snowflake, snowflake, amount, userData[0].wallet + amount, `${general.name} Discord Bot`, interaction.guild ? interaction.guild.id : "DM_COMMAND"]);
                    return await interaction.reply({
                        content: `Successfully withdrew \`${amount}\` Bits.`,
                        ephemeral: true
                    });
                } catch (error: any) {
                    logError(error);
                    return await interaction.reply({
                        content: "Something went wrong while updating your information. Please try again later.",
                        ephemeral: true
                    });
                }
            } else if (actionType === "deposit") {
                try {
                    if (amount > userData[0].wallet) return await interaction.reply({
                        content: `You do not have enough Bits to perform this command. You have \`${userData[0].wallet}\` Bits saved inside your Wallet account, but you tried to withdraw \`${amount}\` Bits.`,
                        ephemeral: true
                    });
                    await database.query("UPDATE economy SET wallet = wallet - ?, bank = bank + ? WHERE snowflake = ?; INSERT INTO purchase (snowflake, balance_change, product, quantity, type, remaining_bits, method, guild_snowflake) VALUES (?, ?, 'deposit', 1, 'Economy Command Deposit', ?, ?, ?);",
                        [amount, amount, snowflake, snowflake, -1 * amount, userData[0].wallet - amount, `${general.name} Discord Bot`, interaction.guild ? interaction.guild.id : "DM_COMMAND"])
                    return await interaction.reply({
                        content: `Successfully deposited \`${amount}\` Bits.`,
                        ephemeral: true
                    });
                } catch (error: any) {
                    logError(error);
                    return await interaction.reply({
                        content: "Something went wrong while trying to update your information. Please try again later.",
                        ephemeral: true
                    });
                }
            } else if (actionType === "balance") {
                try {
                    const data: Array<{ wallet: number, bank: number, total: number }> = await database.query("SELECT wallet, bank, (wallet + bank) AS 'total' FROM economy WHERE snowflake = ?;", [snowflake]);
                    if (data.length === 0) return await interaction.reply({
                        content: "This command requires you to have an account. Create an account with the `/register` command.",
                        ephemeral: true
                    });
                    const embed: EmbedBuilder = create("Bits Balance", "Economy Accounts", interaction.user,
                        [
                            { name: 'Wallet', value: `\`${data[0].wallet}\``, inline: false },
                            { name: 'Bank', value: `\`${data[0].bank}\``, inline: false },
                            { name: "-----", value: `Summary`, inline: false },
                            { name: 'Combined', value: `\`${data[0].total}\``, inline: false }
                        ], ["shop"]);
                    return await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error: any) {
                    logError(error);
                    return await interaction.reply({
                        content: "Something went wrong while retrieving the required information. Please try again later.",
                        ephemeral: true
                    });
                }
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const embedConstructor = require('../utils/embed.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('economy')
        .setDescription('Controls for the economy system. View balance, withdraw and deposit.')
        .addSubcommand(option => option
            .setName('withdraw')
            .setDescription("Withdraw Bits from your Bank to your Wallet account.")
            .addIntegerOption(option => option
                .setName('amount')
                .setDescription("Amount to withdraw. You must have enough Bits to do this.")
                .setRequired(true)
                .setMinValue(1)))
        .addSubcommand(option => option
            .setName('deposit')
            .setDescription("Deposit Bits from your wallet to your bank account.")
            .addIntegerOption(option => option
                .setName('amount')
                .setDescription("Amount to deposit. You must have enough Bits to do this.")
                .setRequired(true)
                .setMinValue(100)))
        .addSubcommand(option => option
            .setName('balance')
            .setDescription("Check your current balance.")),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const amount = interaction.options.getInteger('amount');
        const actionType = interaction.options.getSubcommand();

        if (actionType === "withdraw") {
            modules.database.query("UPDATE economy SET wallet = wallet + ?, bank = bank - ? WHERE snowflake = ?;", [amount, amount, snowflake])
                .then(() => {
                    interaction.reply(`Successfully withdrew \`${amount}\` Bits.`);
                }).catch(() => {
                    return interaction.reply({
                        content: "You do not have an account yet. Create an account with the `/register` command.",
                        ephemeral: true
                    });
                });
        } else if (actionType === "deposit") {
            modules.database.query("UPDATE economy SET wallet = wallet - ?, bank = bank + ? WHERE snowflake = ?;", [amount, amount, snowflake])
                .then(() => {
                    interaction.reply(`Successfully deposited \`${amount}\` Bits.`);
                }).catch(() => {
                    return interaction.reply({
                        content: "You do not have an account yet. Create an account with the `/register` command.",
                        ephemeral: true
                    });
                });
        } else if (actionType === "balance") {
            modules.database.query("SELECT wallet, bank, (wallet + bank) AS 'total' FROM economy WHERE snowflake = ?;", [snowflake])
                .then((data) => {
                    const embed = embedConstructor.create("Bits Balance", "Accounts", interaction,
                        [
                            { name: 'Wallet', value: `\`${data[0].wallet}\`` },
                            { name: 'Bank', value: `\`${data[0].bank}\`` },
                            { name: '-----', value: `Summary` },
                            { name: 'Combined', value: `\`${data[0].total}\`` }
                        ]);
                    interaction.reply({ embeds: [embed] });
                }).catch(() => {
                    return interaction.reply({
                        content: "You do not have an account yet. Create an account with the `/register` command.",
                        ephemeral: true
                    });
                });
        }
    }
};
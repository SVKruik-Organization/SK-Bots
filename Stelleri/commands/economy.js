const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const { EmbedBuilder } = require('discord.js');
const modules = require('..');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('economy')
        .setDescription('Controls for the economy system. View balance, withdraw etc.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choose what you want to do.')
                .setRequired(true)
                .addChoices(
                    { name: 'Withdraw from Bank', value: 'withdraw' },
                    { name: 'Deposit to Bank', value: 'deposit' },
                    { name: 'View Balance', value: 'balance' }
                ))
        .addIntegerOption(option => option.setName('amount').setDescription("Amount to withdraw/deposit, if you have selected that option.").setRequired(false).setMinValue(1)),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const actionType = interaction.options.getString('action');
        const amount = interaction.options.getInteger('amount');

        if (actionType == "withdraw" && amount != null) {
            modules.database.query("UPDATE economy SET wallet = wallet + ?, bank = bank - ? WHERE snowflake = ?;", [amount, amount, snowflake])
                .then(() => {
                    interaction.reply(`Succesfully withdrew \`${amount}\` Bits.`);
                }).catch(() => {
                    return interaction.reply({ content: "You do not have an account yet. Create an account with the `/register` command.", ephemeral: true });
                });
        } else if (actionType == "deposit" && amount != null) {
            modules.database.query("UPDATE economy SET wallet = wallet - ?, bank = bank + ? WHERE snowflake = ?;", [amount, amount, snowflake])
                .then(() => {
                    interaction.reply(`Succesfully deposited \`${amount}\` Bits.`);
                }).catch(() => {
                    return interaction.reply({ content: "You do not have an account yet. Create an account with the `/register` command.", ephemeral: true });
                });
        } else if (actionType == "balance") {
            modules.database.query("SELECT wallet, bank, (wallet + bank) AS 'total' FROM economy WHERE snowflake = ?;", [snowflake])
                .then((data) => {
                    const name = interaction.user.username;
                    const pfp = interaction.user.avatarURL();
                    const embed = new EmbedBuilder()
                        .setColor(config.general.color)
                        .setTitle(`Bits Balance`)
                        .setAuthor({ name: name, iconURL: pfp })
                        .addFields({ name: '----', value: 'Accounts' })
                        .addFields(
                            { name: 'Wallet', value: `\`${data[0].wallet}\`` },
                            { name: 'Bank', value: `\`${data[0].bank}\`` },
                            { name: '-----', value: `Total Amount` },
                            { name: 'Both', value: `\`${data[0].total}\`` }
                        )
                        .addFields({ name: '----', value: 'Meta' })
                        .setTimestamp()
                        .setFooter({ text: `Embed created by ${config.general.name}` });
                    interaction.reply({ embeds: [embed] });
                }).catch(() => {
                    return interaction.reply({ content: "You do not have an account yet. Create an account with the `/register` command.", ephemeral: true });
                });
        } else {
            interaction.reply({ content: "You need to give the amount to withdraw or deposit.", ephemeral: true });
        };
    }
};
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('modify')
        .setDescription('Modify database data. For example, XP and coins.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option
            .setName('target')
            .setDescription('The target member.')
            .setRequired(true))
        .addStringOption(option => option
            .setName('section')
            .setDescription('Choose whether you want to change their tier or economy.')
            .setRequired(true)
            .addChoices(
                { name: 'Tier - Level', value: 'rnk-lvl' },
                { name: 'Tier - XP', value: 'rnk-xp' },
                { name: 'Economy - Wallet', value: 'eco-wal' },
                { name: 'Economy - Bank', value: 'eco-bnk' }))
        .addStringOption(option => option
            .setName('action')
            .setDescription('Choose what type of edit you want to make.')
            .setRequired(true)
            .addChoices(
                { name: 'Set', value: 'set' },
                { name: 'Increase', value: 'inc' },
                { name: 'Decrease', value: 'dec' },
                { name: 'Multiply', value: 'mult' },
                { name: 'Divide', value: 'div' }))
        .addIntegerOption(option => option
            .setName('amount')
            .setDescription("The amount for the chosen action.")
            .setRequired(true)
            .setMinValue(0)),
    async execute(interaction) {
        try {
            const sectionType = interaction.options.getString('section');
            const actionType = interaction.options.getString('action');
            const amount = interaction.options.getInteger('amount');
            const targetSnowflake = interaction.options.getUser('target').id;

            let table = undefined;
            let row = undefined;
            let action = undefined;
            let where = ` WHERE snowflake = ${targetSnowflake}`;

            if (sectionType === "rnk-lvl") {
                table = "`tier` SET level = ";
                row = "`level`";
            } else if (sectionType === "rnk-xp") {
                table = "`tier` SET xp =";
                row = "`xp`";
            } else if (sectionType === "eco-wal") {
                table = "`economy` SET wallet =";
                row = "`wallet`";
            } else if (sectionType === "eco-bnk") {
                table = "`economy` SET bank =";
                row = "`bank`";
            }

            if (actionType === "set") {
                action = ` ${amount}`;
            } else if (actionType === "inc") {
                action = ` ${row} + ${amount}`;
            } else if (actionType === "dec") {
                action = ` ${row} - ${amount}`;
            } else if (actionType === "mult") {
                action = ` ${row} * ${amount}`;
            } else if (actionType === "div") {
                action = ` ${row} / ${amount}`;
            }

            modules.database.query(`UPDATE ${table}${action}${where}`)
                .then(() => {
                    interaction.reply({ content: "Account data has been successfully changed.", ephemeral: true });
                }).catch(() => {
                    return interaction.reply({ content: "This user doesn't have an account yet.", ephemeral: true });
                });
        } catch (error) {
            console.error(error);
        }
    }
};
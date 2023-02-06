const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modify')
        .setDescription('Modify database data. For example, XP and coins.')
        .addUserOption(option => option.setName('target').setDescription('The account you want to change.').setRequired(true))
        .addStringOption(option =>
            option.setName('section')
                .setDescription('Choose wheter you want to change their tier or economy.')
                .setRequired(true)
                .addChoices(
                    { name: 'Tier - Level', value: 'rnk-lvl' },
                    { name: 'Tier - XP', value: 'rnk-xp' },
                    { name: 'Economy - Wallet', value: 'eco-wal' },
                    { name: 'Economy - Bank', value: 'eco-bnk' }
                ))
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choose what type of edit you want to make.')
                .setRequired(true)
                .addChoices(
                    { name: 'Set', value: 'set' },
                    { name: 'Increase', value: 'inc' },
                    { name: 'Decrease', value: 'dec' },
                    { name: 'Multiply', value: 'mult' },
                    { name: 'Divide', value: 'div' }
                ))
        .addIntegerOption(option => option.setName('amount').setDescription("The amount for the chosen action.").setRequired(true).setMinValue(1))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const modules = require('..');
        const sectionType = interaction.options.getString('section');
        const actionType = interaction.options.getString('action');
        const amount = interaction.options.getInteger('amount');
        const targetSnowflake = interaction.options.getUser('target');
        const snowflake = interaction.user.id;

        let userId = undefined;
        await modules.database.promise()
            .execute(`SELECT id FROM user WHERE snowflake = ${targetSnowflake.id};`)
            .then(async ([data]) => {
                userId = data[0].id
            }).catch(err => {
                return console.log(`\t${targetSnowflake.username} doesn't have an account.\n`);
            });

        let table = undefined;
        let row = undefined;
        let action = undefined;

        if (sectionType == "rnk-lvl") {
            table = "`tier` SET level = "
            row = "`level`";
        } else if (sectionType == "rnk-xp") {
            table = "`tier` SET xp ="
            row = "`xp`";
        } else if (sectionType == "eco-wal") {
            table = "`economy` SET wallet ="
            row = "`wallet`";
        } else if (sectionType == "eco-bnk") {
            table = "`economy` SET bank ="
            row = "`bank`";
        };

        if (actionType == "set") {
            action = `${amount}`;
        } else if (actionType == "inc") {
            action = `${row} + ${amount}`;
        } else if (actionType == "dec") {
            action = `${row} - ${amount}`;
        } else if (actionType == "mult") {
            action = `${row} * ${amount}`;
        } else if (actionType == "div") {
            action = `${row} / ${amount}`;
        };

        if (userId == undefined) {
            return interaction.reply("This user doesn't have an account yet.");
        } else {
            modules.database.promise()
                .execute(`UPDATE ${table}${action} WHERE user_id = ${userId};`)
                .then(async () => {
                    await interaction.reply("Account data has been succesfully changed.");
                }).catch(err => {
                    return interaction.reply("This user doesn't have an account yet.");
                });
        };

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(err => {
                return console.log("Command usage increase unsuccessful, user does not have an account yet.");
            });
    },
};
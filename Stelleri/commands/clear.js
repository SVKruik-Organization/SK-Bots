const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require("fs");
const modules = require('..');
const dateInfo = modules.getDate();
const date = dateInfo.date;
const time = dateInfo.time;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Bulk delete messages.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option => option.setName('amount').setDescription('Amount of messages to delete.').setRequired(true).setMinValue(1).setMaxValue(100)),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const amount = interaction.options.getInteger('amount');

        await interaction.reply("Deleting `" + amount + "` messages . . .");
        setTimeout(async () => {
            await interaction.channel.bulkDelete(amount + 1);
        }, 1000);

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(() => {
                const data = `${time} [WARNING] Command usage increase unsuccessful, ${username} does not have an account yet.\n`;
                console.log(data);
                fs.appendFile(`./logs/${date}.log`, data, (err) => {
                    if (err) console.log(`${time} [ERROR] Error appending to log file.`);
                });
                return;
            });
    },
};
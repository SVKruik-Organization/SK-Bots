const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn someone that breakes the rules.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option.setName('target').setDescription('The person you want to warn.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the warning.').setRequired(false)),
    async execute(interaction) {
        const database = require("..");
        const targetRawA = interaction.options.getUser('target');
        const targetRawB = `${targetRawA}`.replace('<@', '');
        const target = `${targetRawB}`.replace('>', '');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        database.promise()
            .execute(`UPDATE user SET warnings = (warnings + 1) WHERE snowflake = '${target}'`)
            .then(async () => {
                await interaction.reply(`User ${targetRawA} has been warned for: ` + "`" + reason + "`.");
            }).catch(async err => {
                console.log(err)
                await interaction.reply('Something went wrong while warning this user.');
            });
    },
};
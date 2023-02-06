const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn someone that breakes the rules. Administrator version of report.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option.setName('target').setDescription('The person you want to warn.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the warning.').setRequired(false).setMaxLength(1000)),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const targetSnowflake = interaction.options.getUser('target').id;
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        let userId = undefined;

        await modules.database.promise()
            .execute(`UPDATE user SET warnings = (warnings + 1) WHERE snowflake = '${targetSnowflake}';`)
            .then(async () => {
                await interaction.reply(`User <@${targetSnowflake};> has been warned for: ` + "`" + reason + "`.");
            }).catch(async err => {
                console.log(err)
                await interaction.reply("Something went wrong while warning this user.");
            });

        await modules.database.promise()
            .execute(`SELECT id FROM user WHERE snowflake = '${targetSnowflake}';`)
            .then(async ([data]) => {
                userId = data[0].id;
            }).catch(async err => {
                console.log(err)
                await interaction.reply("Something went wrong while warning this user.");
            });

        await modules.database.promise()
            .execute(`INSERT INTO warning (user_id_receiver, reason, date) VALUES (${userId}, '${reason}', CURDATE())`)
            .catch(async err => {
                console.log(err)
                await interaction.reply("Something went wrong while warning this user.");
            });

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(err => {
                return console.log("Command usage increase unsuccessful, user does not have an account yet.");
            });
    },
};
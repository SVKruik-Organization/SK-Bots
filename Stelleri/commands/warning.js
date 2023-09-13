const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modules = require('..');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn someone that breakes the rules. Administrator version of report.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => option.setName('target').setDescription('The person you want to warn.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the warning.').setRequired(false).setMaxLength(1000)),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const targetName = interaction.options.getUser('target').username
        const targetSnowflake = interaction.options.getUser('target').id;
        let reason = interaction.options.getString('reason') ?? 'No reason provided';
        let userId;

        await interaction.reply(`User <@${targetSnowflake}> has been warned for: \`${reason}\``);

        await modules.database.promise()
            .execute(`SELECT id FROM user WHERE snowflake = '${targetSnowflake}';`)
            .then(async ([data]) => {
                if (!data[0]) {
                    return await interaction.followUp({ content: "This user does not have an account yet. I stored the reason in the database using my own ID.", ephemeral: true });
                };
                userId = data[0].id;
            }).catch(async () => {
                await interaction.followUp({ content: "Something went wrong while warning this user. Please try again later.", ephemeral: true });
            });

        if (!userId) {
            userId = 0;
            reason = `${targetName} - ${reason}`;
        };

        await modules.database.promise()
            .execute(`INSERT INTO warning (user_id_receiver, reason, date) VALUES (${userId}, '${reason}', CURRENT_TIMESTAMP())`)
            .catch(async () => {
                await interaction.followUp({ content: "Something went wrong while warning this user. Please try again later.", ephemeral: true });
            });

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(() => {
                return modules.log(`Command usage increase unsuccessful, ${username} does not have an account yet.`, "warning");
            });
    },
};
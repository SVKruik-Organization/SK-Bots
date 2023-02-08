const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tier')
        .setDescription('Information about your tier progression. View level, experience etc.'),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;

        let userId = undefined;
        await modules.database.promise()
            .execute(`SELECT id FROM user WHERE snowflake = ${snowflake};`)
            .then(async ([data]) => {
                userId = data[0].id
            }).catch(err => {
                return console.log(`[INFO] ${targetSnowflake.username} doesn't have an account.\n`);
            });

        modules.database.promise()
            .execute(`SELECT level, xp FROM tier WHERE user_id = '${userId}';`)
            .then(async ([data]) => {
                const name = interaction.user.username;
                const pfp = interaction.user.avatarURL();
                const embed = new EmbedBuilder()
                    .setColor(config.general.color)
                    .setTitle(`Bits Balance`)
                    .setAuthor({ name: name, iconURL: pfp })
                    .addFields({ name: '----', value: 'List' })
                    .addFields(
                        { name: 'Level', value: `\`${data[0].level}\`` },
                        { name: 'EXP', value: `\`${data[0].xp}\`` },
                        { name: '-----', value: `Summary` },
                        { name: 'EXP Left', value: `WIP` }
                    )
                    .addFields({ name: '----', value: 'Meta' })
                    .setTimestamp()
                    .setFooter({ text: 'Embed created by Stelleri' });
                await interaction.reply({ embeds: [embed] });
            }).catch(err => {
                console.log(err)
                return interaction.reply("You do not have an account yet. Create an account with the `/register` command.");
            });

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(err => {
                return console.log("[WARNING] Command usage increase unsuccessful, user does not have an account yet.\n");
            });
    },
};
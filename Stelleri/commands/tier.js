const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const { EmbedBuilder } = require('discord.js');
const fs = require("fs");
const modules = require('..');
const dateInfo = modules.getDate();
const date = dateInfo.date;
const time = dateInfo.time;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tier')
        .setDescription('Information about your tier progression. View level, experience etc.'),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const username = interaction.user.username;

        let userId = undefined;
        await modules.database.promise()
            .execute(`SELECT id FROM user WHERE snowflake = ${snowflake};`)
            .then(async ([data]) => {
                userId = data[0].id
            }).catch(() => {
                return interaction.reply({ content: "This command requires you to have an account. Create an account with the `/register` command.", ephemeral: true });
            });

        if (userId == undefined) return;

        modules.database.promise()
            .execute(`SELECT level, xp FROM tier WHERE user_id = '${userId}';`)
            .then(async ([data]) => {
                const pfp = interaction.user.avatarURL();
                const embed = new EmbedBuilder()
                    .setColor(config.general.color)
                    .setTitle(`Bits Balance`)
                    .setAuthor({ name: username, iconURL: pfp })
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
            }).catch(() => {
                return interaction.reply({ content: "You do not have an account yet. Create an account with the `/register` command.", ephemeral: true });
            });

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
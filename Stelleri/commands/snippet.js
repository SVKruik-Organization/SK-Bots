const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const prettier = require("prettier");
const fs = require("fs");
const modules = require('..');
const dateInfo = modules.getDate();
const date = dateInfo.date;
const time = dateInfo.time;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snippet')
        .setDescription('Format a piece of code.')
        .addStringOption(option =>
            option.setName('language')
                .setDescription('Choose what you want to do with your pincode.')
                .setRequired(true)
                .addChoices(
                    { name: 'HTML', value: 'html' },
                    { name: 'CSS', value: 'css' },
                    { name: 'JavaScript', value: 'js' },
                    { name: 'TypeScript', value: 'ts' },
                    { name: 'JSON', value: 'json' },
                    { name: 'XML', value: 'xml' },
                    { name: 'Python', value: 'py' },
                    { name: 'YML', value: 'yml' }
                ))
        .addStringOption(option => option.setName('code').setDescription('The code you want to format.').setRequired(true))
        .addStringOption(option => option.setName('title').setDescription('An optional title for your code. For example: JS for-loop.').setRequired(false)),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const channel = modules.client.channels.cache.get(config.general.snippetChannel);
        const language = interaction.options.getString('language');
        const code = interaction.options.getString('code');
        let title = interaction.options.getString('title');
        if (title == undefined) {
            title = " - Unnamed Snippet";
        };

        /**
         * Format a code snippet with the Prettier API.
         * @param {string} code The code to be formatted.
         * @returns THe formatted code.
         */
        async function formatCode(code) {
            return prettier.format(code, { semi: false, parser: 'babel' });
        };
        const formattedCode = await formatCode(code);

        channel.send({ content: `${username}${title}\n\n\`\`\`${language}\n${formattedCode}\n\`\`\`` });
        await interaction.reply({ content: `Message created. Check your codesnippet here: <#${config.general.snippetChannel}>.`, ephemeral: true });

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
const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const prettier = require("prettier");
const { ModelOperations } = require('@vscode/vscode-languagedetection');

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
        const name = interaction.user.username;
        const channel = modules.client.channels.cache.get(config.general.snippetChannel);
        const language = interaction.options.getString('language');
        const code = interaction.options.getString('code');
        let title = interaction.options.getString('title');
        if (title == undefined) {
            title = " - Unnamed Snippet";
        };

        async function formatCode(code) {
            return prettier.format(code, { semi: false, parser: 'babel' });
        };
        const formattedCode = await formatCode(code);

        channel.send({ content: `${name}${title}\n\n\`\`\`${language}\n${formattedCode}\n\`\`\`` });
        await interaction.reply({ content: `Message created. Check your codesnippet here: <#${config.general.snippetChannel}>.`, ephemeral: true });

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(err => {
                return console.log("[WARNING] Command usage increase unsuccessful, user does not have an account yet.\n");
            });
    },
};
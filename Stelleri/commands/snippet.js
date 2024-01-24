const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const prettier = require('prettier');
const modules = require('../index.js');

module.exports = {
    cooldown: config.cooldowns.B,
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
                    { name: 'JavaScript', value: 'javascript' },
                    { name: 'TypeScript', value: 'typescript' },
                    { name: 'JSON', value: 'json' },
                    { name: 'Vue', value: 'vue' },
                    { name: 'Markdown', value: 'markdown' }
                ))
        .addStringOption(option => option.setName('code').setDescription('The code you want to format. You can just copy and paste it without any modification.').setRequired(true))
        .addStringOption(option => option.setName('title').setDescription('An optional title for your code. For example: JS for-loop.').setRequired(false)),
    async execute(interaction) {
        const targetGuild = modules.findGuildById(interaction.guild.id);
        if (!targetGuild || !targetGuild.channel_suggestion) return interaction.reply({
            content: "This is a server-specific command, and this server is not configured to support it. Please try again later.",
            ephemeral: true
        });
        const channel = targetGuild.channel_snippet;
        const snowflake = interaction.user.id;
        const language = interaction.options.getString('language');
        let code = interaction.options.getString('code');
        let title = interaction.options.getString('title');
        if (title === undefined || title === null) title = "- Unnamed Snippet";

        try {
            if (language === "javascript") {
                code = prettier.format(code, { semi: false, parser: 'babel' });
            } else code = prettier.format(code, { semi: false, parser: language });
        } catch (error) {
            return interaction.reply({
                content: "Something went wrong while parsing your code. Check for syntax errors, and try again.",
                ephemeral: true
            });
        }

        channel.send({ content: `<@${snowflake}> ${title}\n\n\`\`\`${language}\n${code}\n\`\`\`` });
        interaction.reply({
            content: `Message created. Check your code-snippet here: <#${channel.id}>.`,
            ephemeral: true
        });
    }
};
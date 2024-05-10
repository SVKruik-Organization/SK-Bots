const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const prettier = require('prettier');
const guildUtils = require('../utils/guild.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('snippet')
        .setNameLocalizations({
            nl: "snippet"
        })
        .setDescription('Format a piece of code.')
        .setDescriptionLocalizations({
            nl: "Formatteer een stuk broncode."
        })
        .addStringOption(option => option
            .setName('language')
            .setNameLocalizations({
                nl: "taal"
            })
            .setDescription('The input language to format.')
            .setDescriptionLocalizations({
                nl: "De taal van de code die geformatteerd moet worden."
            })
            .setRequired(true)
            .addChoices(
                { name: 'HTML', value: 'html' },
                { name: 'CSS', value: 'scss' },
                { name: 'JavaScript', value: 'javascript' },
                { name: 'TypeScript', value: 'typescript' },
                { name: 'JSON', value: 'json' },
                { name: 'Vue', value: 'vue' },
                { name: 'SQL', value: 'sql' },
                { name: 'Markdown', value: 'markdown' }))
        .addStringOption(option => option
            .setName('code')
            .setNameLocalizations({
                nl: "broncode"
            })
            .setDescription('The code you want to format. Make sure to remove comments, otherwise it will break.')
            .setDescriptionLocalizations({
                nl: "De broncode die geformatteerd moet worden. U kunt uw broncode zonder modificatie plakken."
            })
            .setMaxLength(2000)
            .setRequired(true))
        .addStringOption(option => option
            .setName('title')
            .setNameLocalizations({
                nl: "titel"
            })
            .setDescription('An title for your snippet. For example: JS for-loop.')
            .setDescriptionLocalizations({
                nl: "Een titel voor uw snippet. Bijvoorbeeld: JS for-loop."
            })
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(50)),
    async execute(interaction) {
        try {
            // Init
            const targetGuild = guildUtils.findGuildById(interaction.guild.id);
            if (!targetGuild || !targetGuild.channel_snippet) return interaction.reply({
                content: "This is a server-specific command, and this server is either not configured to support it or is disabled. Please try again later.",
                ephemeral: true
            });

            // Setup
            const channel = targetGuild.channel_snippet;
            const snowflake = interaction.user.id;
            const language = interaction.options.getString('language');
            let code = interaction.options.getString('code');
            let title = interaction.options.getString('title');
            if (title === undefined || title === null) title = "- Unnamed Snippet";

            try {
                if (language === "javascript") {
                    code = await prettier.format(code, { semi: false, parser: 'babel' });
                } else if (language === "sql") {
                    code = await prettier.format(code, { parser: "sql", plugins: ["prettier-plugin-sql"] })
                } else code = await prettier.format(code, { semi: false, parser: language });
            } catch (error) {
                return interaction.reply({
                    content: "Something went wrong while parsing your code. Check for syntax errors, and try again.",
                    ephemeral: true
                });
            }

            let highlight = language;
            if (language === "scss") {
                highlight = "css";
            } else if (language === "vue") highlight === "html";

            channel.send({ content: `<@${snowflake}> ${title} \`${highlight}\`\n\n\`\`\`${language}\n${code}\n\`\`\`` });
            interaction.reply({
                content: `Message created. Check your code-snippet here: <#${channel.id}>.`,
                ephemeral: true
            });
        } catch (error) {
            logger.error(error);
        }
    }
};
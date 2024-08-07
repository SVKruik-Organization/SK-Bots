const { SlashCommandBuilder } = require('discord.js');
const config = require('../config');
const prettier = require('prettier');
const guildUtils = require('../utils/guild');
const logger = require('../utils/logger');

export default {
    cooldown: cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('snippet')
        .setNameLocalizations({
            nl: "snippet"
        })
        .setDescription('Format a piece of code.')
        .setDescriptionLocalizations({
            nl: "Formatteer een stuk broncode."
        })
        .setDMPermission(false)
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
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Init
            const targetGuild = findGuildById(interaction.guild.id);
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

            let errorStatus = false;
            if (language === "html" && code.includes("<!--")) {
                errorStatus = true;
            } else if (language === "html" && code.includes("<!--")) {
                errorStatus = true;
            } else if (language === "scss" && code.includes("/*")) {
                errorStatus = true;
                errorStatus = true;
            } else if ((language === "javascript" || language === "typescript") && (code.includes("//") || code.includes("/**"))) {
                errorStatus = true;
            } else if (language === "vue" && (code.includes("//") || code.includes("/**") || code.includes("/*") || code.includes("<!--"))) {
                errorStatus = true;
            } else if (language === "sql" && code.includes("--")) errorStatus = true;

            if (errorStatus) return interaction.reply({
                content: `I tried formatting your \`${language}\` code but noticed comments being present. The Prettier formatting API messes up code snippets with inline comments because it cannot see line-breaks.\n\nPlease remove them before sending them. Sorry for this inconvenience. You can also send the code manually with a [Markdown code block](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#code). That's what I do under the hood.`,
                ephemeral: true
            })

            try {
                if (language === "javascript") {
                    code = await prettier.format(code, { semi: false, parser: 'babel' });
                } else if (language === "sql") {
                    code = await prettier.format(code, { parser: "sql", plugins: ["prettier-plugin-sql"] })
                } else code = await prettier.format(code, { semi: false, parser: language });
            } catch (error: any) {
                return interaction.reply({
                    content: "Something went wrong while parsing your code. Check for syntax errors, and try again.",
                    ephemeral: true
                });
            }

            let highlight = language;
            if (language === "scss") {
                highlight = "css";
            } else if (language === "vue") highlight === "html";

            await channel.send({ content: `<@${snowflake}> ${title} \`${highlight}\`\n\n\`\`\`${language}\n${code}\n\`\`\`` });
            return interaction.reply({
                content: `Message created. Check your code-snippet here: <#${channel.id}>.`,
                ephemeral: true
            });
        } catch (error: any) {
            logError(error);
        }
    }
};
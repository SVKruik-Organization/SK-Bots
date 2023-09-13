const { SlashCommandBuilder } = require('discord.js');
const math = require('mathjs');
const modules = require('..');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Evaluate a math expression.')
        .addStringOption(option => option.setName('expression').setDescription('The math expression to be solved. Example: 4 * 4.').setRequired(true)),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const expression = interaction.options.getString('expression');

        try {
            const answer = math.evaluate(expression).toString();
            await interaction.reply(`Expression: \`${expression}\`\n\nResult: \`${answer}\``);
        } catch (err) {
            await interaction.reply({ content: `Invalid expression.`, ephemeral: true });
        };

        modules.commandUsage(snowflake, username);
    },
};
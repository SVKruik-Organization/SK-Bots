const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const math = require('mathjs');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Evaluate a math expression.')
        .addStringOption(option => option
            .setName('expression')
            .setDescription('The math expression to be solved. Example: 4 * 4.')
            .setRequired(true)),
    async execute(interaction) {
        const expression = interaction.options.getString('expression');

        try {
            const answer = math.evaluate(expression).toString();
            const embed = new EmbedBuilder()
                .setColor(config.general.color)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
                .addFields(
                    { name: 'Math Expression', value: `\`${expression}\`` },
                    { name: 'Result', value: `\`${answer}\`` },
                    { name: 'Related Commands', value: "\`/rps\` \`/coin\` \`/fact\`" })
                .setTimestamp()
                .setFooter({ text: `Embed created by ${config.general.name}` })
            interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Invalid expression.`, ephemeral: true });
        }
    }
};
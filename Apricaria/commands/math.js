const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const math = require('mathjs');
const config = require('../config.js');

module.exports = {
    cooldown: config.cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('math')
        .setNameLocalizations({
            nl: "wiskunde"
        })
        .setDescription('Evaluate a math expression.')
        .setDescriptionLocalizations({
            nl: "Los een wiskundige som op."
        })
        .setDMPermission(true)
        .addStringOption(option => option
            .setName('expression')
            .setNameLocalizations({
                nl: "som"
            })
            .setDescription('The math expression to be solved. Example: 4 * 4.')
            .setDescriptionLocalizations({
                nl: "De wiskunde som om op te lossen. Bijvoorbeeld: 4 * 4."
            })
            .setRequired(true)),
    async execute(interaction) {
        try {
            const expression = interaction.options.getString('expression');
            const answer = math.evaluate(expression).toString();
            const embed = new EmbedBuilder()
                .setColor(config.colors.bot)
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
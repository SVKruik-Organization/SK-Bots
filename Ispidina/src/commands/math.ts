import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { cooldowns, colors, general } from '../config.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.B,
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
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const expression: string = interaction.options.getString("expression") as string;
            const { evaluate } = await import('mathjs');
            const answer = evaluate(expression).toString();
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.bot)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() as string })
                .addFields(
                    { name: 'Math Expression', value: `\`${expression}\`` },
                    { name: 'Result', value: `\`${answer}\`` },
                    { name: 'Related Commands', value: "\`/rps\` \`/coin\` \`/fact\`" })
                .setTimestamp()
                .setFooter({ text: `Embed created by ${general.name}` })
            return await interaction.reply({ embeds: [embed] });
        } catch (error: any) {
            return await interaction.reply({ content: `Invalid expression.`, ephemeral: true });
        }
    },
    autocomplete: undefined
} satisfies Command;
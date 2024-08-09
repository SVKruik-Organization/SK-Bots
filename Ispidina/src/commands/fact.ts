import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { cooldowns, colors, general } from '../config.js';
import { EmbedBuilder } from 'discord.js';
import { logError } from '../utils/logger.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('fact')
        .setNameLocalizations({
            nl: "feit"
        })
        .setDescription('Get a random fact.')
        .setDescriptionLocalizations({
            nl: "Krijg een willekeurig feit."
        })
        .setDMPermission(true),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Fetch
            const response: Response = await fetch("https://api.api-ninjas.com/v1/facts", {
                method: "GET",
                headers: {
                    'X-Api-Key': process.env.API_TOKEN as string
                }
            });

            // Validate
            if (!response.ok) {
                return await interaction.reply({
                    content: "Something went wrong while retrieving a fact. Please try again later.",
                    ephemeral: true
                });
            }

            // Response
            const data: string = ((await response.json()) as Array<any>)[0].fact;
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor(colors.bot)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() as string })
                .addFields(
                    { name: 'Random Fact', value: data },
                    { name: 'Related Commands', value: "\`/rps\` \`/coin\` \`/math\` \`/dice\`" })
                .setTimestamp()
                .setFooter({ text: `Embed created by ${general.name}` });
            return await interaction.reply({ embeds: [embed] });
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
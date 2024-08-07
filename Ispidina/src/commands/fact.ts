const { SlashCommandBuilder } = require('discord.js');
const config = require('../config');
const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

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
            const response = await fetch("https://api.api-ninjas.com/v1/facts", {
                method: "GET",
                headers: {
                    'X-Api-Key': process.env.API_TOKEN
                }
            });

            // Validate
            if (!response.ok) {
                return interaction.reply({
                    content: "Something went wrong while retrieving a fact. Please try again later.",
                    ephemeral: true
                });
            }

            // Response
            const data = (await response.json())[0].fact;
            const embed = new EmbedBuilder()
                .setColor(colors.bot)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
                .addFields(
                    { name: 'Random Fact', value: data },
                    { name: 'Related Commands', value: "\`/rps\` \`/coin\` \`/math\` \`/dice\`" })
                .setTimestamp()
                .setFooter({ text: `Embed created by ${general.name}` });
            return interaction.reply({ embeds: [embed] });
        } catch (error: any) {
            logError(error);
        }
    }
};
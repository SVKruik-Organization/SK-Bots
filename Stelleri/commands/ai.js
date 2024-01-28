const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('Use ChatGPT or DALL-E from Discord!')
        .addStringOption(option => option
            .setName('action')
            .setDescription('Choose what response you want to get.')
            .setRequired(true)
            .addChoices(
                { name: 'Text', value: 'text' },
                { name: 'Image', value: 'image' }
            ))
        .addStringOption(option => option
            .setName('prompt')
            .setDescription("Your text or image prompt. Max 100 characters.")
            .setRequired(true)
            .setMaxLength(100)),
    async execute(interaction) {
        const actionType = interaction.options.getString('action');
        const prompt = interaction.options.getString('prompt');

        // Disabled for now.
        interaction.reply({ content: "This command is currently disabled. Come back later.", ephemeral: true });
    }
};
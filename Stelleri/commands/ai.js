const { SlashCommandBuilder } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const config = require('../assets/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('Use ChatGPT or DALL-E from Discord!')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choose what response you want to get.')
                .setRequired(true)
                .addChoices(
                    { name: 'Text', value: 'text' },
                    { name: 'Image', value: 'image' }
                ))
        .addStringOption(option => option.setName('prompt').setDescription("Your text or image prompt.").setRequired(true).setMaxLength(100)),
    async execute(interaction) {
        const actionType = interaction.options.getString('action');
        const prompt = interaction.options.getString('prompt');

        const configuration = new Configuration({
            organization: process.env.OPENAI_ORGANIZATION,
            apiKey: process.env.OPENAI_TOKEN,
        });
        const openai = new OpenAIApi(configuration);
        try {
            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
            });
            console.log(completion.data.choices[0].text);
        } catch (err) {
            if (err.response.status == 401) {
                await interaction.reply({ content: "Internal error. Try again later.", ephemeral: true });
            } else if (err.response.data.error.type == "insufficient_quota") {
                await interaction.reply({ content: `${config.general.name} is out of funds.`, ephemeral: false });
            } else if (err.response.status == 500) {
                await interaction.reply({ content: "OpenAI has a server error.", ephemeral: false });
            }
            console.log(err.response.data);
        };
    }
};
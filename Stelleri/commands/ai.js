const { SlashCommandBuilder } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const modules = require('..');
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
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
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

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(() => {
                return modules.log(`Command usage increase unsuccessful, ${username} does not have an account yet.`, "warning");
            });
    },
};
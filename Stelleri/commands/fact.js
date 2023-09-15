const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const { EmbedBuilder } = require('discord.js');
const modules = require('..');
const request = require('request');
const limit = require('../assets/config.js').general.apiLimit;

module.exports = {
    cooldown: config.cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('fact')
        .setDescription('Get a random fact.'),
    async execute(interaction) {
        const username = interaction.user.username;

        request.get({
            url: 'https://api.api-ninjas.com/v1/facts?limit=' + limit,
            headers: {
                'X-Api-Key': process.env.API_TOKEN
            },
        }, async function (error, response, body) {
            if (response.statusCode != 200) {
                await interaction.reply({ content: "Something went wrong while retrieving a fact. Please try again later.", ephemeral: true });
                return modules.log("Something went wrong while retrieving a fact.", "error");
            } else {
                const data = (JSON.parse(body))[0].fact;
                const embed = new EmbedBuilder()
                    .setColor(config.general.color)
                    .setAuthor({ name: username, iconURL: interaction.user.avatarURL() })
                    .addFields({ name: 'Random Fact', value: data })
                    .setTimestamp()
                    .setFooter({ text: `Embed created by ${config.general.name}` })
                await interaction.reply({ embeds: [embed] });
            };
        });
    }
};
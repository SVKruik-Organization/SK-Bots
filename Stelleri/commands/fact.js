const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const { EmbedBuilder } = require('discord.js');
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
            }
        }, function (error, response, body) {
            if (response.statusCode !== 200) {
                return interaction.reply({
                    content: "Something went wrong while retrieving a fact. Please try again later.",
                    ephemeral: true
                });
            } else {
                const data = (JSON.parse(body))[0].fact;
                const embed = new EmbedBuilder()
                    .setColor(config.general.color)
                    .setAuthor({ name: username, iconURL: interaction.user.avatarURL() })
                    .addFields({ name: 'Random Fact', value: data })
                    .setTimestamp()
                    .setFooter({ text: `Embed created by ${config.general.name}` })
                interaction.reply({ embeds: [embed] });
            }
        });
    }
};
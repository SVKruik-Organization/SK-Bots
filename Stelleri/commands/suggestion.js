const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion')
        .setDescription('Pitch a new idea for the project!')
        .addStringOption(option => option.setName('title').setDescription('The title for your suggestion.').setRequired(true).setMaxLength(50))
        .addStringOption(option => option.setName('description').setDescription('The description. Pitch your idea, explain why and how to implement.').setRequired(true)),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const channel = modules.client.channels.cache.get(config.general.suggestionChannel);
        const name = interaction.user.username;
        const pfp = interaction.user.avatarURL();
        
        const embed = new EmbedBuilder()
            .setColor(config.general.color)
            .setTitle(`New Suggestion: ${title}`)
            .setAuthor({ name: name, iconURL: pfp })
            .setDescription(`${description}`)
            .addFields({ name: '----', value: 'Meta' })
            .setTimestamp()
            .setFooter({ text: 'Embed created by Stelleri' })
        const embedMessage = await channel.send({ embeds: [embed] });
        embedMessage.react('🟢');
        embedMessage.react('🔴');
        await interaction.reply({ content: `Message created. Check your event here: <#${config.general.suggestionChannel}>.`, ephemeral: true });

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(() => {
                return console.log("[WARNING] Command usage increase unsuccessful, user does not have an account yet.\n");
            });
    },
};
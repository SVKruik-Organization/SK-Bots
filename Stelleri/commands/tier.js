const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const embedConstructor = require('../utils/embed.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('tier')
        .setDescription('Information about your tier progression. View level, experience etc.'),
    async execute(interaction) {
        const snowflake = interaction.user.id;

        modules.database.query("SELECT level, xp FROM tier WHERE snowflake = ?;", [snowflake])
            .then((data) => {
                const currentXp = data[0].xp + config.tier.slashCommand;

                const embed = embedConstructor.create("Bits Balance", "Information", interaction,
                    [
                        { name: 'Level', value: `\`${data[0].level}\`` },
                        { name: 'EXP', value: `\`${currentXp}\`` },
                        { name: '-----', value: `Summary` },
                        { name: 'EXP Needed', value: `\`${2 * (data[0].level + 1) + 30 - currentXp}\`` }
                    ]);
                interaction.reply({ embeds: [embed] });
            }).catch(() => {
                return interaction.reply({
                    content: "You do not have an account yet. Create an account with the `/register` command.",
                    ephemeral: true
                });
            });
    }
};
const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const embedConstructor = require('../utils/embed.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('tier')
        .setDescription('Information about your tier progression. View Level, Experience etcetera.'),
    async execute(interaction) {
        const snowflake = interaction.user.id;

        modules.database.query("SELECT level, xp, xp15, xp50, xp_active FROM tier LEFT JOIN user_inventory ON user_inventory.snowflake = tier.snowflake WHERE tier.snowflake = ?;", [snowflake])
            .then((data) => {
                const currentXp = data[0].xp + config.tier.slashCommand;

                const embed = embedConstructor.create("Tier Overview", "Information", interaction,
                    [
                        { name: 'Level', value: `\`${data[0].level}\`` },
                        { name: 'Experience', value: `\`${currentXp}\`` },
                        { name: '-----', value: `Summary` },
                        { name: 'EXP Needed', value: `\`${20 * (data[0].level + 1) + 300 - currentXp}\`` },
                        { name: 'Active Booster', value: `\`${data[0].xp_active}\`` },
                        { name: '+15% Boosters', value: `\`${data[0].xp15}\`` },
                        { name: '+50% Boosters', value: `\`${data[0].xp50}\`` }
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
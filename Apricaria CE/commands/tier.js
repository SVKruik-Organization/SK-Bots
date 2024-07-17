const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const embedConstructor = require('../utils/embed.js');
const dateUtils = require('../utils/date.js');
const guildUtils = require('../utils/guild.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('tier')
        .setNameLocalizations({
            nl: "tier"
        })
        .setDescription('Information and statistics about your Tier progression.')
        .setDescriptionLocalizations({
            nl: "Informatie en statistieken over uw Tier progressie."
        })
        .setDMPermission(true),
    async execute(interaction) {
        try {
            const snowflake = interaction.user.id;
            const targetGuild = guildUtils.findGuildById(interaction.guild.id);
            let xpReward = config.tier.slashCommand;
            if (targetGuild && targetGuild.xp_increase_slash) xpReward = targetGuild.xp_increase_slash;

            modules.database.query("SELECT level, xp, xp15, xp50, xp_active, xp_active_expiry FROM tier LEFT JOIN user_inventory ON user_inventory.snowflake = tier.snowflake WHERE tier.snowflake = ?;", [snowflake])
                .then((data) => {
                    if (data.length === 0) return interaction.reply({
                        content: "You do not have an account yet. Create an account with the `/register` command.",
                        ephemeral: true
                    });
                    const currentXp = data[0].xp + xpReward;

                    let hoursLeft = "";
                    if (data[0].xp_active_expiry) hoursLeft = ` (${dateUtils.difference(data[0].xp_active_expiry, dateUtils.getDate(null, null).today).remainingHours} hours remaining)`;
                    const embed = embedConstructor.create("Tier Overview", "Level System Progression", interaction.user,
                        [
                            { name: 'Level', value: `\`${data[0].level}\`` },
                            { name: 'Experience', value: `\`${currentXp}\`` },
                            { name: "-----", value: `Summary` },
                            { name: 'XP Needed', value: `\`${20 * (data[0].level + 1) + 300 - currentXp}\`` },
                            { name: 'Active Booster', value: `\`${data[0].xp_active}\`${hoursLeft}` },
                            { name: '+15% Boosters', value: `\`${data[0].xp15}\`` },
                            { name: '+50% Boosters', value: `\`${data[0].xp50}\`` }
                        ], ["inventory"]);
                    interaction.reply({ embeds: [embed], ephemeral: true });
                }).catch((error) => {
                    logger.error(error);
                    return interaction.reply({
                        content: "Something went wrong while retrieving the required information. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error) {
            logger.error(error);
        }
    }
};
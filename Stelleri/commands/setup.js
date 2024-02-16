const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const embedConstructor = require('../utils/embed.js');
const guildUtils = require('../utils/guild.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup or check the server configuration. Requires Developer Mode.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(option => option
            .setName("register")
            .setDescription("Create or update the current configuration.")
            .addChannelOption(option => option
                .setName('channel_admin')
                .setDescription('Admin Channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
            .addChannelOption(option => option
                .setName('channel_event')
                .setDescription('Event Channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
            .addChannelOption(option => option
                .setName('channel_suggestion')
                .setDescription('Suggestion Channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
            .addChannelOption(option => option
                .setName('channel_snippet')
                .setDescription('Snippet Channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
            .addChannelOption(option => option
                .setName('channel_rules')
                .setDescription('Rules Channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
            .addRoleOption(option => option
                .setName('role_blinded')
                .setDescription('Blinded Role')
                .setRequired(false))
            .addIntegerOption(option => option
                .setName('role_cosmetic_power')
                .setDescription('Amount of roles with admin privileges. This makes sure that cosmetic roles will not overpower these.')
                .setMinValue(2)
                .setMaxValue(30)
                .setRequired(false)))
        .addSubcommand(option => option
            .setName('check')
            .setDescription('Check the current server configuration.'))
        .addSubcommand(option => option
            .setName('help')
            .setDescription('Read about how-to and why to use this command.')),
    async execute(interaction) {
        try {
            // Setup
            const actionType = interaction.options.getSubcommand('action');
            const targetGuild = guildUtils.findGuildById(interaction.guild.id);
            const guildSnapshot = guildUtils.guilds;

            // Optional Options
            const channel_admin = interaction.options.getChannel('channel_admin') || null;
            const channel_event = interaction.options.getChannel('channel_event') || null;
            const channel_suggestion = interaction.options.getChannel('channel_suggestion') || null;
            const channel_snippet = interaction.options.getChannel('channel_snippet') || null;
            const channel_rules = interaction.options.getChannel('channel_rules') || interaction.guild.rulesChannelId ? await interaction.client.channels.fetch(interaction.guild.rulesChannelId) : null;
            const role_blinded = interaction.options.getRole('role_blinded') || null;
            const role_cosmetic_power = interaction.options.getInteger('role_cosmetic_power') || 2;

            // Update
            if (actionType === "register") {
                modules.database.query("UPDATE guild SET operator_id = ?, operator_name = ?, channel_admin = ?, channel_event = ?, channel_suggestion = ?, channel_snippet = ?, channel_rules = ?, role_blinded = ? WHERE snowflake = ?; UPDATE guild_settings SET role_cosmetic_power = ? WHERE guild_snowflake = ?;", [interaction.user.id, interaction.user.username, channel_admin ? channel_admin.id : null, channel_event ? channel_event.id : null, channel_suggestion ? channel_suggestion.id : null, channel_snippet ? channel_snippet.id : null, channel_rules ? channel_rules.id : null, role_blinded ? role_blinded.id : null, interaction.guild.id, role_cosmetic_power, interaction.guild.id])
                    .then(() => {
                        const filteredGuild = guildUtils.guilds.filter(guild => guild.guildObject.id === interaction.guild.id);
                        guildUtils.guilds = guildUtils.guilds.filter(guild => guild.guildObject.id !== interaction.guild.id);
                        guildUtils.guilds.push({
                            // Guild
                            "guildObject": interaction.guild,
                            "name": interaction.guild.name,
                            "operator_id": interaction.user.id,
                            "operator_name": interaction.user.username,
                            "channel_admin": channel_admin,
                            "channel_event": channel_event,
                            "channel_suggestion": channel_suggestion,
                            "channel_snippet": channel_snippet,
                            "channel_rules": channel_rules,
                            "role_blinded": role_blinded,
                            "locale": interaction.guild.preferredLocale,
                            "disabled": false,

                            // Settings
                            "xp15": filteredGuild.xp15 || 1200,
                            "xp50": filteredGuild.xp50 || 3500,
                            "level_up_reward_base": filteredGuild.level_up_reward_base || 20,
                            "role_cosmetic_price": filteredGuild.role_cosmetic_price || 11000,
                            "role_cosmetic_power": filteredGuild.role_cosmetic_power || 3,
                            "role_level_power": filteredGuild.role_level_power || 5,
                            "role_level_max": filteredGuild.role_level_max || 1000,
                            "role_level_enable": filteredGuild.role_level_enable || 1,
                            "role_level_color": filteredGuild.role_level_color || "FC6736",
                            "jackpot": filteredGuild.jackpot || 10000,
                            "welcome": filteredGuild.welcome || 1,
                            "xp_increase_normal": filteredGuild.xp_increase_normal || 5,
                            "xp_increase_slash": filteredGuild.xp_increase_slash || 15,
                            "xp_increase_purchase": filteredGuild.xp_increase_purchase || 25
                        });

                        interaction.reply({
                            content: "Setup update successful. Additional commands reloaded. For other settings like welcome messages and other paramaters, please consult my website (WIP).",
                            ephemeral: true
                        });
                    }).catch(() => {
                        guildUtils.guilds = guildSnapshot;
                        return interaction.reply({
                            content: "Something went wrong while updating the server configuration. Please try again later.",
                            ephemeral: true
                        });
                    });

                // Check
            } else if (actionType === "check") {
                if (!targetGuild) return interaction.reply({
                    content: "This server is not registred yet. Please register with the other option `(Re-Register)`, and try again.",
                    ephemeral: true
                });

                const embed = embedConstructor.create("Server Configuration", `${interaction.guild.name} Setup`, interaction.user,
                    [
                        { name: 'Registerer', value: `${targetGuild.operator_id ? '<@' + targetGuild.operator_id + '>' : "Not Configured"}` },
                        { name: 'Admin Channel', value: `${targetGuild.channel_admin || "Not Configured"}` },
                        { name: 'Event Channel', value: `${targetGuild.channel_event || "Not Configured"}` },
                        { name: 'Suggestion Channel', value: `${targetGuild.channel_suggestion || "Not Configured"}` },
                        { name: 'Snippet Channel', value: `${targetGuild.channel_snippet || "Not Configured"}` },
                        { name: 'Rules Channel', value: `${targetGuild.channel_rules || "Not Configured"}` },
                        { name: 'Power Roles', value: `\`${targetGuild.role_cosmetic_power || 0}\`` },
                        { name: 'Blinded Role', value: `${targetGuild.role_blinded || "Not Configured"}` }
                    ], ["server"]);
                interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (actionType === "help") {
                const embed = embedConstructor.create("Server Configuration", "Command Usage Help", interaction.user,
                    [
                        {
                            name: 'General',
                            value: "This command is reserved for adminstrators that want to check or configure their server configuration. Some commands are server/channel-specific, and therefore require setup."
                        },
                        {
                            name: 'How-To',
                            value: 'To update or register, please fill the other marked as optional fields. Fields that are left empty, will be stored as empty (resetting the value). Use this command carefully, as erroneous input will disable certain commands.'
                        },
                        {
                            name: "ID's",
                            value: "When Discord Developer mode is enabled, you can right-click > copy the Text Channel ID. Same goes for Roles and other objects. Just complete all the fields, and you are good to go. No reloading/refreshing is required, i'll handle it from there."
                        }
                    ], ["server"]);
                interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (error) {
            console.error(error);
        }
    }
};
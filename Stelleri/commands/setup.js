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
                .setName('role_power')
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
            let newGuild = true;
            const targetGuild = guildUtils.findGuildById(interaction.guild.id);
            if (targetGuild) newGuild = false;
            const guildSnapshot = guildUtils.guilds;

            // Optional Options
            const channel_event = interaction.options.getChannel('channel_event') || null;
            const channel_suggestion = interaction.options.getChannel('channel_suggestion') || null;
            const channel_snippet = interaction.options.getChannel('channel_snippet') || null;
            const channel_rules = interaction.options.getChannel('channel_rules') || interaction.guild.rulesChannelId ? await interaction.client.channels.fetch(interaction.guild.rulesChannelId) : null;
            const role_blinded = interaction.options.getRole('role_blinded') || null;
            const role_power = interaction.options.getInteger('role_power') || 2;

            // New 
            if (actionType === "register" && newGuild) {
                modules.database.query("UPDATE guild SET register_snowflake = ?, channel_event = ?, channel_suggestion = ?, channel_snippet = ?, channel_rules = ?, role_power = ?, role_blinded = ?, locale = ? WHERE snowflake = ?;", [interaction.user.id, channel_event ? channel_event.id : null, channel_suggestion ? channel_suggestion.id : null, channel_snippet ? channel_snippet.id : null, channel_rules ? channel_rules.id : null, role_power, role_blinded ? role_blinded.id : null, interaction.guild.preferredLocale, interaction.guild.id])
                    .then((data) => {
                        // Validation
                        if (!data.affectedRows) return interaction.reply({
                            content: "It seems like something went wrong at the initial setup when I joined this server. Please contact moderation.",
                            ephemeral: true
                        });

                        interaction.reply({
                            content: "Setup successful. Additional commands enabled. For other settings like welcome messages and other paramaters, please consult my website (WIP).",
                            ephemeral: true
                        });
                        guildUtils.guilds.push({
                            "guildObject": interaction.guild,
                            "name": interaction.guild.name,
                            "register_snowflake": interaction.user.id,
                            "channel_event": channel_event,
                            "channel_suggestion": channel_suggestion,
                            "channel_snippet": channel_snippet,
                            "channel_rules": channel_rules,
                            "role_power": role_power,
                            "role_blinded": role_blinded,
                            "locale": interaction.guild.preferredLocale,
                            "disabled": false
                        });
                    }).catch(() => {
                        guildUtils.guilds = guildSnapshot;
                        return interaction.reply({
                            content: "Something went wrong while creating the server configuration. Please try again later.",
                            ephemeral: true
                        });
                    });

                // Update
            } else if (actionType === "register" && !newGuild) {
                modules.database.query("UPDATE guild SET channel_event = ?, channel_suggestion = ?, channel_snippet = ?, channel_rules = ?, role_power = ?, role_blinded = ? WHERE snowflake = ?", [channel_event ? channel_event.id : null, channel_suggestion ? channel_suggestion.id : null, channel_snippet ? channel_snippet.id : null, channel_rules ? channel_rules.id : null, role_power, role_blinded ? role_blinded.id : null, interaction.guild.id])
                    .then((data) => {
                        // Validation
                        if (!data.affectedRows) return interaction.reply({
                            content: "It seems like something went wrong at the initial setup when I joined this server. Please contact moderation.",
                            ephemeral: true
                        });

                        interaction.reply({
                            content: "Setup update successful. Additional commands reloaded or disabled. For other settings like welcome messages and other paramaters, please consult my website (WIP).",
                            ephemeral: true
                        });
                        guildUtils.guilds = guildUtils.guilds.filter(guild => guild.guildObject.id !== interaction.guild.id);
                        guildUtils.guilds.push({
                            "guildObject": interaction.guild,
                            "name": interaction.guild.name,
                            "register_snowflake": interaction.user.id,
                            "channel_event": channel_event,
                            "channel_suggestion": channel_suggestion,
                            "channel_snippet": channel_snippet,
                            "channel_rules": channel_rules,
                            "role_power": role_power,
                            "role_blinded": role_blinded,
                            "locale": interaction.guild.preferredLocale,
                            "disabled": false
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
                        { name: 'Registerer', value: `${targetGuild.register_snowflake ? '<@' + targetGuild.register_snowflake + '>' : "Not Configured"}` },
                        { name: 'Event Channel', value: `${targetGuild.channel_event || "Not Configured"}` },
                        { name: 'Suggestion Channel', value: `${targetGuild.channel_suggestion || "Not Configured"}` },
                        { name: 'Snippet Channel', value: `${targetGuild.channel_snippet || "Not Configured"}` },
                        { name: 'Rules Channel', value: `${targetGuild.channel_rules || "Not Configured"}` },
                        { name: 'Power Roles', value: `\`${targetGuild.role_power || 0}\`` },
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
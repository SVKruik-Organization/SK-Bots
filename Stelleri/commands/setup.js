const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup or check the server configuration. Requires Developer Mode.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Whether you want to (re-)register or check current configuration.')
                .setRequired(true)
                .addChoices(
                    { name: '(Re-)Register', value: 'register' },
                    { name: 'Check', value: 'check' },
                    { name: 'Help', value: 'help' }
                ))
        .addStringOption(option => option.setName('channel_event').setDescription('The ID of the Event Channel. Right-click on the channel and copy the ID.').setRequired(false).setMaxLength(20).setMinLength(18))
        .addStringOption(option => option.setName('channel_suggestion').setDescription('The ID of the Suggestion Channel. Right-click on the channel and copy the ID').setRequired(false).setMaxLength(20).setMinLength(18))
        .addStringOption(option => option.setName('channel_snippet').setDescription('The ID of the Snippet Channel. Right-click on the channel and copy the ID').setRequired(false).setMaxLength(20).setMinLength(18))
        .addStringOption(option => option.setName('channel_rules').setDescription('The ID of the Rules Channel. Right-click on the channel and copy the ID').setRequired(false).setMaxLength(20).setMinLength(18))
        .addIntegerOption(option => option.setName('role_power').setDescription('Amount of roles with admin privileges. This makes sure that cosmetic roles will not overpower these.').setRequired(false).setMinValue(1).setMaxValue(30))
        .addStringOption(option => option.setName('role_blinded').setDescription('The ID of the Blinded Role. Right-click on the role and copy.').setRequired(false).setMaxLength(20).setMinLength(18))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Setup
        const actionType = interaction.options.getString('action');
        let newGuild = true;
        const targetGuild = modules.findGuildById(interaction.guild.id);
        if (targetGuild) newGuild = false;
        const guildSnapshot = modules.guilds;

        // Optional Options
        const channel_event = interaction.options.getString('channel_event') || null;
        const channel_suggestion = interaction.options.getString('channel_suggestion') || null;
        const channel_snippet = interaction.options.getString('channel_snippet') || null;
        const channel_rules = interaction.options.getString('channel_rules') || null;
        const role_power = interaction.options.getInteger('role_power') || 2;
        const role_blinded = interaction.options.getString('role_blinded') || null;

        // New 
        if (actionType === "register" && newGuild) {
            modules.database.query("INSERT INTO guild (register_snowflake, name, channel_event, channel_suggestion, channel_snippet, channel_rules, role_power, role_blinded, locale, snowflake) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [interaction.user.id, interaction.user.username, channel_event, channel_suggestion, channel_snippet, channel_rules, role_power, role_blinded, interaction.guild.preferredLocale, interaction.guild.id])
                .then(() => {
                    interaction.reply("Setup successful. Additional commands enabled.");
                    modules.guilds.push({
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
                    modules.guilds = guildSnapshot;
                    interaction.reply({
                        content: "Something went wrong while creating the server configuration. Please try again later.",
                        ephemeral: true
                    });
                });

            // Update
        } else if (actionType === "register" && !newGuild) {
            modules.database.query("UPDATE guild SET channel_event = ?, channel_suggestion = ?, channel_snippet = ?, channel_rules = ?, role_power = ?, role_blinded = ? WHERE snowflake = ?", [channel_event, channel_suggestion, channel_snippet, channel_rules, role_power, role_blinded, interaction.guild.id])
                .then(() => {
                    interaction.reply("Setup update successful. Additional commands reloaded or disabled.");
                    modules.guilds = modules.guilds.filter(guild => guild.guildObject.id !== interaction.guild.id);
                    modules.guilds.push({
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
                    modules.guilds = guildSnapshot;
                    interaction.reply({
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

            const embed = modules.embedConstructor("Server Configuration", "Information", interaction,
                [
                    { name: 'Registerer', value: `<@${targetGuild.register_snowflake}>` },
                    { name: 'Event Channel', value: `${targetGuild.channel_event || "Not Configured"}` },
                    { name: 'Suggestion Channel', value: `${targetGuild.channel_suggestion || "Not Configured"}` },
                    { name: 'Snippet Channel', value: `${targetGuild.channel_snippet || "Not Configured"}` },
                    { name: 'Rules Channel', value: `${targetGuild.channel_rules || "Not Configured"}` },
                    { name: 'Power Roles', value: `\`${targetGuild.role_power || 0}\`` },
                    { name: 'Blinded Role', value: `${targetGuild.role_blinded || "Not Configured"}` }
                ]);
            interaction.reply({ embeds: [embed] });
        } else if (actionType === "help") {
            const embed = modules.embedConstructor("Server Configuration", "Command Usage Help", interaction,
                [
                    { name: 'General', value: "This command is reserved for adminstrators that want to check or configure their server configuration. Some commands are server/channel-specific, and therefore require setup." },
                    { name: 'How-To', value: 'To update or register, please fill the other marked as optional fields. Fields that are left empty, will be stored as empty (resetting the value). Use this command carefully, as erroneous input will disable certain commands.' },
                    { name: "ID's", value: "When Discord Developer mode is enabled, you can right-click > copy the Text Channel ID. Same goes for Roles and other objects. Just complete all the fields, and you are good to go. No reloading/refreshing is required, i'll handle it from there." }
                ]);
            interaction.reply({ embeds: [embed] });
        }
    }
};
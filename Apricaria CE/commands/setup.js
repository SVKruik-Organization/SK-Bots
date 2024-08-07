const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');
const embedConstructor = require('../utils/embed.js');
const guildUtils = require('../utils/guild.js');
const userUtils = require('../utils/user.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('setup')
        .setNameLocalizations({
            nl: "configuratie"
        })
        .setDescription('Setup or check the server configuration.')
        .setDescriptionLocalizations({
            nl: "Setup of bekijk de server configuratie."
        })
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(option => option
            .setName("register")
            .setNameLocalizations({
                nl: "registreren"
            })
            .setDescription("Create or update the current configuration.")
            .setDescriptionLocalizations({
                nl: "Creëer of update the actuele configuratie."
            })
            .addChannelOption(option => option
                .setName('channel_admin')
                .setDescription('Administrator Channel')
                .setDescriptionLocalizations({
                    nl: "Administrator Kanaal"
                })
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
            .addChannelOption(option => option
                .setName('channel_event')
                .setDescription('Event Channel')
                .setDescriptionLocalizations({
                    nl: "Evenement Kanaal."
                })
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
            .addChannelOption(option => option
                .setName('channel_suggestion')
                .setDescription('Suggestion Channel')
                .setDescriptionLocalizations({
                    nl: "Suggestie Kanaal."
                })
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
            .addChannelOption(option => option
                .setName('channel_snippet')
                .setDescription('Snippet Channel')
                .setDescriptionLocalizations({
                    nl: "Snippet Kanaal."
                })
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
            .addChannelOption(option => option
                .setName('channel_broadcast')
                .setDescription('Broadcast Channel')
                .setDescriptionLocalizations({
                    nl: "Omroep Kanaal."
                })
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
            .addChannelOption(option => option
                .setName('channel_rules')
                .setDescription('Rules Channel')
                .setDescriptionLocalizations({
                    nl: "Regel Kanaal"
                })
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
            .addChannelOption(option => option
                .setName('channel_ticket')
                .setDescription('Ticket Category')
                .setDescriptionLocalizations({
                    nl: "Ticket Categorie"
                })
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(false))
            .addRoleOption(option => option
                .setName('role_blinded')
                .setDescription('Blinded Role')
                .setDescriptionLocalizations({
                    nl: "Verblinde Rol."
                })
                .setRequired(false))
            .addRoleOption(option => option
                .setName('role_support')
                .setDescription('Support Role')
                .setDescriptionLocalizations({
                    nl: "Ondersteuning Rol."
                })
                .setRequired(false))
            .addIntegerOption(option => option
                .setName('role_cosmetic_power')
                .setDescription('Amount of roles with admin privileges. This makes sure that cosmetic roles will not overpower these.')
                .setDescriptionLocalizations({
                    nl: "Aantal rollen in deze server met beheerdersrechten. Zo overmeesteren de cosmetische rollen niet."
                })
                .setMinValue(2)
                .setMaxValue(30)
                .setRequired(false)))
        .addSubcommand(option => option
            .setName('check')
            .setNameLocalizations({
                nl: "bekijk"
            })
            .setDescription('Check the current server configuration.')
            .setDescriptionLocalizations({
                nl: "Bekijk de actuele server configuratie."
            }))
        .addSubcommand(option => option
            .setName('help')
            .setNameLocalizations({
                nl: "hulp"
            })
            .setDescription('Read about how-to and why to use this command.')
            .setDescriptionLocalizations({
                nl: "Lees hoe en waarom dit commando te gebruiken."
            })),
    async execute(interaction) {
        try {
            // Permission Validation
            const operatorData = await userUtils.checkOperator(interaction);
            if (!operatorData.hasPermissions) return;

            // Setup
            const actionType = interaction.options.getSubcommand('action');
            const targetGuild = guildUtils.findGuildById(interaction.guild.id);
            const guildSnapshot = guildUtils.guilds;

            // Optional Options
            const channel_admin = interaction.options.getChannel('channel_admin') || null;
            const channel_event = interaction.options.getChannel('channel_event') || null;
            const channel_suggestion = interaction.options.getChannel('channel_suggestion') || null;
            const channel_snippet = interaction.options.getChannel('channel_snippet') || null;
            const channel_broadcast = interaction.options.getChannel('channel_broadcast') || null;
            const channel_rules = interaction.options.getChannel('channel_rules') || (interaction.guild.rulesChannelId ? await interaction.client.channels.fetch(interaction.guild.rulesChannelId) : null);
            const channel_ticket = interaction.options.getChannel('channel_ticket') || null;
            const role_blinded = interaction.options.getRole('role_blinded') || null;
            const role_support = interaction.options.getRole('role_support') || null;
            const role_cosmetic_power = interaction.options.getInteger('role_cosmetic_power') || 2;

            // Update
            if (actionType === "register") {
                modules.database.query("UPDATE guild SET channel_admin = ?, channel_broadcast = ?, channel_event = ?, channel_suggestion = ?, channel_snippet = ?, channel_rules = ?, role_blinded = ?, role_support = ? WHERE snowflake = ?; UPDATE guild_settings SET role_cosmetic_power = ? WHERE guild_snowflake = ?;",
                    [channel_admin ? channel_admin.id : null, channel_broadcast ? channel_broadcast.id : null, channel_event ? channel_event.id : null, channel_suggestion ? channel_suggestion.id : null, channel_snippet ? channel_snippet.id : null, channel_rules ? channel_rules.id : null, channel_ticket ? channel_ticket.id : null, role_blinded ? role_blinded.id : null, role_support ? role_support.id : null, interaction.guild.id, role_cosmetic_power, interaction.guild.id])
                    .then(() => {
                        const filteredGuild = guildUtils.guilds.filter(guild => guild.guildObject.id === interaction.guild.id);
                        guildUtils.guilds = guildUtils.guilds.filter(guild => guild.guildObject.id !== interaction.guild.id);
                        guildUtils.guilds.push({
                            // Guild
                            "guildObject": interaction.guild,
                            "team_tag": filteredGuild.team_tag,
                            "name": interaction.guild.name,
                            "channel_admin": channel_admin,
                            "channel_event": channel_event,
                            "channel_suggestion": channel_suggestion,
                            "channel_snippet": channel_snippet,
                            "channel_broadcast": channel_broadcast,
                            "channel_rules": channel_rules,
                            "channel_ticket": channel_ticket,
                            "role_blinded": role_blinded,
                            "role_support": role_support,
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
                            content: `Setup update successful. Additional commands reloaded and ready for action. For other settings like welcome messages and other parameters, please use the [SK Commander](${config.urls.skCommander}) application or the [website](${config.urls.website}).`,
                            ephemeral: true
                        });
                    }).catch((error) => {
                        logger.error(error);
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

                const embed = embedConstructor.create("Server Configuration", `Settings and channel configuration of \`${interaction.guild.name}\`.`, interaction.user,
                    [
                        { name: 'Admin Channel', value: `${targetGuild.channel_admin || "Not Configured"}` },
                        { name: 'Event Channel', value: `${targetGuild.channel_event || "Not Configured"}` },
                        { name: 'Suggestion Channel', value: `${targetGuild.channel_suggestion || "Not Configured"}` },
                        { name: 'Snippet Channel', value: `${targetGuild.channel_snippet || "Not Configured"}` },
                        { name: 'Broadcast Channel', value: `${targetGuild.channel_broadcast || "Not Configured"}` },
                        { name: 'Rules Channel', value: `${targetGuild.channel_rules || "Not Configured"}` },
                        { name: 'Ticket Category', value: `${targetGuild.channel_ticket || "Not Configured"}` },
                        { name: 'Power Roles', value: `\`${targetGuild.role_cosmetic_power || 0}\`` },
                        { name: 'Blinded Role', value: `${targetGuild.role_blinded || "Not Configured"}` },
                        { name: 'Support Role', value: `${targetGuild.role_support || "Not Configured"}` }
                    ], ["server"]);
                interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (actionType === "help") {
                const embed = embedConstructor.create("Server Configuration", "Command Usage Help", interaction.user,
                    [
                        {
                            name: 'General',
                            value: "This command is reserved for Operators that want to check or configure their server configuration. Some commands are server/channel-specific, and therefore require setup."
                        },
                        {
                            name: 'How-To',
                            value: 'To update or register, please fill the other marked as optional fields. Fields that are left empty, will be stored as empty (resetting the value). Use this command carefully, as erroneous input will disable certain commands.'
                        },
                        {
                            name: 'Advanced Config',
                            value: `When you try to update the configuration, you might notice the lack of customization. This is because it would not be UIX friendly to show 30 different options in only one command or to have multiple commands for different settings. To fix this, another standalone desktop and weba application have been built. These apps enables you to customize the bot to your liking including custom pricing and viewing statistics. For more information, checkout my [website](${config.urls.website}).`
                        }
                    ], ["server"]);
                interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (error) {
            logger.error(error);
        }
    }
};
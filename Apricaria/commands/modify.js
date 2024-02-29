const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const userUtils = require('../utils/user.js');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('modify')
        .setNameLocalizations({
            nl: "modificeren"
        })
        .setDescription('Modify user balances.')
        .setDescriptionLocalizations({
            nl: "Verander saldo's van een gebruiker."
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addUserOption(option => option
            .setName('target')
            .setNameLocalizations({
                nl: "gebruiker"
            })
            .setDescription('The target member.')
            .setDescriptionLocalizations({
                nl: "De betreffende gebruiker."
            })
            .setRequired(true))
        .addStringOption(option => option
            .setName('section')
            .setNameLocalizations({
                nl: "afdeling"
            })
            .setDescription('Choose what you would like to alter.')
            .setDescriptionLocalizations({
                nl: "Kies wat u wilt veranderen."
            })
            .setRequired(true)
            .addChoices(
                { name: 'Tier - Level', value: 'rnk-lvl' },
                { name: 'Tier - XP', value: 'rnk-xp' },
                { name: 'Economy - Wallet', value: 'eco-wal' },
                { name: 'Economy - Bank', value: 'eco-bnk' }))
        .addStringOption(option => option
            .setName('action')
            .setNameLocalizations({
                nl: "actie"
            })
            .setDescription('Choose what type of edit you want to make.')
            .setDescriptionLocalizations({
                nl: "Kies de soort modificatie die u wilt maken."
            })
            .setRequired(true)
            .addChoices(
                { name: 'Set', value: 'set' },
                { name: 'Increase', value: 'inc' },
                { name: 'Decrease', value: 'dec' },
                { name: 'Multiply', value: 'mult' },
                { name: 'Divide', value: 'div' }))
        .addIntegerOption(option => option
            .setName('amount')
            .setNameLocalizations({
                nl: "hoeveelheid"
            })
            .setDescription("The amount for the chosen action.")
            .setDescriptionLocalizations({
                nl: "De hoeveelheid voor de gekozen modificatie."
            })
            .setRequired(true)
            .setMinValue(0)),
    async execute(interaction) {
        try {
            // Permission Validation
            if (!(await userUtils.checkAdmin(interaction.user.id, interaction.guild))) return interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Please try again later, or contact moderation to receive elevated permissions.`,
                ephemeral: true
            });

            const sectionType = interaction.options.getString('section');
            const actionType = interaction.options.getString('action');
            const amount = interaction.options.getInteger('amount');
            const targetSnowflake = interaction.options.getUser('target').id;

            let table = undefined;
            let row = undefined;
            let action = undefined;
            let where = ` WHERE snowflake = ${targetSnowflake}`;

            if (sectionType === "rnk-lvl") {
                table = "`tier` SET level = ";
                row = "`level`";
            } else if (sectionType === "rnk-xp") {
                table = "`tier` SET xp =";
                row = "`xp`";
            } else if (sectionType === "eco-wal") {
                table = "`economy` SET wallet =";
                row = "`wallet`";
            } else if (sectionType === "eco-bnk") {
                table = "`economy` SET bank =";
                row = "`bank`";
            }

            if (actionType === "set") {
                action = ` ${amount}`;
            } else if (actionType === "inc") {
                action = ` ${row} + ${amount}`;
            } else if (actionType === "dec") {
                action = ` ${row} - ${amount}`;
            } else if (actionType === "mult") {
                action = ` ${row} * ${amount}`;
            } else if (actionType === "div") {
                action = ` ${row} / ${amount}`;
            }

            modules.database.query(`UPDATE ${table}${action}${where}`)
                .then((data) => {
                    // Validation
                    if (!data.affectedRows) return interaction.reply({
                        content: "This user does not have an account yet.",
                        ephemeral: true
                    });

                    interaction.reply({
                        content: "Account data has been successfully changed.",
                        ephemeral: true
                    });
                }).catch((error) => {
                    logger.error(error);
                    return interaction.reply({
                        content: "Something went wrong while trying to update their information. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error) {
            logger.error(error);
        }
    }
};
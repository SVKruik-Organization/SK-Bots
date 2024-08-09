import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, User } from 'discord.js';
import { database } from '../index.js';
import { cooldowns } from '../config.js';
import { checkAdmin } from '../utils/user.js';
import { logError } from '../utils/logger.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('modify')
        .setNameLocalizations({
            nl: "modificeren"
        })
        .setDescription('Modify user balances.')
        .setDescriptionLocalizations({
            nl: "Verander saldo's van een gebruiker."
        })
        .setDMPermission(false)
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
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Permission Validation
            if (!(await checkAdmin(interaction))) return await interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Please try again later, or contact moderation to receive elevated permissions.`,
                ephemeral: true
            });

            const sectionType: string = interaction.options.getString("section") as string;
            const actionType: string = interaction.options.getString("action") as string;
            const amount: number = interaction.options.getInteger("amount") as number;
            const targetUser: User = interaction.options.getUser("target", true) as User;

            let table: string | undefined = undefined;
            let row: string | undefined = undefined;
            let action: string | undefined = undefined;
            let where: string = ` WHERE snowflake = ${targetUser.id}`;

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
            } else if (actionType === "div") action = ` ${row} / ${amount}`;

            try {
                const data: { affectedRows: number } = await database.query(`UPDATE ${table}${action}${where}`);
                // Validation
                if (!data.affectedRows) return await interaction.reply({
                    content: "This user does not have an account yet.",
                    ephemeral: true
                });

                return await interaction.reply({
                    content: "Account data has been successfully changed.",
                    ephemeral: true
                });
            } catch (error: any) {
                logError(error);
                return await interaction.reply({
                    content: "Something went wrong while trying to update their information. Please try again later.",
                    ephemeral: true
                });
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
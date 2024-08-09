import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { database } from '../index.js';
import { cooldowns } from '../config.js';
import { logError } from '../utils/logger.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('register')
        .setNameLocalizations({
            nl: "registreren"
        })
        .setDescription('Create a new account with us. Grants access to Tier & Economy commands.')
        .setDescriptionLocalizations({
            nl: "Maak een account bij ons aan. Geeft toegang tot Tier & Economy commando's."
        })
        .setDMPermission(true)
        .addStringOption(option => option
            .setName('pincode')
            .setNameLocalizations({
                nl: "pincode"
            })
            .setDescription('A 4-digit pincode for sensitive commands. Save it safe!')
            .setDescriptionLocalizations({
                nl: "Een 4-cijferige pincode voor gevoelige commando's. Bewaar hem goed!"
            })
            .setRequired(true)
            .setMaxLength(4)
            .setMinLength(4)),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const snowflake: string = interaction.user.id;
            const username: string = interaction.user.username;
            const pincode: string = interaction.options.getString("pincode") as string;

            try {
                await database.query("INSERT INTO user_general (snowflake, username, pincode) VALUES (?, ?, ?); INSERT INTO tier (snowflake) VALUES (?); INSERT INTO economy (snowflake) VALUES (?); INSERT INTO user_inventory (snowflake) VALUES (?); INSERT INTO user_commands (snowflake) VALUES (?);",
                    [snowflake, username, pincode, snowflake, snowflake, snowflake, snowflake]);
                return await interaction.reply({
                    content: "Thank you for your registration! You can now use all commands.",
                    ephemeral: true
                });
            } catch (error: any) {
                if (error.code === "ER_DUP_ENTRY") {
                    return await interaction.reply({
                        content: "You already have an account. Display your statistics with `/economy` and `/tier`.",
                        ephemeral: true
                    });
                } else {
                    logError(error)
                    return await interaction.reply({
                        content: "Something went wrong while registering your account. Please try again later.",
                        ephemeral: true
                    });
                }
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
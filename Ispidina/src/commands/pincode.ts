import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { database } from '..';
import { cooldowns, urls } from '../config';
import { logError, logMessage } from '../utils/logger';
import { Command } from '../types';

export default {
    cooldown: cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('pincode')
        .setNameLocalizations({
            nl: "pincode"
        })
        .setDescription('Change your 4-digit pincode.')
        .setDescriptionLocalizations({
            nl: "Verander uw 4-cijferige pincode."
        })
        .setDMPermission(true)
        .addIntegerOption(option => option
            .setName('old')
            .setNameLocalizations({
                nl: "oud"
            })
            .setDescription("Your current pincode.")
            .setDescriptionLocalizations({
                nl: "Uw actuele pincode."
            })
            .setRequired(true)
            .setMinValue(1000)
            .setMaxValue(9999))
        .addIntegerOption(option => option
            .setName('new')
            .setNameLocalizations({
                nl: "nieuw"
            })
            .setDescription("Your new pincode. Save it safe!")
            .setDescriptionLocalizations({
                nl: "Uw nieuwe pincode. Bewaar hem goed!"
            })
            .setRequired(true)
            .setMinValue(1000)
            .setMaxValue(9999)),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Setup
            const snowflake: string = interaction.user.id;
            const username: string = interaction.user.username;
            const oldPincode: number = interaction.options.getInteger("old") as number;
            const newPincode: number = interaction.options.getInteger("new") as number;

            database.query("SELECT pincode FROM user_general WHERE snowflake = ?;", [snowflake])
                .then(async (data) => {
                    // Validation
                    if (data.length === 0) return await interaction.reply({
                        content: "You do not have an account yet. Create an account with the `/register` command.",
                        ephemeral: true
                    });

                    // User Validation
                    // TODO - Pincode Web Reset
                    if (data[0].pincode !== oldPincode) return await interaction.reply({
                        content: `Your old pincode does not match the current one. Please try again. If you want to reset your pincode (in case you forgot your pincode), please follow this [link](${urls.website}).`,
                        ephemeral: true
                    });

                    // Update
                    database.query("UPDATE user_general SET pincode = ? WHERE snowflake = ?;", [newPincode, snowflake])
                        .then(async (data) => {
                            // Validation
                            if (!data.affectedRows) return await interaction.reply({
                                content: "This command requires you to have an account. Create an account with the `/register` command.",
                                ephemeral: true
                            });

                            await interaction.reply({
                                content: `Your pincode has been updated successfully. New pincode: \`${newPincode}\`. Safe it save!`,
                                ephemeral: true
                            });
                            logMessage(`${username} has changed their pincode.`, "info");
                        }).catch(async (error: any) => {
                            logError(error);
                            return await interaction.reply({
                                content: "Something went wrong while trying to update your information. Please try again later.",
                                ephemeral: true
                            });
                        });
                }).catch(async (error: any) => {
                    logError(error);
                    return await interaction.reply({
                        content: "Something went wrong while trying to update your information. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
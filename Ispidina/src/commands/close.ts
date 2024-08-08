import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { database } from '..';
import { cooldowns } from '../config';
import { sendConfirmButtons } from '../handlers/closeInteractionHandler';
import { logError } from '../utils/logger';
import { Command } from '../types';

export default {
    cooldown: cooldowns.D,
    data: new SlashCommandBuilder()
        .setName('close')
        .setNameLocalizations({
            nl: "sluiten"
        })
        .setDescription('Close your account. You can no longer use account specific commands.')
        .setDescriptionLocalizations({
            nl: "Uw account sluiten. U zal toegang verliezen toch account specifieke commando's."
        })
        .setDMPermission(true)
        .addStringOption(option => option
            .setName('pincode')
            .setNameLocalizations({
                nl: "pincode"
            })
            .setDescription('Your 4-digit pincode you chose when registering your account.')
            .setDescriptionLocalizations({
                nl: "Uw 4-cijferige pincode die u gekozen heeft tijdens account registratie."
            })
            .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const snowflake: string = interaction.user.id;
            const inputPincode: string = interaction.options.getString("pincode") as string;

            database.query("SELECT pincode AS 'pin' FROM user_general WHERE snowflake = ?;", [snowflake])
                .then(async (data) => {
                    const dataPincode: string = data[0].pin;
                    if (inputPincode === dataPincode) {
                        sendConfirmButtons(interaction);
                    } else return await interaction.reply({
                        content: "Your pincode is not correct. If you forgot your pincode, you can request it with `/pincode`.",
                        ephemeral: true
                    });
                }).catch(async (error: any) => {
                    logError(error);
                    return await interaction.reply({
                        content: "Something went wrong while closing your account. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
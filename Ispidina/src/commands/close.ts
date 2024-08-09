import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { database } from '../index.js';
import { cooldowns } from '../config.js';
import { sendConfirmButtons } from '../handlers/closeInteractionHandler.js';
import { logError } from '../utils/logger.js';
import { Command } from '../types.js';

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

            try {
                const data: Array<{ pincode: string }> = await database.query("SELECT pincode FROM user_general WHERE snowflake = ?;", [snowflake]);
                const dataPincode: string = data[0].pincode;
                if (inputPincode === dataPincode) {
                    sendConfirmButtons(interaction);
                } else return await interaction.reply({
                    content: "Your pincode is not correct. If you forgot your pincode, you can request it with `/pincode`.",
                    ephemeral: true
                });
            } catch (error: any) {
                logError(error);
                return await interaction.reply({
                    content: "Something went wrong while closing your account. Please try again later.",
                    ephemeral: true
                });
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
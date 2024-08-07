import { SlashCommandBuilder } from 'discord.js';
import modules from '..';
import config from '../config';
import { sendConfirmButtons } from '../handlers/closeInteractionHandler';
import logger from '../utils/logger';

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
            const snowflake = interaction.user.id;
            const inputPincode = interaction.options.getString('pincode');

            database.query("SELECT pincode AS 'pin' FROM user_general WHERE snowflake = ?;", [snowflake])
                .then((data) => {
                    const dataPincode = data[0].pin;
                    const match = inputPincode === dataPincode;
                    if (match) {
                        sendConfirmButtons(interaction);
                    } else return interaction.reply({
                        content: "Your pincode is not correct. If you forgot your pincode, you can request it with `/pincode`.",
                        ephemeral: true
                    });
                }).catch((error: any) => {
                    logError(error);
                    return interaction.reply({
                        content: "Something went wrong while closing your account. Please try again later.",
                        ephemeral: true
                    });
                });
        } catch (error: any) {
            logError(error);
        }
    }
};
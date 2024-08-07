import { ButtonInteraction, ChatInputCommandInteraction, Message } from 'discord.js';
import { database } from '..';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { logError } from '../utils/logger';

/**
 * Send a pair of confirmation buttons.
 * @param interaction Discord Interaction Object
 */
export function sendConfirmButtons(interaction: ChatInputCommandInteraction): Promise<Message> {
    const cancel: ButtonBuilder = new ButtonBuilder()
        .setCustomId('cancelAccountClose')
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary);
    const confirm: ButtonBuilder = new ButtonBuilder()
        .setCustomId('confirmAccountClose')
        .setLabel("Close Account")
        .setStyle(ButtonStyle.Danger);

    return interaction.reply({
        content: 'Everything is ready. Are you sure you want to close your account? You will lose all your data (purchase history, Bits, Level, etcetera).',
        components: [new ActionRowBuilder().addComponents(cancel, confirm)],
        ephemeral: true
    });
}

/**
 * Confirm account deletion.
 * @param interaction Discord Interaction Object
 */
export function confirmAccountClose(interaction: ButtonInteraction): void {
    database.query("DELETE FROM user_general WHERE snowflake = ?;", [interaction.user.id])
        .then((data) => {
            if (!data.affectedRows) return interaction.update({
                content: "This command requires you to have an account. Create an account with the `/register` command.",
                components: [],
                ephemeral: true
            });

            interaction.update({
                content: "Your account has been successfully closed. If you ever change your mind, you can always create a new account with the `/register` command. Cya!",
                components: [],
                ephemeral: true
            });
        }).catch((error: any) => {
            logError(error);
            return interaction.update({
                content: "Something went wrong while closing your account. Please try again later.",
                components: [],
                ephemeral: true
            });
        });
}

/**
 * Cancel account deletion.
 * @param interaction Discord Interaction Object
 */
export function cancelAccountClose(interaction: ButtonInteraction): void {
    return interaction.update({
        content: `Phew! Almost thought I lost you there. If you have questions or concerns, don't hesitate to contact moderation.`,
        components: [],
        ephemeral: true
    });
}
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, ChatInputCommandInteraction, InteractionResponse } from 'discord.js';
import { database } from '../index.js';
import { logError } from '../utils/logger.js';

/**
 * Send a pair of confirmation buttons.
 * @param interaction Discord Interaction Object
 */
export async function sendConfirmButtons(interaction: ChatInputCommandInteraction): Promise<InteractionResponse> {
    const cancel: ButtonBuilder = new ButtonBuilder()
        .setCustomId('cancelAccountClose')
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary);
    const confirm: ButtonBuilder = new ButtonBuilder()
        .setCustomId('confirmAccountClose')
        .setLabel("Close Account")
        .setStyle(ButtonStyle.Danger);

    return await interaction.reply({
        content: 'Everything is ready. Are you sure you want to close your account? You will lose all your data (purchase history, Bits, Level, etcetera).',
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, confirm)],
        ephemeral: true
    });
}

/**
 * Confirm account deletion.
 * @param interaction Discord Interaction Object
 */
export async function confirmAccountClose(interaction: ButtonInteraction): Promise<InteractionResponse> {
    try {
        const data: { affectedRows: number } = await database.query("DELETE FROM user_general WHERE snowflake = ?;", [interaction.user.id]);
        if (!data.affectedRows) return await interaction.update({
            content: "This command requires you to have an account. Create an account with the `/register` command.",
            components: []
        });

        return await interaction.update({
            content: "Your account has been successfully closed. If you ever change your mind, you can always create a new account with the `/register` command. Cya!",
            components: []
        });
    } catch (error: any) {
        logError(error);
        return await interaction.update({
            content: "Something went wrong while closing your account. Please try again later.",
            components: []
        });
    }
}

/**
 * Cancel account deletion.
 * @param interaction Discord Interaction Object
 */
export async function cancelAccountClose(interaction: ButtonInteraction): Promise<InteractionResponse> {
    return await interaction.update({
        content: `Phew! Almost thought I lost you there. If you have questions or concerns, don't hesitate to contact moderation.`,
        components: []
    });
}
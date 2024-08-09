import { ButtonInteraction, InteractionResponse } from 'discord.js';
import { logError } from '../utils/logger.js';

/**
 * Close the ticket channel where the button was pressed.
 * @param interaction Discord Interaction Object
 */
export async function closeChannel(interaction: ButtonInteraction): Promise<InteractionResponse<boolean> | undefined> {
    try {
        const cooldown: number = 5000;
        const message: string = `Alright, I will close this channel in \`${cooldown / 1000}\` seconds.`;
        interaction.update({
            content: message,
            components: []
        });
        interaction.channel?.send({ content: message });
        setTimeout(() => interaction.channel?.delete(), cooldown);
    } catch (error: any) {
        logError(error);
        return await interaction.reply({
            content: "Something went wrong while closing your account. Please try again later.",
            ephemeral: true
        });
    }
}

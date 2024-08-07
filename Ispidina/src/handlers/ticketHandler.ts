import { ChatInputCommandInteraction } from 'discord.js';

/**
 * Close the ticket channel where the button was pressed.
 * @param interaction Discord Interaction Object
 */
export function closeChannel(interaction: ChatInputCommandInteraction) {
    const cooldown: number = 5000;
    const message: string = `Alright, I will close this channel in \`${cooldown / 1000}\` seconds.`;
    interaction.editReply({
        content: message,
        components: []
    });
    interaction.channel?.send({ content: message });
    setTimeout(() => interaction.channel?.delete(), cooldown);
}

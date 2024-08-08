import { ButtonInteraction, InteractionResponse, Message } from 'discord.js';
import { database } from '..';

/**
 * Registers a user for an event.
 * @param interaction Discord Interaction Object
 */
export async function signUp(interaction: ButtonInteraction): Promise<Message<boolean> | InteractionResponse<boolean> | undefined> {
    // Ticket
    const eventTicket: string = interaction.customId.split("_")[1];
    if (eventTicket.length !== 8) return await interaction.reply({
        content: "Something went wrong while registering you for this event. Please try again later.",
        ephemeral: true
    });

    database.query("INSERT INTO event_attendee (snowflake, event_ticket) VALUES (?, ?);", [interaction.user.id, eventTicket])
        .then(async () => {
            return await interaction.reply({
                content: "Successfully registered for this event. I will notify you when it's due!",
                ephemeral: true
            });
        }).catch(async (error: any) => {
            if (error.code === "ER_DUP_ENTRY") {
                return await interaction.reply({
                    content: "You have already registered for this event. I will notify you when it's due!",
                    ephemeral: true
                });
            } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
                return await interaction.reply({
                    content: "Seems like this event does not exist anymore. It might have been deleted or canceled already.",
                    ephemeral: true
                });
            } else return await interaction.reply({
                content: "Something went wrong while registering you for this event. Please try again later.",
                ephemeral: true
            });
        });
}

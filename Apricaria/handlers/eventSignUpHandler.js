const modules = require('..');

/**
 * Registers a user for an event.
 * @param {object} interaction Discord Interaction Object
 */
function signUp(interaction) {
    // Ticket
    const eventTicket = interaction.customId.split("_")[1];
    if (eventTicket.length !== 8) return interaction.reply({
        content: "Something went wrong while registering you for this event. Please try again later.",
        ephemeral: true
    });

    modules.database.query("INSERT INTO event_attendee (snowflake, event_ticket) VALUES (?, ?);", [interaction.user.id, eventTicket])
        .then(() => {
            return interaction.reply({
                content: "Successfully registered for this event. I will notify you when it's due!",
                ephemeral: true
            });
        }).catch((error) => {
            if (error.code === "ER_DUP_ENTRY") {
                return interaction.reply({
                    content: "You have already registered for this event. I will notify you when it's due!",
                    ephemeral: true
                });
            } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
                return interaction.reply({
                    content: "Seems like this event does not exist anymore. It might have been deleted or canceled already.",
                    ephemeral: true
                });
            } else return interaction.reply({
                content: "Something went wrong while registering you for this event. Please try again later.",
                ephemeral: true
            });
        });
}

module.exports = {
    "signUp": signUp
}

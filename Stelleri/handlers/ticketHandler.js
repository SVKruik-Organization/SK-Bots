/**
 * Close the ticket channel where the button was pressed.
 * @param {object} interaction Discord Interaction Object
 */
function closeChannel(interaction) {
    const cooldown = 5000;
    interaction.message.edit({
        content: `Alright, I will close this channel in \`${cooldown / 1000}\` seconds.`,
        components: []
    });
    setTimeout(() => {
        interaction.channel.delete();
    }, cooldown);
}

module.exports = {
    "closeChannel": closeChannel
}

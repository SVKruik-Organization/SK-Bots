/**
 * Close the ticket channel where the button was pressed.
 * @param {object} interaction Discord Interaction Object
 */
function closeChannel(interaction) {
    const cooldown = 5000;
    const message = `Alright, I will close this channel in \`${cooldown / 1000}\` seconds.`
    interaction.message.edit({
        content: message,
        components: []
    });
    interaction.channel.send({ content: message });
    setTimeout(() => interaction.channel.delete(), cooldown);
}

module.exports = {
    "closeChannel": closeChannel
}

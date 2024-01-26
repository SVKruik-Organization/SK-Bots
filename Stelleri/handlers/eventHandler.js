const fs = require('node:fs');
const path = require('node:path');

/**
 * Initialise the Event Handler, and load all the event.
 * @param {object} client Discord Client Object
 * @returns On error, else nothing.
 */
function init(client) {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else client.on(event.name, (...args) => event.execute(...args));
    }
}

module.exports = {
    "init": init
}
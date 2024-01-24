const { Events } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const rawDate = modules.getDate();
const date = rawDate.date;
const time = rawDate.time;

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute() {
        setTimeout(() => {
            modules.log(`\n\nSession started on ${time}, ${date}.\n${config.general.name} is now online!\n\n\t------\n`, "info");
        }, 1000);
    },
};
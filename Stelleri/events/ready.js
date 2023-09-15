const { Events } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const date = modules.getDate().date;
const time = modules.getDate().time;

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute() {
		setTimeout(() => {
			modules.log(`\n\nSession started on ${time}, ${date}.\n${config.general.name} is now online!\n\t------\n`, "info");
		}, 1000);
	},
};
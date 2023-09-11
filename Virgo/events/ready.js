const { Events } = require('discord.js');
const fs = require("fs");
const commands = fs.readdirSync("./commands").length;
const config = require("../assets/config.js");

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {

		var today = new Date();
		var m = String(today.getMinutes()).padStart(2, '0');
		var hh = String(today.getHours()).padStart(2, '0');
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0');
		var yyyy = today.getFullYear();
		today = `${hh}:${m}, ${dd}/${mm}/${yyyy}`;

		console.log(`Succesfully loaded ${commands} files.`);
		console.log(`Session started on ${today}.\n`);
		console.log(`${config.general.name} is now online!\n`);
		console.log(`\t------\n`);
	},
};
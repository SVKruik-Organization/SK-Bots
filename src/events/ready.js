const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		const fs = require("fs");
		const commands = fs.readdirSync("./commands").length;

		var today = new Date();
		var m = String(today.getMinutes()).padStart(2, '0');
		var hh = String(today.getHours()).padStart(2, '0');
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0');
		var yyyy = today.getFullYear();

		today = `${hh}:${m}, ${dd}/${mm}/${yyyy}`;

		console.log(`Succesfully loaded ${commands} files.`);
		console.log(`Session started on ${today}.\n`);
		console.log(`Stelleri is now online!\n`);
	},
};
const { Events } = require('discord.js');
const fs = require("fs");
const commands = fs.readdirSync("./commands").length;
const modules = require('..');
const dateInfo = modules.getDate();
const date = dateInfo.date;
const time = dateInfo.time;

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute() {
		console.log(`Succesfully loaded ${commands} files.`);
		console.log(`Session started on ${time}, ${date}.\n`);
		console.log(`Stelleri is now online!\n`);
		console.log(`\t------\n`);

		fs.appendFile(`./logs/${date}.log`, `\nSuccesfully loaded ${commands} files.\nSetup complete.\nStelleri is now online!\n\t------\n\n`, (err) => {
			if (err) console.log(`${time} [ERROR] Error appending to log file.`);
		});
	},
};
const { Events } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
		if (message.author.id === config.general.clientId) return;
		modules.database.query(`UPDATE tier SET xp = xp + ${config.tier.normalMessage} WHERE snowflake = '${message.author.id}';`)
			.catch(() => {
				return modules.log(`XP increase unsuccessful, ${message.author.username} does not have an account yet.`, "warning");
			});
	}
};
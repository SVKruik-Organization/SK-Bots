const { Events } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
		if (config.general.clientId.includes(message.author.id)) return;
		modules.database.query("UPDATE tier SET xp = xp + ? WHERE snowflake = ?; SELECT xp, level FROM tier WHERE snowflake = ?;",
			[config.tier.normalMessage, message.author.id, message.author.id])
			.then((data) => {
				if (data[1][0].xp >= (2 * (data[1][0].level + 1) + 30)) {
					modules.database.query("UPDATE tier SET level = level + 1, xp = 0 WHERE snowflake = ?;", [message.author.id])
						.then(() => {
							const newLevel = data[1][0].level + 1;
							const channel = modules.client.channels.cache.get(message.channelId);
							channel.send({ content: `Nice! <@${message.author.id}> just leveled up and reached level ${newLevel}! 🎉` });
						}).catch(() => {
							return modules.log(`XP increase unsuccessful, ${message.author.username} does not have an account yet.`, "warning");
						});
				};
			}).catch(() => {
				return modules.log(`XP increase unsuccessful, ${message.author.username} does not have an account yet.`, "warning");
			});
	}
};
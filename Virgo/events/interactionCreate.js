const { Events } = require('discord.js');
const modules = require('..');
const { Collection } = require('discord.js');
const config = require('../assets/config.js');
const fs = require('fs');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;
		fs.readFile('../users.json', 'utf-8', (err, jsonData) => {
			if (err) {
				return console.error('Error reading file:', err);
			} else {
				const data = JSON.parse(jsonData);

				if (!data.superUsers.includes(interaction.user.id) && data.blockedUsers.includes(interaction.user.id)) {
					modules.log(`${interaction.user.username} tried using || ${interaction.commandName} || but was unable to because they are blacklisted.`, "info");
					return interaction.reply({ content: 'You are not allowed to use my commands. Contact the moderators to appeal if you think this is a mistake.', ephemeral: true });
				};

				const command = interaction.client.commands.get(interaction.commandName);
				if (!command) return modules.log(`No command matching ${interaction.commandName} was found.`, "warning");

				if (!data.superUsers.includes(interaction.user.id)) {
					const { cooldowns } = modules.client;
					if (!cooldowns.has(command.data.name))
						cooldowns.set(command.data.name, new Collection());

					const now = Date.now();
					const timestamps = cooldowns.get(command.data.name);
					const defaultCooldownDuration = 3;
					const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

					if (timestamps.has(interaction.user.id)) {
						const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
						if (now < expirationTime) {
							const expiredTimestamp = Math.round(expirationTime / 1000);
							return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
						};
					};

					timestamps.set(interaction.user.id, now);
					setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
				};

				try {
					command.execute(interaction);
				} catch (error) {
					modules.log(`There was an error while executing || ${interaction.commandName} ||`, "error");
					interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
					console.log(error);
				};

				modules.database.query("UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = ?; UPDATE tier SET xp = xp + ? WHERE snowflake = ?;",
				[interaction.user.id, config.tier.slashCommand, interaction.user.id])
					.catch(() => {
						return log(`Command usage increase unsuccessful, ${interaction.user.username} does not have an account yet.`, "warning");
					});

				modules.log(`${interaction.user.username} used || ${interaction.commandName} ||`, "info");
			};
		});
	}
};
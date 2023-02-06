const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shutdown')
		.setDescription('Turn the bot off.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption(option => option.setName('pincode').setDescription('Your 4-digit pincode you chose when registering your account.').setRequired(true)),
	async execute(interaction) {
		const modules = require('..');
		const snowflake = interaction.user.id;
		const inputPincode = interaction.options.getString('pincode');

		modules.database.promise()
			.execute(`SELECT pincode AS 'pin' FROM user WHERE snowflake = '${snowflake}';`)
			.then(async ([data]) => {
				const dataPincode = data[0].pin;

				if (inputPincode == dataPincode) {
					await modules.database.promise()
						.execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
						.then(async () => {
							await interaction.reply("Logging off. Bye!");
							process.exit();
						}).catch(err => {
							return console.log("Command usage increase unsuccessful, user does not have an account yet.");
						});
				} else {
					await interaction.reply("Your pincode is not correct. If you forgot your pincode, you can request it with `/pincode`.");
				};
			}).catch(async err => {
				await interaction.reply("Something went wrong while shutting down the bot.");
			});
	},
};
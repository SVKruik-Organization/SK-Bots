const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Give yourself a custom role with your own color.')
        .addStringOption(option => option.setName('hex').setDescription('The HEX code for your color. For example: 000000. Hasthag prefix is not needed.').setRequired(true).setMinLength(7).setMaxLength(7)),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const color = await interaction.options.getString('hex');
        const regex = "^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$";
        const role = interaction.guild.roles.cache.find(role => role.name === interaction.user.username);
        const guild = modules.client.guilds.cache.get(config.general.guildId);
        const position = guild.roles.cache.size - 2

        modules.database.promise()
            .execute(`SELECT id FROM user WHERE snowflake = '${snowflake}';`)
            .then(async () => {
                if (role == undefined) {
                } else {
                    await role.delete();
                };

                if (color.match(regex)) {
                    await interaction.guild.roles.create({
                        position: position,
                        name: interaction.user.username,
                        color: color
                    }).then(async () => {
                        const role = guild.roles.cache.find((r) => r.name === interaction.user.username);
                        await guild.members.fetch(snowflake).then(async (user) => {
                            user.roles.add(role);
                        });

                        await interaction.reply(`\`${color}\` -- great color! You look awesome!`);
                    }).catch(async err => {
                        await interaction.reply({ content: "Something went wrong while creating your role. Please try again later.", ephemeral: true });
                    });
                } else {
                    await interaction.reply({ content: "Your color is invalid. Make sure your color is in HEX format, like so: `000000`. Hasthag prefix is not needed.", ephemeral: true });
                };
            }).catch(async err => {
                await interaction.reply({ content: "This command requires you to have an account. Create an account with the `/register` command.", ephemeral: true });
            });
    },
};
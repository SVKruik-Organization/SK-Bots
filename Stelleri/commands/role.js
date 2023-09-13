const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const modules = require('..');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Give yourself a custom role with your own color.')
        .addStringOption(option => option.setName('hex').setDescription('The HEX code for your color. For example: 000000. Hasthag prefix is not needed.').setRequired(true).setMinLength(6).setMaxLength(6)),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const color = await interaction.options.getString('hex');
        const regex = "^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$";
        const role = interaction.guild.roles.cache.find(role => role.name === interaction.user.username);
        const guild = modules.client.guilds.cache.get(interaction.guildId);
        const position = guild.roles.cache.size - config.general.highPowerRoles;

        /**
         * Convert a HEX color to an integer value.
         * @param {string} hex The hex color to be converted. Without the '#'.
         * @returns The integer value.
         */
        function hexToInt(hex) {
            return parseInt(hex, 16);
        };

        modules.database.promise()
            .execute(`SELECT id FROM user WHERE snowflake = '${snowflake}';`)
            .then(async () => {
                if (role) await role.delete();
                if (color.match(regex)) {
                    await interaction.guild.roles.create({
                        position: position,
                        name: interaction.user.username,
                        color: hexToInt(color)
                    }).then(async () => {
                        const role = guild.roles.cache.find((r) => r.name === interaction.user.username);
                        await guild.members.fetch(snowflake).then(async (user) => {
                            user.roles.add(role);
                        });
                        await interaction.reply(`\`#${color}\` -- great color! You look awesome!`);
                    }).catch(async (err) => {
                        console.log(err);
                        await interaction.reply({ content: "Something went wrong while creating your role. Please try again later.", ephemeral: true });
                    });
                } else {
                    await interaction.reply({ content: "Your color is invalid. Make sure your color is in HEX format, like so: `000000`. Hasthag prefix is not needed.", ephemeral: true });
                };
            }).catch(async (err) => {
                console.log(err);
                await interaction.reply({ content: "This command requires you to have an account. Create an account with the `/register` command.", ephemeral: true });
            });
    },
};
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

const commands = [];
for (const file of commandFiles) {
    try {
        if (file === "reload.js") continue;
        const command = require(`../commands/${file}`);
        commands.push(command.data.toJSON());
    } catch { console.error };
}

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload all global commands.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await rest.put(Routes.applicationCommands(config.general.clientId), { body: commands })
            .then(() => {
                interaction.reply({
                    content: "Reloaded all commands.",
                    ephemeral: true
                });
            }).catch(() => {
                interaction.reply({
                    content: "Something went wrong while reloading the commands. Please try again later.",
                    ephemeral: true
                });
            });
    }
};
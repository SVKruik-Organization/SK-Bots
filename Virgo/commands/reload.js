const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../assets/config.js');
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const userUtils = require('../utils/user.js');
const modules = require('..');
const logger = require('../utils/logger.js');

const commands = [];
for (const file of commandFiles) {
    try {
        if (file === "reload.js") continue;
        const command = require(`../commands/${file}`);
        commands.push(command.data.toJSON());
    } catch(error) {
        logger.error(error);
    }
}

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('reload')
        .setNameLocalizations({
            nl: "herladen"
        })
        .setDescription('Reload all commands.')
        .setDescriptionLocalizations({
            nl: "Herlaadt all commando's."
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        try {
            // Permission Validation
            if (interaction.user.id !== config.general.creatorId) return interaction.reply({
                content: `This command is reserved for my developer, <@${config.general.creatorId}>, only. If you are experiencing problems with (one of) the commands, please contact him.`,
                ephemeral: true
            });

            modules.database.query("SELECT * FROM guild WHERE disabled = 0;")
                .then(async (queryData) => {
                    for (let i = 0; i < queryData.length; i++) {
                        const data = await rest.put(
                            Routes.applicationCommands(config.general.clientId),
                            { body: commands },
                        );
                        logger.log(`Successfully reloaded ${data.length} commands for guild ${queryData[i].name}.`);
                    }
                    return interaction.reply({
                        content: `Successfully reloaded all commands for all servers ${config.general.name} is in.`,
                        ephemeral: true
                    });
                }).catch(() => {
                    return interaction.reply({
                        content: `Something went wrong while reloading the commands.`,
                        ephemeral: true
                    });
                });
        } catch (error) {
            logger.error(error);
        }
    }
};
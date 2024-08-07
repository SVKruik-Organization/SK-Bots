const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith(''));
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const modules = require('..');
const logger = require('../utils/logger');

const commands = [];
for (const file of commandFiles) {
    try {
        if (file === "reload.js") continue;
        const command = require(`../commands/${file}`);
        if (command && ('data' in command)) {
            commands.push(command.data.toJSON());
        } else logMessage(`Reload error at ${file}`, "error");
    } catch (error: any) {
        logError(error);
    }
}

export default {
    cooldown: cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('reload')
        .setNameLocalizations({
            nl: "herladen"
        })
        .setDescription('Reload all commands.')
        .setDescriptionLocalizations({
            nl: "Herlaadt all commando's."
        })
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Permission Validation
            if (interaction.user.id !== general.authorId) return interaction.reply({
                content: `This command is reserved for my developer, <@${general.authorId}>, only. If you are experiencing problems with (one of) the commands, please contact him.`,
                ephemeral: true
            });

            database.query("SELECT * FROM guild WHERE disabled = 0 AND production = 0;")
                .then(async (queryData) => {
                    for (let i = 0; i < queryData.length; i++) {
                        const data = await rest.put(
                            Routes.applicationGuildCommands(general.clientId, queryData[i].snowflake),
                            { body: commands },
                        );
                        logMessage(`Successfully reloaded ${data.length} Guild commands for Guild ${queryData[i].name}.`);
                    }
                    return interaction.reply({
                        content: `Successfully reloaded all Guild commands for all servers ${general.name} is in.`,
                        ephemeral: true
                    });
                }).catch((error: any) => {
                    logError(error);
                    return interaction.reply({
                        content: `Something went wrong while reloading the Guild commands.`,
                        ephemeral: true
                    });
                });
        } catch (error: any) {
            logError(error);
        }
    }
};
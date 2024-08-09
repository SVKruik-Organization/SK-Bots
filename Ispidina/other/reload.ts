import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { general, cooldowns } from '../src/config.js';
import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
const commandFiles = fs.readdirSync(`${__dirname}/../commands`).filter(file => file.endsWith('.js'));
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN as string);
import { database } from '../src/index.js';
import { logError, logMessage } from '../src/utils/logger.js';
import { Command, CommandWrapper } from '../src/types.js';

const commands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [];
for (const file of commandFiles) {
    try {
        if (file === "reload.js") continue;
        const command: CommandWrapper = require(`${__dirname}/../commands/${file}`);
        commands.push(command.default.data.toJSON());
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
            if (interaction.user.id !== general.authorId) return await interaction.reply({
                content: `This command is reserved for my developer, <@${general.authorId}>, only. If you are experiencing problems with (one of) the commands, please contact him.`,
                ephemeral: true
            });

            const queryData: Array<{ snowflake: string, name: string }> = await database.query("SELECT snowflake, name FROM guild WHERE disabled = 0 AND production = 0;")
            for (let i = 0; i < queryData.length; i++) {
                const data: Array<any> = await rest.put(
                    Routes.applicationGuildCommands(general.clientId, queryData[i].snowflake),
                    { body: commands },
                ) as Array<any>;
                logMessage(`Successfully reloaded ${data.length} Guild commands for Guild ${queryData[i].name}.`, "info");
            }
            return await interaction.reply({
                content: `Successfully reloaded all Guild commands for all servers ${general.name} is in.`,
                ephemeral: true
            });
        } catch (error: any) {
            logError(error);
            return await interaction.reply({
                content: `Something went wrong while reloading the Guild commands.`,
                ephemeral: true
            });
        }
    },
    autocomplete: undefined
} satisfies Command;
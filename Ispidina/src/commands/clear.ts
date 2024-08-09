import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { cooldowns } from '../config.js';
import { checkAdmin } from '../utils/user.js';
import { logError } from '../utils/logger.js';
import { Command } from '../types.js';

export default {
    cooldown: cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('clear')
        .setNameLocalizations({
            nl: "opruimen"
        })
        .setDescription('Bulk delete messages inside the current channel.')
        .setDescriptionLocalizations({
            nl: "Berichten in bulk verwijderen binnen het huidige kanaal."
        })
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addIntegerOption(option => option
            .setName('amount')
            .setNameLocalizations({
                nl: "hoeveelheid"
            })
            .setDescription('Amount of messages to delete.')
            .setDescriptionLocalizations({
                nl: "De hoeveelheid berichten die verwijderd moeten worden."
            })
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(50)),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Permission Validation
            if (!interaction.guild) return;
            if (!(await checkAdmin(interaction))) return await interaction.reply({
                content: `You do not have the required permissions to perform this elevated command. Please try again later, or contact moderation to receive elevated permissions.`,
                ephemeral: true
            });

            // Setup
            const amount: number = interaction.options.getInteger("amount") as number;
            await interaction.reply({
                content: `Deleting ${amount} messages . . .`,
                ephemeral: true
            });

            // Bulk Delete
            setTimeout(async () => {
                interaction.deleteReply();
                if (!interaction.channel) return;
                try {
                    const channel: TextChannel = interaction.channel as TextChannel;
                    await channel.bulkDelete(amount);
                } catch (error: any) {
                    interaction.editReply({
                        content: "Atleast one of the messages you are trying to delete is older than \`14\` days. Discord is not allowing me to do that, so you will have to delete them manually (or lower your clear amount to potentially exclude the erroneous message).",
                    });
                }
            }, 1000);
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
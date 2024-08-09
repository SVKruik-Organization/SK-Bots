import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ChatInputCommandInteraction, User } from 'discord.js';
import { cooldowns, urls } from '../config.js';
import { checkOperator } from '../utils/user.js';
import { logError } from '../utils/logger.js';
import { database } from '../index.js';
import { Command, OperatorCheck } from '../types.js';

export default {
    cooldown: cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('operator')
        .setNameLocalizations({
            nl: "operator"
        })
        .setDescription('Controls for the Operator system.')
        .setDescriptionLocalizations({
            nl: "Bediening voor het Operator systeem."
        })
        .setDMPermission(false)
        .addSubcommand(option => option
            .setName('modify')
            .setNameLocalizations({
                nl: "modificeren"
            })
            .setDescription("Add or remove Operators from your team(s).")
            .setDescriptionLocalizations({
                nl: "Operators toevoegen aan of verwijderen uit uw team(s)."
            })
            .addUserOption(option => option
                .setName('target')
                .setNameLocalizations({
                    nl: "gebruiker"
                })
                .setDescription('The target member.')
                .setDescriptionLocalizations({
                    nl: "De betreffende gebruiker."
                })
                .setRequired(true)))
        .addSubcommand(option => option
            .setName('overview')
            .setNameLocalizations({
                nl: "overzicht"
            })
            .setDescription("See an overview of members and current plan.")
            .setDescriptionLocalizations({
                nl: "Bekijk een overzicht aan leden en uw actieve abonnement."
            })),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Permission Validation
            const operatorData: OperatorCheck = await checkOperator(interaction);
            if (!operatorData.hasPermissions) return;

            // Setup
            const actionType: string = interaction.options.getSubcommand();
            const targetMember: User | null = interaction.options.getUser("target");
            if (targetMember && targetMember.id === interaction.user.id) return await interaction.reply({
                content: `You cannot ${actionType} yourself ${actionType === "add" ? "to" : "from"} a team that you are already a member of via commands. To transfer ownership and use other advanced operations, please use the [SK Commander](${urls.skCommander}) application or the [website](${urls.website}).`,
                ephemeral: true
            });

            try {
                const data: Array<{ team_tag: string, edition: string, username: string }> = await database.query("SELECT et.team_tag, et.edition, username FROM operator_team et LEFT JOIN operator_member em ON et.team_tag = em.team_tag LEFT JOIN operator_member em2 ON em.team_tag = em2.team_tag LEFT JOIN operator ON em2.snowflake = operator.snowflake WHERE em.snowflake = ? AND em2.team_owner = 1;", [interaction.user.id]);
                if (!data.length) return await interaction.reply({
                    content: `You are not in any teams right now. You can join a team when you get invited, or create a new one yourself on the [website](${urls.website}).`,
                    ephemeral: true
                });

                const stringOptions: Array<StringSelectMenuOptionBuilder> = [];
                for (let i = 0; i < data.length; i++) {
                    stringOptions.push(new StringSelectMenuOptionBuilder()
                        .setLabel(`Team ${data[i].team_tag}`)
                        .setDescription(`Edition: ${data[i].edition}, Owner: ${data[i].username}`)
                        .setValue(`operatorTeamSelect-${data[i].team_tag}-${actionType}-${targetMember ? targetMember.id : null}`));
                }

                const select: StringSelectMenuBuilder = new StringSelectMenuBuilder()
                    .setCustomId('operatorSelectMenu')
                    .setPlaceholder('Make a selection.')
                    .addOptions(stringOptions);

                const replyContent: string = (actionType === "overview" ? "Select which team you want to view the overview of." : `Select for which team you want to manage <@${targetMember?.id}>.`);
                await interaction.deferReply({ ephemeral: true });
                await interaction.editReply({
                    content: `${replyContent} Note that you have to be the owner of the team in order to perform this action.`,
                    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)]
                });
            } catch (error: any) {
                logError(error);
                return await interaction.reply({
                    content: "Something went wrong while retrieving your teams. Please try again later.",
                    ephemeral: true
                });
            }
        } catch (error: any) {
            logError(error);
        }
    },
    autocomplete: undefined
} satisfies Command;
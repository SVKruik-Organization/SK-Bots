import { ButtonInteraction, ChatInputCommandInteraction, Message, StringSelectMenuInteraction } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { logError, logMessage } from '../utils/logger';
import { database } from '..';
import { dueAdd } from '../utils/due';
import { getDate } from '../utils/date';

/**
 * Returns a set of disabled buttons.
 * @param interaction Discord Interaction Object
 * @returns Disabled buttons.
 */
export function disabledButtons(interaction: ChatInputCommandInteraction): ActionRowBuilder {
    const confirmLabel: string = interaction.message.components[0].components[1].data.label;

    const disabledCancel: ButtonBuilder = new ButtonBuilder()
        .setCustomId('cancelBoosterActivate')
        .setLabel(`Cancel`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const disabledConfirm: ButtonBuilder = new ButtonBuilder()
        .setCustomId('confirmBoosterActivate')
        .setLabel(confirmLabel)
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

    return new ActionRowBuilder().addComponents(disabledCancel, disabledConfirm);
}

/**
 * Send confirmation message.
 * @param interaction Discord Interaction Object
 * @param value Type of XP-Booster to activate.
 * @returns On insufficient funds.
 */
export function confirmActivateDialog(interaction: StringSelectMenuInteraction, value: string): Promise<Message> {
    const boosterType: string = value.split("-")[0];
    const boostersLeft: number = parseInt(value.split("-")[1]);

    if (boostersLeft === 0) {
        return interaction.update({
            content: `Unfortunately, you do not have any XP-Boosters of this type (\`${boosterType}\`) left. Check your available XP-Boosters with the \`/inventory overview\` command.`,
            components: [],
            ephemeral: true
        });
    }

    const cancel: ButtonBuilder = new ButtonBuilder()
        .setCustomId('cancelBoosterActivate')
        .setLabel(`Cancel`)
        .setStyle(ButtonStyle.Secondary);
    const confirm: ButtonBuilder = new ButtonBuilder()
        .setCustomId('confirmBoosterActivate')
        .setLabel(`Activate ${boosterType}`)
        .setStyle(ButtonStyle.Success);

    return interaction.update({
        content: `Thank you for your selection. Are you sure you want to activate ${boosterType}?`,
        components: [new ActionRowBuilder().addComponents(cancel, confirm)],
        ephemeral: true
    });
}

/**
 * Activate a XP-Booster.
 * @param interaction Discord Interaction Object
 * @returns On error.
 */
export function confirmActivate(interaction: ButtonInteraction): Promise<Message> {
    try {
        const boosterType: string = interaction.message.components[0].components[1].data.label.split(" ")[1];

        // Sanitizing against SQL injection
        let row: string | null = null;
        if (boosterType === "xp15") {
            row = boosterType;
        } else if (boosterType === "xp50") row = boosterType;
        if (!row) return interaction.update({
            content: `Something went wrong while preparing the systems. Please try again later.`,
            components: [],
            ephemeral: true
        });

        database.query(`UPDATE user_inventory SET ${row} = ${row} - 1, xp_active = ?, xp_active_expiry = DATE_ADD(NOW(), INTERVAL 1 DAY) WHERE snowflake = ?;`, [boosterType, interaction.user.id])
            .then((data) => {
                // Validation
                if (!data.affectedRows) return interaction.reply({
                    content: "This command requires you to have an account. Create an account with the `/register` command.",
                    ephemeral: true
                });

                logMessage(`'${interaction.user.username}@${interaction.user.id}' has activated a XP-Booster ${boosterType} in guild '${interaction.guild ? interaction.guild.name : "DM_COMMAND"}@${interaction.guild ? interaction.guild.id : "DM_COMMAND"}'.`, "info");
                // + 24 Hours
                const newDate: Date = getDate(null, null).today;
                newDate.setDate(newDate.getDate() + 1);
                dueAdd(interaction, boosterType, newDate, null);
                interaction.update({
                    content: `Success! Your XP-Booster has been activated for 24 hours, and is applied to all gained Experience.`,
                    components: [disabledButtons(interaction)],
                    ephemeral: true
                });
            }).catch((error: any) => {
                logError(error);
                return interaction.update({
                    content: `Something went wrong while updating your information. Please try again later.`,
                    components: [],
                    ephemeral: true
                });
            });
    } catch (error: any) {
        logError(error);
    }
}

/**
 * Cancel activation of a XP-Booster.
 * @param interaction Discord Interaction Object
 */
export function cancelActivate(interaction: ChatInputCommandInteraction): void {
    return interaction.update({
        content: `Alright, no problem. 'Till next time!`,
        components: [disabledButtons(interaction)],
        ephemeral: true
    });
}

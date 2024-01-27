const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.C,
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Spend your Bits on cool perks or cosmetics.'),
    async execute(interaction) {
        modules.database.query("SELECT * FROM economy WHERE snowflake = ?;", [interaction.user.id])
            .then((data) => {
                console.log(data);
                interaction.reply({
                    content: "Received, command is WIP.",
                    ephemeral: true
                });
            }).catch(() => {
                interaction.reply({
                    content: "Something went wrong while retrieving your account. Please try again later.",
                    ephemeral: true
                });
            });
    }
};
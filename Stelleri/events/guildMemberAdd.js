const { Events } = require('discord.js');
const config = require('../assets/config.js');
const embed = require('../utils/embed.js');
const { findUserById } = require('../utils/guild.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(event) {
        const welcomeEmbed = embed.create(`Welcome to ${event.guild.name}!`, "Information", event, [
            { "name": "About Me", "value": `I am <@${config.general.clientId}>, a General Purpose bot made by <@${config.general.creatorId}>. I am in charge of the Level and Economy system, and keeping the server tidy. I also have fun commands, like 'Rock, Paper, Scissor' and utility commands to make managment easier.` },
            { "name": "Level & Economy", "value": `Participating is entirely up to you! By default, you are not in this program. If you would like to opt-in, use the \`/register\` command! You can collect your daily reward by using \`/daily\` command. With Bits you can purschase cosmetics (role colors) and XP-Boosters.` },
            { "name": "Concluding", "value": `Well that's all from me I guess, if you have questions or concerns, you can contact <@${config.general.creatorId}> and the moderators of **${event.guild.name}**. We hope you like your stay, and GLHF!` }
        ]);
        const user = findUserById(event.user.id);
        if (user) user.send({ embeds: [welcomeEmbed] });
    }
};
const { Events } = require('discord.js');
const config = require('../config.js');
const embedConstructor = require('../utils/embed.js');
const userUtils = require('../utils/user.js');
const modules = require('..');
const logger = require('../utils/logger.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(event) {
        modules.database.query("SELECT welcome FROM guild_settings WHERE guild_snowflake = ?;", [event.guild.id])
            .then((data) => {
                if (data.length > 0 && data[0].welcome) {
                    const welcomeEmbed = embedConstructor.create(`Welcome to ${event.guild.name}!`, "We are glad to have you!", event.user, [
                        { "name": "About Me", "value": `I am <@${config.general.clientId}>, a General Purpose bot made by <@${config.general.authorId}>. I am in charge of the Level and Economy system, and keeping the server tidy. I also have fun commands, like 'Rock, Paper, Scissor' and utility commands to make managment easier.` },
                        { "name": "Level & Economy", "value": `Participating is entirely up to you! By default, you are not in this program. If you would like to opt-in, use the \`/register\` command! You can collect your daily reward by using \`/daily\` command. With Bits you can purchase cosmetics (role colors) and XP-Boosters.` },
                        { "name": "Concluding", "value": `Well that's all from me I guess, if you have questions or concerns, you can contact <@${config.general.authorId}> and the moderators of **${event.guild.name}**. We hope you like your stay, and GLHF!` }
                    ], []);
                    const user = userUtils.findUserById(event.user.id);
                    if (user) user.send({ embeds: [welcomeEmbed] });
                } else return logger.log(`Guild '${event.guild.name}@${event.guild.id}' settings not found, welcome message could not be sent.`, "warning");
            }).catch((error) => {
                logger.error(error);
                return logger.log(`Sending welcome message for guild '${event.guild.name}@${event.guild.id}' went wrong.`, "warning");
            });
    }
};
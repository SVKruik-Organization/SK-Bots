const { EmbedBuilder } = require('discord.js');
const { time } = require('@discordjs/formatters');
const express = require('express');
const logger = require('../utils/logger.js');
const router = express.Router();
const modules = require('..');
const config = require('../assets/config.js');

router.post('/release', async function (req, res) {
    try {
        if (!req.headers.authorization) return res.sendStatus(401)
        if (req.headers.authorization.split(" ")[1] !== process.env.BROADCAST_PASSWORD) return res.sendStatus(401);
        if (req.body.draft) return res.sendStatus(400);
        if (!req.body.author) return res.sendStatus(400);

        const release = {
            // Author Information
            "author_username": req.body.author.login,
            "author_avatar": req.body.author.avatar_url,
            "author_url": req.body.author.html_url,

            // Release Information
            "release_name": req.body.name,
            "release_version": req.body.tag_name,
            "release_description": req.body.body,
            "release_url": req.body.html_url,
            "release_prerelease": req.body.prerelease,
            "release_branch": req.body.target_commitish,
            "release_date": new Date(req.body.published_at)
        }

        /**
         * Format the raw release description by length and adding a link to the release.
         * @param {string} input The raw description.
         * @returns The formatted description with a link to the release.
         */
        function format(input) {
            let processedInput = input;
            processedInput = processedInput.substring(0, 219);
            processedInput += ` . . . [see full details](${release.release_url})`;
            return processedInput;
        }

        const embed = new EmbedBuilder()
            .setColor(config.general.color)
            .setTitle("New version released!")
            .setDescription(`New features will soon be shipped to <@${config.general.clientId}> in your server.`)
            .setAuthor({ name: release.author_username, iconURL: release.author_avatar, url: release.author_url })
            .setURL(release.release_url)
            .addFields(
                { name: 'Description', value: format(release.release_description) },
                { name: 'Note', value: `While it does not happen often, there might be some downtime while we update everything. We strive for a smooth transition, but if any problems do arise, don't hesitate to reach out to <@${config.general.authorSnowflake}>.` })
            .addFields(
                { name: 'Version', value: `\`${release.release_version}\``, inline: true },
                { name: 'Published On', value: time(release.release_date), inline: true },
                { name: 'Branch', value: `\`${release.release_branch}\``, inline: true })
            .setTimestamp()
            .setFooter({ text: `Embed created by ${config.general.name}` });

        const guilds = await modules.database.query("SELECT channel_broadcast FROM guild LEFT JOIN guild_settings ON guild_settings.guild_snowflake = snowflake WHERE broadcast_update = 1;");
        for (let i = 0; i < guilds.length; i++) {
            if (!guilds[i].channel_broadcast) continue;
            const channel = await modules.client.channels.fetch(guilds[i].channel_broadcast);
            if (channel) channel.send({ embeds: [embed] });
        }
        res.sendStatus(200);
        logger.log(`Successfully broadcasted the release information for ${release.release_version} to all participating guilds.`, "info");
    } catch (error) {
        logger.error(error);
        return res.sendStatus(500);
    }
});

module.exports = router;

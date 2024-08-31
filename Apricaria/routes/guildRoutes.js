const express = require('express');
const router = express.Router();
const jwtUtils = require('../utils/jwt.js');
const modules = require('..');
const guildUtils = require('../utils/guild.js');
const logger = require('../utils/logger.js');

router.get('/picture', jwtUtils.authenticateJWT, async function (req, res) {
    const guilds = req.body;
    const pictures = [];
    for (let i = 0; i < guilds.length; i++) {
        try {
            const guild = await modules.client.guilds.fetch(guilds[i]);
            if (guild) pictures.push(guild.iconURL());
        } catch (error) {
            if (error.status === 404) {
                pictures.push(`${error.status}`);
            } else return res.status(error.status).send({ message: error.message });
        }
    }

    res.status(200).send({ picture_urls: pictures });
});

module.exports = router;

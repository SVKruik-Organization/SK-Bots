const express = require('express');
const router = express.Router();
const jwtUtils = require('../utils/jwt.js');
const { findUserById } = require('../utils/user.js');
const config = require('../assets/config.js');
const fs = require('node:fs');
const { EmbedBuilder } = require('discord.js');

router.post('/cpu', jwtUtils.authenticateInternalComms, async function (req, res) {
    const data = req.body;
    if (!data || !("cpuData" in data) || !("temperatureData" in data)) return res.sendStatus(400);
    const sensorSettings = JSON.parse(fs.readFileSync(__dirname + '/../settings/sensors.json', "utf-8"));

    if (data.temperatureData.main > 45 && sensorSettings.acknowledgeHighTemperature === false) {
        const author = await findUserById(config.general.authorSnowflake);

        const embed = new EmbedBuilder()
            .setColor("#FF4C4C")
            .setTitle("High CPU Temperature Warning")
            .addFields(
                { name: "Model", value: data.cpuData.brand, inline: true },
                { name: "Speed", value: `\`${data.cpuData.speed}\` Ghz`, inline: true },
                { name: "Temperature", value: `\`${data.temperatureData.main}\` °C`, inline: true })
            .setTimestamp()
            .setFooter({ text: "Send '/acknowledge temperature' to suppress." });

        author.send({
            embeds: [embed]
        });
    }
});

module.exports = router;

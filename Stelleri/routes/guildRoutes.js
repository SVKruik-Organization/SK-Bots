const express = require('express');
const router = express.Router();
const jwtUtils = require('../utils/jwt.js');
const modules = require('..');
const guildUtils = require('../utils/guild.js');

router.put('/update/settings', jwtUtils.authenticateJWT, function (req, res) {
    const newGuild = req.body;

    if (newGuild && "snowflake" in newGuild && "xp15" in newGuild && "xp50" in newGuild && "level_up_reward_base" in newGuild && "role_cosmetic_price" in newGuild && "role_cosmetic_power" in newGuild
        && "role_level_power" in newGuild && "role_level_max" in newGuild && "role_level_enable" in newGuild && "role_level_color" in newGuild && "jackpot" in newGuild
        && "welcome" in newGuild && "xp_increase_normal" in newGuild && "xp_increase_slash" in newGuild && "xp_increase_purchase" in newGuild) {
        const snowflake = req.body.snowflake;
        modules.database.query("UPDATE guild_settings SET xp15 = ?, xp50 = ?, level_up_reward_base = ?, role_cosmetic_price = ?, role_cosmetic_power = ?, role_level_power = ?, role_level_max = ?, role_level_enable = ?, role_level_color = ?, jackpot = ?, welcome = ?, xp_increase_normal = ?, xp_increase_slash = ?, xp_increase_purchase = ? WHERE guild_snowflake = ?;",
            [newGuild.xp15, newGuild.xp50, newGuild.level_up_reward_base, newGuild.role_cosmetic_price, newGuild.role_cosmetic_power, newGuild.role_level_power, newGuild.role_level_max, newGuild.role_level_enable, newGuild.role_level_color, newGuild.jackpot, newGuild.welcome, newGuild.xp_increase_normal, newGuild.xp_increase_slash, newGuild.xp_increase_purchase, snowflake])
            .then(() => {
                const filteredGuild = (guildUtils.guilds.filter(guild => guild.guildObject.id === snowflake))[0];
                guildUtils.guilds = guildUtils.guilds.filter(guild => guild.guildObject.id !== snowflake);
                guildUtils.guilds.push({
                    // Guild
                    "guildObject": filteredGuild.guildObject,
                    "name": filteredGuild.name,
                    "operator_id": filteredGuild.operator_id,
                    "operator_name": filteredGuild.operator_name,
                    "channel_admin": filteredGuild.channel_admin,
                    "channel_event": filteredGuild.channel_event,
                    "channel_suggestion": filteredGuild.channel_suggestion,
                    "channel_snippet": filteredGuild.channel_snippet,
                    "channel_rules": filteredGuild.channel_rules,
                    "role_cosmetic_power": filteredGuild.role_cosmetic_power,
                    "role_blinded": filteredGuild.role_blinded,
                    "locale": filteredGuild.guildObject.preferredLocale,
                    "disabled": filteredGuild.disabled,

                    // Settings
                    "xp15": newGuild.xp15,
                    "xp50": newGuild.xp50,
                    "level_up_reward_base": newGuild.level_up_reward_base,
                    "role_cosmetic_price": newGuild.role_cosmetic_price,
                    "role_cosmetic_power": newGuild.role_cosmetic_power,
                    "role_level_power": newGuild.role_level_power,
                    "role_level_max": newGuild.role_level_max,
                    "role_level_enable": newGuild.role_level_enable,
                    "role_level_color": newGuild.role_level_color,
                    "jackpot": newGuild.jackpot,
                    "welcome": newGuild.welcome,
                    "xp_increase_normal": newGuild.xp_increase_normal,
                    "xp_increase_slash": newGuild.xp_increase_slash,
                    "xp_increase_purchase": newGuild.xp_increase_purchase
                });
                return res.sendStatus(200);
            }).catch((error) => {
                console.error(error);
                return res.sendStatus(500);
            });
    } else return res.sendStatus(400);
});

module.exports = router;

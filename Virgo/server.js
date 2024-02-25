// Express Settings
const express = require("express");
const port = process.env.SERVER_PORT;
const app = express();
app.use(express.json());
const prefix = process.env.SERVER_PREFIX;

// Dependencies
const logger = require('./utils/logger.js');
const modules = require('.');
const jwtSecret = process.env.SERVER_SECRET;
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const jwtUtils = require('./utils/jwt.js');

// Import Other Routes
const guildRoutes = require('./routes/guildRoutes.js');
app.use(`${prefix}/guilds`, guildRoutes);

// Init
app.listen(port, () => {
    logger.log(`Update server listening on port ${port}.`, "info");
});

// Default
app.get(prefix, jwtUtils.authenticateJWT, (req, res) => {
    res.json({ message: "Default Endpoint" });
});

// JWT Login
app.post(`${prefix}/login`, (req, res) => {
    const { username, password } = req.body;

    modules.database.query("SELECT id, owner_snowflake, operator.snowflake, password, edition, operator.username AS 'operator_username', user.username AS 'user_username', email, service_tag, operator.date_creation, operator.date_update FROM operator LEFT JOIN user ON operator.snowflake = user.snowflake WHERE operator.username = ?;", [username])
        .then((data) => {
            if (data.length === 0) return res.status(404).send({ message: "Not Found" });
            const rawOperator = data[0];

            modules.client.users.fetch(rawOperator.snowflake).then((userData) => {
                const operator = {
                    "id": rawOperator.id,
                    "owner_snowflake": rawOperator.owner_snowflake,
                    "snowflake": rawOperator.snowflake,
                    "edition": rawOperator.edition,
                    "operator_username": rawOperator.operator_username,
                    "user_username": rawOperator.user_username,
                    "email": rawOperator.email,
                    "service_tag": rawOperator.service_tag,
                    "avatar": userData.avatarURL(),
                    "date_creation": rawOperator.date_creation
                }
                if (CryptoJS.SHA512(password).toString() === rawOperator.password) {
                    const access_token = jwt.sign(operator, jwtSecret, { "expiresIn": process.env.SERVER_SECRET_EXPIRY });
                    return res.json({ access_token });
                } else return res.status(401).send({ message: "Unauthorized" });
            }).catch((error) => {
                return res.sendStatus(error.status);
            });
        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500)
        });
});

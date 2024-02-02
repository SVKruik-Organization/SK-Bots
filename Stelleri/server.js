// Express Settings
const express = require("express");
const port = process.env.SERVER_PORT;
const app = express();
app.use(express.json());
const prefix = process.env.SERVER_PREFIX;

// Dependencies
const logger = require('./utils/logger.js');
const modules = require('.');
const jwtSecret = process.env.SERVER_TOKEN;
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

    modules.database.query("SELECT * FROM operator WHERE username = ?;", [username])
        .then((data) => {
            if (data.length === 0) return res.sendStatus(404);
            const operator = data[0];

            if (CryptoJS.SHA512(password).toString() === operator.password) {
                const accessToken = jwt.sign({ username: operator.username, id: operator.id }, jwtSecret, { "expiresIn": process.env.SERVER_TOKEN_EXPIRY });
                return res.json({ accessToken });
            } else return res.sendStatus(401);
        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500)
        });
});

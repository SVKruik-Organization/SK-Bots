// Dependencies
const express = require("express");
const logger = require('./utils/logger.js');
const config = require('./assets/config.js');

// Express Settings
const port = process.env.SERVER_PORT;
const app = express();
const cors = require("cors");
app.use(express.json());
const prefix = process.env.SERVER_PREFIX;
app.use(logger.apiMiddleware);

// CORS Config
const corsOptions = {
    origin: ["https://platform.stefankruik.com"],
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// Init
app.listen(port, () => {
    logger.log(`Update server listening on port ${port}.`, "info");
});

// Import Other Routes
const guildRoutes = require('./routes/guildRoutes.js');
app.use(`${prefix}/guilds`, guildRoutes);
const broadcastRoutes = require('./routes/broadcastRoutes.js');
app.use(`${prefix}/broadcasts`, broadcastRoutes);

// Default
app.get(prefix, (req, res) => {
    res.json({ message: `Default ${config.general.name} Endpoint` });
});

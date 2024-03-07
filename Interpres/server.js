// Express Settings
const express = require("express");
const port = process.env.SERVER_PORT;
const app = express();
app.use(express.json());
const prefix = process.env.SERVER_PREFIX;

// Dependencies
const logger = require('./utils/logger.js');
const config = require('./assets/config.js');

// Import Other Routes
const gitHubRoutes = require('./routes/gitHubRoutes.js');
app.use(`${prefix}/github`, gitHubRoutes);

// Init
app.listen(port, () => {
    logger.log(`Update server listening on port ${port}.`, "info");
});

// Default
app.get(prefix, (req, res) => {
    res.json({ message: `Default ${config.general.name} Endpoint` });
});

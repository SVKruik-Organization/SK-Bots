const express = require("express");
const logger = require('./utils/logger.js');
const config = require('./assets/config.js');

// Express Settings
const manualPort = process.argv.slice(2)[0];
const port = (manualPort && manualPort.length !== 4 ? process.env.SERVER_PORT : parseInt(manualPort)) || process.env.SERVER_PORT;
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(logger.apiMiddleware);

// CORS Config
const corsOptions = {
    origin: ["https://platform.stefankruik.com"],
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// Import Other Routes
const gitHubRoutes = require('./routes/gitHubRoutes.js');
app.use(`${prefix}/github`, gitHubRoutes);

// Default
app.get("/", (_req, res) => {
    res.json({ message: `Default ${config.general.name} Endpoint` });
});

// Init
app.listen(port, () => {
    logger.log(`${config.general.name} API server listening on port ${port}.`, "info");
});
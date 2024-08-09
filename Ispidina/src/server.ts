import express from "express";
import { logMessage, apiMiddleware } from './utils/logger.js';
import { general } from './config.js';
import cors from "cors";

// Express Settings
const manualPort = process.argv.slice(2)[0];
const port = (manualPort && manualPort.length !== 4 ? process.env.SERVER_PORT : parseInt(manualPort)) || process.env.SERVER_PORT;
const app = express();
app.use(express.json());
app.use(apiMiddleware);

// CORS Config
const corsOptions = {
    origin: ["https://platform.stefankruik.com"],
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// Default
app.get("/", (_req, res) => {
    res.json({ message: `Default ${general.name} Endpoint` });
});

/**
 * Initialize the API server for incoming requests.
 */
export function initServer(): void {
    app.listen(port, () => {
        logMessage(`${general.name} API server listening on port ${port}.`, "info");
    });
}
require('dotenv').config();
const si = require('systeminformation');
const logger = require('./utils/logger');

// Start
logger.log("Started statistics monitor.\n", "info");
processCpuTemperature();
setInterval(async () => await processCpuTemperature(), process.env.TEMPERATURE_INTERVAL);

/**
 * Fetch the CPU temperature and send it to Apricaria or Stelleri.
 * @returns On error.
 */
async function processCpuTemperature() {
    try {
        // Setup
        const url = process.env.STATISTICS_ENDPOINT;
        const temperatureData = await si.cpuTemperature();
        const cpuData = await si.cpu();
        logger.log(`${cpuData.brand} CPU Temperature: ${temperatureData.main}`, (temperatureData.main > process.env.TEMPERATURE_THRESHOLD && cpuData.vendor !== "Apple") ? "warning" : "info");

        // Notify Apricaria or Stelleri
        if (!url) return;
        await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": `Bearer ${process.env.INTERNAL_TOKEN}`
            },
            body: JSON.stringify({
                "temperatureData": temperatureData,
                "cpuData": cpuData
            })
        });
    } catch (error) {
        if (!error.cause && !error.cause.code) return logger.error(error);
        if (error.cause.code === "ECONNREFUSED") {
            logger.log("Apricaria Sensor API offline.", "warning");
        } else if (error.cause.code === "UND_ERR_SOCKET") {
            logger.log("Apricaria Sensor API connection lost.", "warning");
        } else if (error.cause.code === "UND_ERR_HEADERS_TIMEOUT") {
            logger.log("Apricaria Sensor API fetch timed out.", "warning");
        } else return logger.error(error);
    }
}
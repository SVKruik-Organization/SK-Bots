require('dotenv').config();
const si = require('systeminformation');
const logger = require('./utils/logger');
const amqp = require('amqplib');
const os = require('node:os');

// Start
logger.log("Started statistics monitor.\n", "info");
processCpuTemperature();
setInterval(async () => await processCpuTemperature(), process.env.TEMPERATURE_INTERVAL);

/**
 * Fetch the CPU temperature and send it to Apricaria.
 * @returns On error.
 */
async function processCpuTemperature() {
    try {
        // Setup
        const temperatureData = await si.cpuTemperature();
        const cpuData = await si.cpu();
        logger.log(`${cpuData.brand} CPU Temperature: ${temperatureData.main}`, (temperatureData.main > process.env.TEMPERATURE_THRESHOLD && cpuData.vendor !== "Apple") ? "warning" : "info");

        // Notify Apricaria when high temperature
        if (temperatureData.main < process.env.TEMPERATURE_THRESHOLD) return;
        const channel = await (await amqp.connect({
            "protocol": "amqp",
            "hostname": process.env.AMQP_HOST,
            "port": parseInt(process.env.AMQP_PORT),
            "username": process.env.AMQP_USERNAME,
            "password": process.env.AMQP_PASSWORD
        })).createChannel();
        channel.assertExchange("broadcast-bots", "fanout", { durable: false });
        channel.publish("broadcast-bots", "", Buffer.from(JSON.stringify({
            sender: "SK-Bots/Monitor",
            recipient: "SK-Bots/Apricaria",
            triggerSource: "Temperature Sensor",
            reason: "High Tide CPU Temperature",
            task: "Temperature",
            content: {
                "temperatureData": temperatureData,
                "cpuData": cpuData,
                "memoryData": await si.mem(),
                "deviceName": os.hostname()
            },
            timestamp: new Date()
        })));
    } catch (error) {
        logger.error(error);
    }
}
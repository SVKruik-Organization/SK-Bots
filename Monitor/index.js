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
        channel.assertExchange("bot-exchange", "direct", { durable: false });
        channel.publish("bot-exchange", "Apricaria", Buffer.from(JSON.stringify({
            sender: "Discord-Bots/Monitor",
            recipient: "Discord-Bots/Apricaria",
            trigger_source: "Temperature Sensor",
            reason: "High Tide CPU Temperature",
            task: "Temperature",
            content: {
                "temperatureData": temperatureData,
                "cpuData": cpuData,
                "deviceName": os.hostname()
            },
            timestamp: new Date()
        })));
    } catch (error) {
        logger.error(error);
    }
}
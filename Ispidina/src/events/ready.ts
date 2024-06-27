import { Events } from 'discord.js';
import * as config from "../assets/config"
import { log } from '../utils/logger';
import { getDate } from 'utils/date';

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute() {
        const date = getDate(null, null);
        setTimeout(() => {
            log(`\n\nSession started on ${date.time}, ${date.date}.\n${config.general.name} is now online!\n\n\t------\n`, "info");
        }, 1000);
    },
};
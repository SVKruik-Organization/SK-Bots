const { Events } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');

module.exports = {
    name: Events.MessageCreate,
    execute(message) { }
};
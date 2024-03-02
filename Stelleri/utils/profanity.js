const logger = require("./logger");
const request = require('request');

/**
 * Chewck if a string has profanity words in it.
 * @param {string} input The input string to check.
 * @returns On error or the parsed response body.
 */
function checkProfanity(input) {
    try {
        if (input.length > 1000) return "Limit";
        request.get({
            url: `https://api.api-ninjas.com/v1/profanityfilter?text=${input}`,
            headers: {
                'X-Api-Key': process.env.API_TOKEN
            }
        }, function (error, response, body) {
            if (response.statusCode !== 200) {
                logger.error(error);
                return "Error";
            } else return JSON.parse(body);
        });
    } catch (error) {
        logger.error(error);
    }
}

module.exports = {
    "checkProfanity": checkProfanity
}
const logger = require("./logger.js");

/**
 * Chewck if a string has profanity words in it.
 * @param {string} input The input string to check.
 * @returns On error or the parsed response body.
 */
async function checkProfanity(input) {
    try {
        // Fetch
        if (input.length > 1000) return "Limit";
        const response = await fetch(`https://api.api-ninjas.com/v1/profanityfilter?text=${input}`, {
            method: "GET",
            headers: {
                'X-Api-Key': process.env.API_TOKEN
            }
        });

        // Response
        if (response.ok) return response.json();
        return "Error";
    } catch (error) {
        logger.error(error);
    }
}

module.exports = {
    "checkProfanity": checkProfanity
}
const config = require('../assets/config.js');

/**
 * Get the statistics & features for a specific subscription edition.
 * @param {string} edition The edition to get the statistics for.
 * @returns The edition object with the statistics.
 */
function getStatitistics(edition) {
    let editionObject;
    switch (edition) {
        case "Basic":
            editionObject = {
                seats: config.edition.basicSeats,
                servers: config.edition.basicServers
            }
            break;
        case "Professional":
            editionObject = {
                seats: config.edition.professionalSeats,
                servers: config.edition.professionalServers
            }
            break;
        case "Enterprise":
            editionObject = {
                seats: config.edition.enterpriseSeats,
                servers: config.edition.enterpriseServers
            }
            break;
        default:
            editionObject = undefined;
    }
    return editionObject;
}

module.exports = {
    "getStatitistics": getStatitistics
}
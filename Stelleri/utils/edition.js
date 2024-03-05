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
                seats: 1,
                servers: 3
            }
            break;
        case "Professional":
            editionObject = {
                seats: 3,
                servers: 5,
            }
            break;
        case "Enterprise":
            editionObject = {
                seats: 10,
                servers: 25
            }
            break;
        default:
            editionObject = {}
    }
    return editionObject;
}

module.exports = {
    "getStatitistics": getStatitistics
}
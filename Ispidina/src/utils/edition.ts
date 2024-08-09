import { edition } from '../config.js';

/**
 * Get the statistics & features for a specific subscription edition.
 * @param edition The edition to get the statistics for.
 * @returns The edition object with the statistics.
 */
export function getStatitistics(targetEdition: string) {
    let editionObject;
    switch (targetEdition) {
        case "Basic":
            editionObject = {
                seats: edition.basicSeats,
                servers: edition.basicServers
            }
            break;
        case "Professional":
            editionObject = {
                seats: edition.professionalSeats,
                servers: edition.professionalServers
            }
            break;
        case "Enterprise":
            editionObject = {
                seats: edition.enterpriseSeats,
                servers: edition.enterpriseServers
            }
            break;
        default:
            editionObject = undefined;
    }
    return editionObject;
}
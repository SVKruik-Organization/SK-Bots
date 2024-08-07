import { logError } from "./logger";

/**
 * Chewck if a string has profanity words in it.
 * @param input The input string to check.
 * @returns On error or the parsed response body.
 */
export async function checkProfanity(input: string) {
    try {
        // Fetch
        if (input.length > 1000) return "Limit";
        const response = await fetch(`https://api.api-ninjas.com/v1/profanityfilter?text=${input}`, {
            method: "GET",
            headers: {
                'X-Api-Key': process.env.API_TOKEN as string
            }
        });

        // Response
        if (response.ok) return response.json();
        return "Error";
    } catch (error: any) {
        logError(error);
    }
}
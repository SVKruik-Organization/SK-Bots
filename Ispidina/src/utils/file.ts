import { fileURLToPath } from "url";
import { dirname } from "path";

/**
 * Get the directory name.
 * Equivalent of CommonJS __dirname.
 * @param path import.meta.url in the current file.
 * @returns The dirname for further use.
 */
export function getDirname(path: string): string {
    return dirname(fileURLToPath(path));
}
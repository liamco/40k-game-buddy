/**
 * Shared Parser Utilities
 *
 * Common functions used across multiple regex-parser scripts.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ============================================================================
// PATH UTILITIES
// ============================================================================

/**
 * Get the data output path for factions
 * @param {string} dirname - The __dirname of the calling script
 * @returns {string} - Path to data/output/factions
 */
export function getFactionsOutputPath(dirname) {
    return path.join(dirname, "..", "..", "src", "app", "data", "output", "factions");
}

/**
 * Get the data output path
 * @param {string} dirname - The __dirname of the calling script
 * @returns {string} - Path to data/output
 */
export function getDataOutputPath(dirname) {
    return path.join(dirname, "..", "..", "src", "app", "data", "output");
}

// ============================================================================
// TEXT NORMALIZATION
// ============================================================================

/**
 * Strip HTML tags from text
 * @param {string} text - Text containing HTML
 * @returns {string} - Text with HTML tags removed
 */
export function stripHtml(text) {
    if (!text) return "";
    return text.replace(/<[^>]*>/g, " ").trim();
}

/**
 * Normalize text for consistent pattern matching
 * - Strips HTML tags
 * - Normalizes smart quotes to straight quotes
 * - Normalizes dashes (en-dash, em-dash) to hyphens
 * - Collapses whitespace
 *
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text
 */
export function normalizeText(text) {
    if (!text || typeof text !== "string") return "";
    return stripHtml(text)
        .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
        .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
        .replace(/[\u2013\u2014]/g, "-") // En-dash and em-dash
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Normalize text for comparison (also converts hyphens to spaces)
 * Useful for weapon name matching where "neo-volkite" should match "neo volkite"
 *
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text with hyphens as spaces
 */
export function normalizeForComparison(text) {
    if (!text || typeof text !== "string") return "";
    return text
        .toLowerCase()
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014-]/g, " ") // All hyphens to spaces
        .replace(/\s+/g, " ")
        .trim();
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Find all JSON files in a directory recursively
 * @param {string} dir - Directory to search
 * @param {function} [filter] - Optional filter function (receives file path, returns boolean)
 * @returns {string[]} - Array of file paths
 */
export function findJsonFiles(dir, filter = null) {
    const files = [];

    function walk(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile() && entry.name.endsWith(".json")) {
                if (!filter || filter(fullPath)) {
                    files.push(fullPath);
                }
            }
        }
    }

    walk(dir);
    return files;
}

/**
 * Find all datasheet JSON files (files in datasheets/ directories)
 * @param {string} dir - Base directory to search
 * @returns {string[]} - Array of datasheet file paths
 */
export function findDatasheetFiles(dir) {
    const files = [];

    function walk(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                if (entry.name === "datasheets") {
                    // Found a datasheets directory - get all JSON files in it
                    const datasheetFiles = fs.readdirSync(fullPath).filter((f) => f.endsWith(".json"));
                    files.push(...datasheetFiles.map((f) => path.join(fullPath, f)));
                } else {
                    walk(fullPath);
                }
            }
        }
    }

    walk(dir);
    return files;
}

/**
 * Find all faction directories
 * @param {string} factionsPath - Path to factions directory
 * @returns {string[]} - Array of faction directory paths
 */
export function findFactionDirectories(factionsPath) {
    return fs
        .readdirSync(factionsPath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => path.join(factionsPath, d.name));
}

/**
 * Read and parse a JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {object|null} - Parsed JSON or null on error
 */
export function readJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Write JSON to a file with formatting
 * @param {string} filePath - Path to write to
 * @param {object} data - Data to write
 * @returns {boolean} - Success status
 */
export function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error.message);
        return false;
    }
}

// ============================================================================
// DIRECTORY FILTERING
// ============================================================================

/**
 * Parse directory filters from environment variable
 * Supports comma-separated strings or JSON arrays
 *
 * @param {string} [envVar] - Environment variable name (default: DIRECTORIES_TO_PROCESS)
 * @returns {string[]|null} - Array of directory paths or null if not set
 */
export function parseDirectoryFilters(envVar = "DIRECTORIES_TO_PROCESS") {
    const value = process.env[envVar];
    if (!value) return null;

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
    } catch {
        return value
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean);
    }
}

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

/**
 * Print a formatted header
 * @param {string} title - Header title
 * @param {number} [width=60] - Total width
 */
export function printHeader(title, width = 60) {
    console.log("═".repeat(width));
    console.log(`  ${title}`);
    console.log("═".repeat(width));
    console.log("");
}

/**
 * Print a summary section
 * @param {object} stats - Object with stat names and values
 * @param {number} [width=60] - Total width
 */
export function printSummary(stats, width = 60) {
    console.log("");
    console.log("═".repeat(width));
    console.log("📊 Summary:");
    for (const [key, value] of Object.entries(stats)) {
        console.log(`   ${key}: ${value}`);
    }
    console.log("═".repeat(width));
}

// ============================================================================
// DEEP EQUALITY
// ============================================================================

/**
 * Deep equality check for two objects
 * @param {any} obj1 - First object
 * @param {any} obj2 - Second object
 * @returns {boolean} - True if deeply equal
 */
export function deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

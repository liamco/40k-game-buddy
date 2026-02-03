/**
 * Parse Depot Data Script
 *
 * Processes JSON files in the data/src directory, converting string values to numbers,
 * transforming data formats, and extracting effects from ability descriptions.
 *
 * Usage:
 *   npm run parse-depot-data
 *
 * For AI-based effects extraction, use the separate script:
 *   npm run extract-effects
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Normalizes text by replacing typographic characters with their ASCII equivalents.
 * This ensures consistent regex matching throughout the application.
 *
 * Replacements:
 * - Curly single quotes (', ') → straight apostrophe (')
 * - Curly double quotes (", ") → straight double quote (")
 * - En-dash (–) and em-dash (—) → hyphen (-)
 *
 * @param {string} text - The text to normalize
 * @returns {string} - Normalized text with ASCII equivalents
 */
function normalizeText(text) {
    if (typeof text !== "string") {
        return text;
    }
    return (
        text
            // Curly single quotes to straight apostrophe
            .replace(/[\u2018\u2019]/g, "'")
            // Curly double quotes to straight double quote
            .replace(/[\u201C\u201D]/g, '"')
            // En-dash and em-dash to hyphen
            .replace(/[\u2013\u2014]/g, "-")
    );
}

/**
 * Converts a string value to a number if it's numeric or ends with "+"
 * Examples:
 * - "5" -> 5
 * - "5+" -> 5
 * - "-3" -> -3
 * - "-3+" -> -3
 * - "abc" -> "abc" (unchanged)
 */
function convertValue(value) {
    if (typeof value === "string") {
        // Handle strings with plus sign at the end (e.g., "5+", "3+")
        if (value.endsWith("+") && value.length > 1) {
            const numPart = value.slice(0, -1).trim();
            // Check if the part before "+" is a number
            if (/^-?\d+$/.test(numPart)) {
                return parseInt(numPart, 10);
            }
        }

        // Handle pure numeric strings (integers)
        if (/^-?\d+$/.test(value)) {
            return parseInt(value, 10);
        }

        // Normalize typographic characters in non-numeric strings
        return normalizeText(value);
    }

    return value;
}

/**
 * Converts movement ("m") property from string with quote to number
 * Examples:
 * - "7\"" -> 7
 * - "8\"" -> 8
 * - "6\"" -> 6
 */
function convertMovementValue(value) {
    if (typeof value === "string") {
        // Remove quote character and extract number
        // Handles formats like "7\"", "8\"", etc.
        const match = value.match(/^(-?\d+)/);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return value;
}

/**
 * Converts wargear description strings to arrays of uppercase strings
 * Examples:
 * - "assault, heavy" -> ["ASSAULT", "HEAVY"]
 * - "pistol" -> ["PISTOL"]
 * - "ignores cover, pistol, torrent" -> ["IGNORES COVER", "PISTOL", "TORRENT"]
 * - "" -> []
 */
function convertWargearDescription(value) {
    if (typeof value === "string") {
        // If empty string, return empty array
        if (value.trim() === "") {
            return [];
        }
        // Split by comma, trim each part, convert to uppercase, and filter out empty strings
        return value
            .split(",")
            .map((item) => item.trim().toUpperCase())
            .filter((item) => item.length > 0);
    }
    return value;
}

/**
 * Converts turn strings to standarised uppercased strings inline with typescript enum values
 * Examples:
 * - "Your turn" -> "YOURS"
 * - "Opponent's turn" -> "OPPONENTS"
 * - "Either player's turn" -> "EITHER"
 * - Already converted values ("YOURS", "OPPONENTS", "EITHER") are returned as-is
 */
function convertTurnValue(value) {
    if (typeof value === "string") {
        const turnKey = value.trim();

        // If already in the correct format, return as-is
        const validValues = ["YOURS", "OPPONENTS", "EITHER"];
        if (validValues.includes(turnKey)) {
            return turnKey;
        }

        // Strip all apostrophes (straight ', curly ', and other quotation mark variants) and convert to lowercase for matching
        // Matches: U+0027 (APOSTROPHE), U+2018 (LEFT SINGLE QUOTATION MARK), U+2019 (RIGHT SINGLE QUOTATION MARK)
        const normalizedKey = turnKey.toLowerCase().replace(/[''\u2018\u2019]/g, "");

        // Map each turn string to uppercase GameTurn value
        // Use lowercase keys without apostrophes to handle case-insensitive matching and apostrophe variations
        const turnMap = {
            "your turn": "YOURS",
            "opponents turn": "OPPONENTS",
            "either players turn": "EITHER",
        };

        // Return mapped value if found, otherwise return original value
        return turnMap[normalizedKey] || value;
    }
    return value;
}

/**
 * Converts phase strings to arrays of GamePhase values or "ANY"
 * Examples:
 * - "Fight phase" -> ["FIGHT"]
 * - "Shooting phase" -> ["SHOOTING"]
 * - "Any phase" -> ["ANY"]
 * - "Movement or Charge phase" -> ["MOVEMENT", "CHARGE"]
 * - "Shooting or Fight phase" -> ["SHOOTING", "FIGHT"]
 */
function convertPhaseValue(value) {
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();

        // Split on " or " to handle multiple phases
        const phases = normalized.split(/\s+or\s+/i);

        // Map each phase to uppercase GamePhase value
        const phaseMap = {
            "any phase": "ANY",
            command: "COMMAND",
            movement: "MOVEMENT",
            shooting: "SHOOTING",
            charge: "CHARGE",
            fight: "FIGHT",
        };

        return phases
            .map((phase) => {
                // Remove " phase" suffix and convert to lowercase for mapping
                const phaseKey = phase
                    .replace(/\s+phase$/i, "")
                    .trim()
                    .toLowerCase();
                return phaseMap[phaseKey] || phase.toUpperCase();
            })
            .filter((phase) => phase.length > 0);
    }
    return value;
}

/**
 * Extracts the count (number) from a modelCost description string
 * Attempts to find the first number in the description and convert it to an integer
 * Examples:
 * - "5 models" -> 5
 * - "1 model" -> 1
 * - "5 Shadow Spectres" -> 5
 * - "1 Spanner and 4 Burna Boyz" -> 1 (first number found)
 * - "1 model (<ky>AGENTS OF THE IMPERIUM</ky> Detachment)" -> 1
 * - "Attack Bike" -> null (no number found)
 *
 * @param {string} description - The modelCost description string
 * @returns {number|null} - The extracted count as an integer, or null if no number found
 */
function extractModelCount(description) {
    if (typeof description !== "string" || !description.trim()) {
        return null;
    }

    // Try to match a number at the start of the string (most common case)
    const startMatch = description.trim().match(/^(\d+)/);
    if (startMatch) {
        return parseInt(startMatch[1], 10);
    }

    // If no number at start, try to find any number in the string
    const anyMatch = description.match(/(\d+)/);
    if (anyMatch) {
        return parseInt(anyMatch[1], 10);
    }

    // No number found
    return null;
}

/**
 * Array to store invalid modelCost entries for logging
 */
let invalidModelCosts = [];

/**
 * Array to store invalid unitComposition entries for logging
 */
let invalidUnitCompositions = [];

/**
 * Extracts min and max values from a unitComposition description string
 * Handles various formats:
 * - "1 Gore Hound" -> { min: 1, max: 1 }
 * - "4-9 Flesh Hounds" -> { min: 4, max: 9 }
 * - "0-1 Chapter Ancient" -> { min: 0, max: 1 }
 * - "9 Bloodletters" -> { min: 9, max: 9 }
 *
 * @param {string} description - The unitComposition description string
 * @returns {{min: number, max: number}|null} - Object with min and max values, or null if no numbers found
 */
function extractUnitCompositionRange(description) {
    if (typeof description !== "string" || !description.trim()) {
        return null;
    }

    const trimmed = description.trim();

    // Try to match a range pattern like "4-9" or "0-1" at the start
    const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)/);
    if (rangeMatch) {
        return {
            min: parseInt(rangeMatch[1], 10),
            max: parseInt(rangeMatch[2], 10),
        };
    }

    // Try to match a single number at the start (most common case)
    const singleMatch = trimmed.match(/^(\d+)/);
    if (singleMatch) {
        const num = parseInt(singleMatch[1], 10);
        return {
            min: num,
            max: num,
        };
    }

    // No number found
    return null;
}

/**
 * Processes unitComposition array in a datasheet, adding min and max properties to each object
 * @param {Array} unitComposition - Array of unitComposition objects
 * @param {string} datasheetId - The datasheet ID
 * @param {string} datasheetName - The datasheet name
 * @param {string} filePath - Path to the datasheet file
 * @returns {Array} - Processed unitComposition array with min and max properties
 */
function processUnitComposition(unitComposition, datasheetId, datasheetName, filePath) {
    if (!Array.isArray(unitComposition)) {
        return unitComposition;
    }

    return unitComposition.map((item, index) => {
        const processedItem = { ...item };

        if (item.description) {
            const range = extractUnitCompositionRange(item.description);

            if (range !== null) {
                processedItem.min = range.min;
                processedItem.max = range.max;
            } else {
                // Log invalid entry
                invalidUnitCompositions.push({
                    datasheetId: datasheetId,
                    datasheetName: datasheetName,
                    description: item.description,
                    line: index + 1,
                    file: filePath,
                });
            }
        }

        return processedItem;
    });
}

/**
 * Processes modelCosts array in a datasheet, adding count property to each modelCost
 * @param {Array} modelCosts - Array of modelCost objects
 * @param {string} datasheetId - The datasheet ID
 * @param {string} datasheetName - The datasheet name
 * @param {string} filePath - Path to the datasheet file
 * @returns {Array} - Processed modelCosts array with count properties
 */
function processModelCosts(modelCosts, datasheetId, datasheetName, filePath) {
    if (!Array.isArray(modelCosts)) {
        return modelCosts;
    }

    return modelCosts.map((cost, index) => {
        const processedCost = { ...cost };

        if (cost.description) {
            const count = extractModelCount(cost.description);

            if (count !== null) {
                processedCost.count = count;
            } else {
                // Log invalid entry
                invalidModelCosts.push({
                    datasheetId: datasheetId,
                    datasheetName: datasheetName,
                    description: cost.description,
                    line: index + 1,
                    file: filePath,
                });
            }
        }

        return processedCost;
    });
}

/**
 * Writes invalid modelCost and unitComposition entries to the audit log file
 * @param {string} logsDir - Path to the logs directory
 */
function writeAuditLog(logsDir) {
    const auditFilePath = path.join(logsDir, "datasheet-audits.json");

    // Read existing audit log if it exists
    let existingAudits = {
        auditDate: new Date().toISOString(),
        totalInvalidEntries: 0,
        invalidEntries: [],
    };

    if (fs.existsSync(auditFilePath)) {
        try {
            const existingContent = fs.readFileSync(auditFilePath, "utf-8");
            if (existingContent.trim()) {
                existingAudits = JSON.parse(existingContent);
            }
        } catch (error) {
            console.warn(`Warning: Could not read existing audit log: ${error.message}`);
        }
    }

    // Merge new invalid entries with existing ones (avoid duplicates)
    const existingEntries = new Set(existingAudits.invalidEntries.map((e) => `${e.datasheetId}-${e.line}-${e.description}`));

    // Combine modelCosts and unitComposition invalid entries
    const allNewEntries = [...invalidModelCosts, ...invalidUnitCompositions];

    const newEntries = allNewEntries.filter((entry) => {
        const key = `${entry.datasheetId}-${entry.line}-${entry.description}`;
        return !existingEntries.has(key);
    });

    existingAudits.invalidEntries.push(...newEntries);
    existingAudits.totalInvalidEntries = existingAudits.invalidEntries.length;
    existingAudits.auditDate = new Date().toISOString();

    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    // Write updated audit log
    fs.writeFileSync(auditFilePath, JSON.stringify(existingAudits, null, 2), "utf-8");

    if (invalidModelCosts.length > 0 || invalidUnitCompositions.length > 0) {
        const modelCostCount = invalidModelCosts.length;
        const unitCompositionCount = invalidUnitCompositions.length;
        if (modelCostCount > 0 && unitCompositionCount > 0) {
            console.log(`📝 Logged ${modelCostCount} invalid modelCost and ${unitCompositionCount} invalid unitComposition entries to audit log`);
        } else if (modelCostCount > 0) {
            console.log(`📝 Logged ${modelCostCount} invalid modelCost entries to audit log`);
        } else if (unitCompositionCount > 0) {
            console.log(`📝 Logged ${unitCompositionCount} invalid unitComposition entries to audit log`);
        }
    }
}

/**
 * Recursively processes a JSON object to convert string numbers
 * Ignores 'id' properties to preserve them as strings
 */

const ignoredProperties = ["id", "factionId", "datasheetId", "sourceId"];

async function processObject(obj) {
    if (Array.isArray(obj)) {
        return Promise.all(obj.map((item) => processObject(item)));
    } else if (obj !== null && typeof obj === "object") {
        // Check if this is a detachment object
        // Detachments have slug, name, and typically have abilities, enhancements, and/or stratagems
        const isDetachment = obj.hasOwnProperty("slug") && obj.hasOwnProperty("name") && (obj.hasOwnProperty("abilities") || obj.hasOwnProperty("enhancements") || obj.hasOwnProperty("stratagems"));

        const processed = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                // Skip conversion for 'id' properties - keep them as strings
                if (ignoredProperties.includes(key)) {
                    processed[key] = obj[key];
                } else if (key === "effects" && isDetachment) {
                    // Skip effects at detachment level - they should be in ability objects instead
                    continue;
                } else if ((key === "abilities" || key === "enhancements" || key === "stratagems" || key === "detachmentAbilities") && Array.isArray(obj[key])) {
                    // Special handling for abilities, enhancements, stratagems, and detachmentAbilities arrays
                    // Process each item and add effects if found
                    const itemType =
                        key.charAt(0).toUpperCase() +
                        key
                            .slice(1)
                            .replace(/([A-Z])/g, " $1")
                            .trim();
                    console.log(`\n📋 Processing ${obj[key].length} ${itemType.toLowerCase()}...`);

                    processed[key] = await Promise.all(
                        obj[key].map(async (item, index) => {
                            const processedItem = await processObject(item);
                            return processedItem;
                        })
                    );
                } else if (key === "m") {
                    // Special handling for movement property - convert "7\"" to 7
                    processed[key] = convertMovementValue(obj[key]);
                } else if (key === "invSv") {
                    // Special handling for invSv property - convert "-" to null
                    processed[key] = obj[key] === "-" ? null : await processObject(obj[key]);
                } else if (key === "description") {
                    // Special handling for description property in wargear profiles
                    // Check if this object looks like a wargear profile (has range, type, a, bsWs, s, ap, d properties)
                    const isWargearProfile = obj.hasOwnProperty("range") && obj.hasOwnProperty("type") && (obj.hasOwnProperty("a") || obj.hasOwnProperty("bsWs"));
                    if (isWargearProfile && typeof obj[key] === "string") {
                        // Rename 'description' to 'attributes' and convert to uppercase array
                        processed["attributes"] = convertWargearDescription(obj[key]);
                    } else {
                        processed[key] = await processObject(obj[key]);
                    }
                } else if (key === "phase") {
                    // Special handling for phase property in stratagem objects
                    // Check if this object looks like a stratagem (has cpCost and phase properties)
                    const isStratagem = obj.hasOwnProperty("cpCost") && obj.hasOwnProperty("phase");
                    if (isStratagem && typeof obj[key] === "string") {
                        processed[key] = convertPhaseValue(obj[key]);
                    } else {
                        processed[key] = await processObject(obj[key]);
                    }
                } else if (key === "turn") {
                    // Special handling for turn property in stratagem objects
                    // Check if this object looks like a stratagem (has cpCost and phase properties)
                    const isStratagem = obj.hasOwnProperty("cpCost") && obj.hasOwnProperty("phase");
                    if (isStratagem && typeof obj[key] === "string") {
                        processed[key] = convertTurnValue(obj[key]);
                    } else {
                        processed[key] = await processObject(obj[key]);
                    }
                } else {
                    processed[key] = await processObject(obj[key]);
                }
            }
        }

        return processed;
    } else {
        return convertValue(obj);
    }
}

/**
 * Checks if a file path is a unit datasheet file (not a faction file)
 * Datasheet files are in the datasheets subdirectory
 * Faction files are named "faction.json" in the faction root directory
 * @param {string} filePath - Full path to the file
 * @param {string} depotdataPath - Base path to depotdata directory
 * @returns {boolean} - True if file is a datasheet file
 */
function isDatasheetFile(filePath, depotdataPath) {
    const normalizedPath = filePath.replace(/\\/g, "/");
    const normalizedDepotPath = depotdataPath.replace(/\\/g, "/");
    const relativePath = normalizedPath.replace(normalizedDepotPath + "/", "");

    // Check if the file is in a datasheets subdirectory
    // Path structure: factions/{faction-name}/datasheets/{id}.json
    const pathParts = relativePath.split("/");

    // Check if path contains "datasheets" directory
    if (pathParts.includes("datasheets")) {
        return true;
    }

    // Faction files are named "faction.json" and are in the faction root
    // Path structure: factions/{faction-name}/faction.json
    if (pathParts.length >= 2 && pathParts[pathParts.length - 1] === "faction.json") {
        return false;
    }

    // Default: if it's not clearly a faction file, assume it's a datasheet
    // (though this shouldn't happen with the current structure)
    return false;
}

/**
 * Removes stratagems property from a datasheet object
 * @param {object} obj - The object to process
 * @returns {object} - The object with stratagems removed
 */
function removeStratagemsFromDatasheet(obj) {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        const cleaned = { ...obj };
        if (cleaned.hasOwnProperty("stratagems")) {
            delete cleaned.stratagems;
        }
        return cleaned;
    }
    return obj;
}

/**
 * Removes detachmentAbilities property from a datasheet object
 * @param {object} obj - The object to process
 * @returns {object} - The object with detachmentAbilities removed
 */
function removeDetachmentAbilitiesFromDatasheet(obj) {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        const cleaned = { ...obj };
        if (cleaned.hasOwnProperty("detachmentAbilities")) {
            delete cleaned.detachmentAbilities;
        }
        return cleaned;
    }
    return obj;
}

/**
 * Removes enhancements property from a datasheet object
 * @param {object} obj - The object to process
 * @returns {object} - The object with enhancements removed
 */
function removeEnhancementsFromDatasheet(obj) {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        const cleaned = { ...obj };
        if (cleaned.hasOwnProperty("enhancements")) {
            delete cleaned.enhancements;
        }
        return cleaned;
    }
    return obj;
}

/**
 * Consolidates leader-related properties into a single `leader` object.
 * Returns null if there's no usable leader data.
 *
 * Transforms:
 *   - leader (description) -> leader.description
 *   - leaderFooter -> leader.footer
 *   - leaderInfo (attachable units array) -> leader.attachableUnits
 *   - (leaderConditions will be added later by parse-datasheet-fields.js)
 *
 * @param {object} obj - The datasheet object to process
 * @returns {object} - The datasheet with consolidated leader property (or null if empty)
 */
function consolidateLeaderProperties(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
        return obj;
    }

    // Check for leader-related properties
    const hasLeaderDescription = obj.hasOwnProperty("leader") && typeof obj.leader === "string";
    const hasLeaderFooter = obj.hasOwnProperty("leaderFooter");
    const hasLeaderInfo = obj.hasOwnProperty("leaderInfo");

    const consolidated = { ...obj };

    // Remove old properties regardless
    if (hasLeaderDescription) {
        delete consolidated.leader;
    }
    if (hasLeaderFooter) {
        delete consolidated.leaderFooter;
    }
    if (hasLeaderInfo) {
        delete consolidated.leaderInfo;
    }

    // Check if there's any actual leader data
    const leaderDescription = hasLeaderDescription ? obj.leader : "";
    const leaderFooter = obj.leaderFooter || "";
    const leaderInfo = Array.isArray(obj.leaderInfo) ? obj.leaderInfo : [];

    const hasActualData = leaderDescription.trim() !== "" || leaderFooter.trim() !== "" || leaderInfo.length > 0;

    if (!hasActualData) {
        // No usable leader data - set to null
        consolidated.leader = null;
        return consolidated;
    }

    // Build the new leader object with actual data
    const leaderData = {
        description: leaderDescription,
        footer: leaderFooter,
        conditions: null, // Will be populated by parse-datasheet-fields.js
        attachableUnits: leaderInfo,
    };

    consolidated.leader = leaderData;

    return consolidated;
}

/**
 * Consolidates damaged-related properties into a single `damaged` object.
 * Returns null if there's no usable damaged data.
 *
 * Transforms:
 *   - damagedW -> damaged.range
 *   - damagedDescription -> damaged.description
 *   - (damagedThreshold and damagedMechanics will be added later by parse-datasheet-fields.js)
 *
 * @param {object} obj - The datasheet object to process
 * @returns {object} - The datasheet with consolidated damaged property (or null if empty)
 */
function consolidateDamagedProperties(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
        return obj;
    }

    // Only process if the datasheet has damaged-related properties
    const hasDamagedW = obj.hasOwnProperty("damagedW");
    const hasDamagedDescription = obj.hasOwnProperty("damagedDescription");

    const consolidated = { ...obj };

    // Remove old properties regardless
    if (hasDamagedW) {
        delete consolidated.damagedW;
    }
    if (hasDamagedDescription) {
        delete consolidated.damagedDescription;
    }

    // Check if there's any actual damaged data
    const hasActualData = (obj.damagedW && obj.damagedW.trim() !== "") || (obj.damagedDescription && obj.damagedDescription.trim() !== "");

    if (!hasActualData) {
        // No usable damaged data - set to null
        consolidated.damaged = null;
        return consolidated;
    }

    // Build the new damaged object with actual data
    const damagedData = {
        range: obj.damagedW || "",
        threshold: 0, // Will be populated by parse-datasheet-fields.js
        description: obj.damagedDescription || "",
        mechanics: [], // Will be populated by parse-datasheet-fields.js
    };

    consolidated.damaged = damagedData;

    return consolidated;
}

/**
 * Consolidates wargear-related properties into a single `wargear` object.
 *
 * Transforms:
 *   - loadout (default equipment text) -> wargear.defaultLoadout
 *   - wargear (weapon profiles) -> wargear.weapons (after grouping profiles)
 *   - options (raw option text) -> wargear.options.raw
 *   - (parsed options will be added later by parse-wargear-options.js)
 *
 * @param {object} obj - The datasheet object to process
 * @returns {object} - The datasheet with consolidated wargear property
 */
function consolidateWargearProperties(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
        return obj;
    }

    const consolidated = { ...obj };

    // Group weapon profiles first (e.g., "Plasma pistol – standard" and "Plasma pistol – supercharge" become one weapon)
    const weapons = obj.wargear && Array.isArray(obj.wargear) ? groupWeaponProfiles(obj.wargear) : [];

    // Get raw options
    const rawOptions = obj.options && Array.isArray(obj.options) ? obj.options : [];

    // Get default loadout text
    const defaultLoadout = obj.loadout || "";

    // Build the consolidated wargear object
    const wargearData = {
        defaultLoadout: defaultLoadout,
        weapons: weapons,
        options: {
            raw: rawOptions,
            parsed: [], // Will be populated by parse-wargear-options.js
            allParsed: false, // Will be set by parse-wargear-options.js
        },
    };

    // Remove old properties
    if (consolidated.hasOwnProperty("wargear")) {
        delete consolidated.wargear;
    }
    if (consolidated.hasOwnProperty("options")) {
        delete consolidated.options;
    }
    if (consolidated.hasOwnProperty("loadout")) {
        delete consolidated.loadout;
    }
    // Also remove availableWargear if it somehow exists (shouldn't at this point)
    if (consolidated.hasOwnProperty("availableWargear")) {
        delete consolidated.availableWargear;
    }

    consolidated.wargear = wargearData;

    return consolidated;
}

/**
 * Consolidates supplement-related properties into a single `supplement` object.
 *
 * Transforms:
 *   - supplementKey -> supplement.key
 *   - supplementSlug -> supplement.slug
 *   - supplementName -> supplement.name
 *   - supplementLabel -> supplement.label
 *   - isSupplement -> supplement.isSupplement
 *
 * @param {object} obj - The datasheet object to process
 * @returns {object} - The datasheet with consolidated supplement property
 */
function consolidateSupplementProperties(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
        return obj;
    }

    const consolidated = { ...obj };

    // Build the supplement object
    const supplementData = {
        key: obj.supplementKey || "",
        slug: obj.supplementSlug || "",
        name: obj.supplementName || "",
        label: obj.supplementLabel || "",
        isSupplement: obj.isSupplement || false,
    };

    // Remove old properties
    delete consolidated.supplementKey;
    delete consolidated.supplementSlug;
    delete consolidated.supplementName;
    delete consolidated.supplementLabel;
    delete consolidated.isSupplement;

    consolidated.supplement = supplementData;

    return consolidated;
}

/**
 * Renames the 'leaders' property to 'leadsUnits' for clarity.
 * The 'leaders' array contains units this character can lead (attach to as a leader),
 * not units that can lead this unit.
 *
 * @param {object} obj - The datasheet object to process
 * @returns {object} - The datasheet with renamed property
 */
function renameLeadersProperty(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
        return obj;
    }

    if (!obj.hasOwnProperty("leaders")) {
        return obj;
    }

    const { leaders, ...rest } = obj;
    return { ...rest, leadsUnits: leaders };
}

/**
 * Reorders properties in a datasheet object so that array properties come last.
 * This makes the JSON output cleaner and easier to read.
 *
 * @param {object} obj - The datasheet object to reorder
 * @returns {object} - The datasheet with reordered properties
 */
function reorderDatasheetProperties(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
        return obj;
    }

    const scalarProps = {};
    const arrayProps = {};

    for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (Array.isArray(value)) {
            arrayProps[key] = value;
        } else {
            scalarProps[key] = value;
        }
    }

    // Return object with scalar properties first, then array properties
    return { ...scalarProps, ...arrayProps };
}

/**
 * Processes Core and Faction type abilities in a datasheet's abilities array.
 * - Datasheet and Wargear abilities are kept as-is (full data)
 * - Core and Faction abilities are converted to references (name, type, parameter only)
 *   since their full definitions are in core-abilities.json or faction.factionAbilities
 * @param {object} obj - The datasheet object to process
 * @returns {object} - The datasheet with processed abilities
 */
function filterCoreAndFactionAbilitiesFromDatasheet(obj) {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        if (obj.abilities && Array.isArray(obj.abilities)) {
            const cleaned = { ...obj };
            cleaned.abilities = obj.abilities.map((ability) => {
                const abilityType = ability.type?.toLowerCase() || "";
                // Keep Datasheet, Wargear, Special, and Primarch abilities as-is (they contain unique rules text)
                // Special abilities include things like "SUPREME COMMANDER", "LAST SURVIVOR", etc.
                if (abilityType === "datasheet" || abilityType === "wargear" || abilityType.startsWith("special") || abilityType === "primarch") {
                    return ability;
                }
                // Convert Core and Faction abilities to references
                // Keep only the fields needed to look up the full definition
                return {
                    name: ability.name,
                    type: ability.type,
                    parameter: ability.parameter || undefined,
                };
            });
            return cleaned;
        }
    }
    return obj;
}

/**
 * Extracts the base weapon name from a profile name that may contain a mode suffix
 * Examples:
 * - "Plasma pistol – standard" -> "Plasma pistol"
 * - "Plasma pistol – supercharge" -> "Plasma pistol"
 * - "Gnarlrod – strike" -> "Gnarlrod"
 * - "Gnarlrod – sweep" -> "Gnarlrod"
 * - "Bolt pistol" -> "Bolt pistol" (no suffix)
 *
 * Handles various dash characters: en-dash (–), em-dash (—), and hyphen (-)
 *
 * @param {string} name - The weapon or profile name
 * @returns {{baseName: string, profileSuffix: string|null}} - Base name and optional profile suffix
 */
function parseWeaponName(name) {
    if (typeof name !== "string") {
        return { baseName: name, profileSuffix: null };
    }

    // Match various dash characters followed by a profile mode
    // Pattern: "Base Name" + " " + (en-dash|em-dash|hyphen) + " " + "profile mode"
    const dashPattern = /^(.+?)\s+[–—-]\s+(.+)$/;
    const match = name.match(dashPattern);

    if (match) {
        return {
            baseName: match[1].trim(),
            profileSuffix: match[2].trim(),
        };
    }

    return { baseName: name, profileSuffix: null };
}

/**
 * Groups weapons that share the same base name into single weapons with multiple profiles
 *
 * For example, if wargear contains:
 * - { name: "Plasma pistol – standard", profiles: [{ name: "Plasma pistol – standard", ... }] }
 * - { name: "Plasma pistol – supercharge", profiles: [{ name: "Plasma pistol – supercharge", ... }] }
 *
 * This will combine them into:
 * - { name: "Plasma pistol", profiles: [
 *     { name: "Plasma pistol – standard", ... },
 *     { name: "Plasma pistol – supercharge", ... }
 *   ]}
 *
 * Weapons without profile suffixes are left unchanged.
 *
 * @param {Array} wargear - Array of weapon objects
 * @returns {Array} - Grouped wargear array
 */
function groupWeaponProfiles(wargear) {
    if (!Array.isArray(wargear) || wargear.length === 0) {
        return wargear;
    }

    // Group weapons by base name and type
    const weaponGroups = new Map();
    const standaloneWeapons = [];

    for (const weapon of wargear) {
        const { baseName, profileSuffix } = parseWeaponName(weapon.name);

        if (profileSuffix === null) {
            // No suffix - this is a standalone weapon, keep as-is
            standaloneWeapons.push(weapon);
        } else {
            // Has a suffix - group with other profiles of the same base weapon and type
            const groupKey = `${baseName}|${weapon.type}`;

            if (!weaponGroups.has(groupKey)) {
                weaponGroups.set(groupKey, {
                    baseName,
                    type: weapon.type,
                    datasheetId: weapon.datasheetId,
                    weapons: [],
                });
            }

            weaponGroups.get(groupKey).weapons.push(weapon);
        }
    }

    // Build the result array
    const result = [...standaloneWeapons];

    for (const [groupKey, group] of weaponGroups) {
        if (group.weapons.length === 1) {
            // Only one weapon in this group - keep the original (don't modify its name)
            result.push(group.weapons[0]);
        } else {
            // Multiple weapons - combine into one with multiple profiles
            // Sort weapons by their original line number to maintain order
            group.weapons.sort((a, b) => (a.line || 0) - (b.line || 0));

            // Use the first weapon as the base, but update its properties
            const firstWeapon = group.weapons[0];

            // Collect all profiles from all weapons in the group
            const allProfiles = [];
            for (const weapon of group.weapons) {
                if (weapon.profiles && Array.isArray(weapon.profiles)) {
                    allProfiles.push(...weapon.profiles);
                }
            }

            // Create the combined weapon
            const combinedWeapon = {
                id: `${firstWeapon.datasheetId}:${group.baseName.toLowerCase().replace(/\s+/g, "-")}`,
                datasheetId: firstWeapon.datasheetId,
                line: firstWeapon.line,
                name: group.baseName,
                type: group.type,
                profiles: allProfiles,
            };

            result.push(combinedWeapon);
        }
    }

    // Sort result by line number to maintain original order
    result.sort((a, b) => (a.line || 0) - (b.line || 0));

    return result;
}

/**
 * Reads and parses a faction-config.json file if it exists
 * Looks in src/app/data/mappings/{faction-slug}/faction-config.json
 * @param {string} factionSlug - The faction slug (e.g., "space-marines")
 * @param {boolean} logMissing - Whether to log a message if no config is found
 * @returns {object|null} - The parsed config or null if not found
 */
function readFactionConfig(factionSlug, logMissing = false) {
    const configPath = path.join(__dirname, "..", "..", "src", "app", "data", "mappings", factionSlug, "faction-config.json");
    if (fs.existsSync(configPath)) {
        try {
            const content = fs.readFileSync(configPath, "utf-8");
            return JSON.parse(content);
        } catch (error) {
            console.warn(`   ⚠️  Could not parse faction-config.json for ${factionSlug}: ${error.message}`);
            return null;
        }
    }
    if (logMissing) {
        console.log(`   ℹ️  No faction-config.json found for ${factionSlug}`);
    }
    return null;
}

/**
 * Applies supplementSlug to detachments based on faction-config.json mappings
 * @param {Array} detachments - Array of detachment objects
 * @param {object} detachmentSupplements - Mapping of detachment slugs to supplement slugs
 * @returns {Array} - Detachments with supplementSlug applied where applicable
 */
function applySupplementSlugsToDetachments(detachments, detachmentSupplements) {
    if (!Array.isArray(detachments) || !detachmentSupplements) {
        return detachments;
    }

    return detachments.map((detachment) => {
        if (detachment.slug && detachmentSupplements[detachment.slug]) {
            return {
                ...detachment,
                supplementSlug: detachmentSupplements[detachment.slug],
            };
        }
        return detachment;
    });
}

/**
 * Processes a single JSON file
 * @param {string} filePath - Path to the JSON file
 * @param {string} depotdataPath - Base path to depotdata directory (source)
 * @param {string} outputPath - Base path to output directory (destination)
 * @param {Map} factionConfigCache - Cache of faction configs by faction directory path
 */
async function processJsonFile(filePath, depotdataPath, outputPath, factionConfigCache = new Map()) {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(content);

        // Process the data
        let processedData = await processObject(data);

        // Remove stratagems, detachmentAbilities, enhancements, and Core/Faction abilities from datasheet files (but keep them in faction files)
        const isDatasheet = isDatasheetFile(filePath, depotdataPath);

        // Skip Legends datasheets unless INCLUDE_LEGENDS_UNITS is set to true
        const includeLegends = process.env.INCLUDE_LEGENDS_UNITS === "true";
        if (isDatasheet && processedData.isLegends === true && !includeLegends) {
            return { success: true, skipped: true, reason: "legends" };
        }
        if (isDatasheet) {
            processedData = removeStratagemsFromDatasheet(processedData);
            processedData = removeDetachmentAbilitiesFromDatasheet(processedData);
            processedData = removeEnhancementsFromDatasheet(processedData);
            processedData = filterCoreAndFactionAbilitiesFromDatasheet(processedData);

            // Process modelCosts if present
            if (processedData.modelCosts && Array.isArray(processedData.modelCosts)) {
                const relativePath = path.relative(depotdataPath, filePath);
                processedData.modelCosts = processModelCosts(processedData.modelCosts, processedData.id || "unknown", processedData.name || "unknown", relativePath);
            }

            // Process unitComposition if present
            if (processedData.unitComposition && Array.isArray(processedData.unitComposition)) {
                const relativePath = path.relative(depotdataPath, filePath);
                processedData.unitComposition = processUnitComposition(processedData.unitComposition, processedData.id || "unknown", processedData.name || "unknown", relativePath);
            }

            // Consolidate leader properties (leader, leaderFooter, leaderInfo -> leader object)
            processedData = consolidateLeaderProperties(processedData);

            // Consolidate damaged properties (damagedW, damagedDescription -> damaged object)
            processedData = consolidateDamagedProperties(processedData);

            // Consolidate wargear properties (wargear, options -> wargear object with weapons and options)
            processedData = consolidateWargearProperties(processedData);

            // Rename 'leaders' to 'leadsUnits' for clarity
            processedData = renameLeadersProperty(processedData);

            // Consolidate supplement properties into single object
            processedData = consolidateSupplementProperties(processedData);

            // Reorder properties so arrays come last (cleaner JSON output)
            processedData = reorderDatasheetProperties(processedData);
        } else {
            // This is a faction.json file - check for faction-config.json and apply supplement slugs to detachments
            // Extract faction slug from path (e.g., "factions/space-marines/faction.json" -> "space-marines")
            const relativePath = path.relative(depotdataPath, filePath);
            const pathParts = relativePath.split(path.sep);
            const factionSlug = pathParts.length >= 2 ? pathParts[1] : null;

            if (factionSlug) {
                // Check cache first, otherwise read and cache the config
                // Config files are in src/app/data/mappings/{faction-slug}/faction-config.json
                if (!factionConfigCache.has(factionSlug)) {
                    factionConfigCache.set(factionSlug, readFactionConfig(factionSlug, true));
                }

                const factionConfig = factionConfigCache.get(factionSlug);

                if (factionConfig && factionConfig.detachmentSupplements && processedData.detachments) {
                    processedData.detachments = applySupplementSlugsToDetachments(processedData.detachments, factionConfig.detachmentSupplements);
                    console.log(`   📋 Applied supplement slugs to ${Object.keys(factionConfig.detachmentSupplements).length} detachments`);
                }
            }
        }

        // Calculate output file path (same relative path, but under outputPath)
        const relativePath = path.relative(depotdataPath, filePath);
        const outputFilePath = path.join(outputPath, relativePath);

        // Ensure the output directory exists
        const outputDir = path.dirname(outputFilePath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write to output file with proper formatting
        fs.writeFileSync(outputFilePath, JSON.stringify(processedData, null, 2), "utf-8");

        return { success: true, skipped: false };
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        return { success: false, skipped: false };
    }
}

/**
 * Main function to process all JSON files in data/src
 * Reads from src/app/data/src and outputs to src/app/data/output
 */
async function main() {
    const depotdataPath = path.join(__dirname, "..", "..", "src", "app", "data", "src");
    const outputPath = path.join(__dirname, "..", "..", "src", "app", "data", "output");

    if (!fs.existsSync(depotdataPath)) {
        console.error(`Error: ${depotdataPath} does not exist`);
        process.exit(1);
    }

    // Warning: Check if output directory has extracted mechanics that would be overwritten
    if (fs.existsSync(outputPath)) {
        // Check a sample file for mechanics
        const factionDirs = path.join(outputPath, "factions");
        if (fs.existsSync(factionDirs)) {
            const sampleFiles = [];
            const factions = fs.readdirSync(factionDirs, { withFileTypes: true }).filter((d) => d.isDirectory());
            for (const faction of factions.slice(0, 3)) {
                const datasheetDir = path.join(factionDirs, faction.name, "datasheets");
                if (fs.existsSync(datasheetDir)) {
                    const files = fs
                        .readdirSync(datasheetDir)
                        .filter((f) => f.endsWith(".json"))
                        .slice(0, 5);
                    sampleFiles.push(...files.map((f) => path.join(datasheetDir, f)));
                }
            }

            let hasMechanics = false;
            for (const file of sampleFiles) {
                try {
                    const content = JSON.parse(fs.readFileSync(file, "utf-8"));
                    if (content.abilities?.some((a) => a.mechanics && a.mechanics.length > 0)) {
                        hasMechanics = true;
                        break;
                    }
                } catch {
                    // Ignore parsing errors
                }
            }

            if (hasMechanics) {
                console.warn("═".repeat(60));
                console.warn("⚠️  WARNING: Existing output files contain extracted mechanics!");
                console.warn("   Running this script will OVERWRITE them with data from src/");
                console.warn("   which does NOT contain the extracted mechanics.");
                console.warn("");
                console.warn("   If you have already run extract-effects:regex or extract-effects:openai,");
                console.warn("   those extracted mechanics will be LOST.");
                console.warn("");
                console.warn("   To proceed anyway, set FORCE=true:");
                console.warn("   FORCE=true npm run parse-depot-data");
                console.warn("═".repeat(60));

                if (process.env.FORCE !== "true") {
                    console.error("\n❌ Aborting to prevent data loss. Use FORCE=true to override.\n");
                    process.exit(1);
                } else {
                    console.warn("\n⚠️  FORCE=true set. Proceeding with overwrite...\n");
                }
            }
        }
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
        console.log(`📁 Created output directory: ${outputPath}`);
    }

    // Reset invalid arrays for this run
    invalidModelCosts = [];
    invalidUnitCompositions = [];

    // Find all JSON files recursively
    const jsonFiles = [];

    function findJsonFiles(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                findJsonFiles(fullPath);
            } else if (entry.isFile() && entry.name.endsWith(".json")) {
                jsonFiles.push(fullPath);
            }
        }
    }

    findJsonFiles(depotdataPath);

    // Also copy top-level JSON files that don't need processing (index.json, core-*.json)
    const topLevelFiles = fs
        .readdirSync(depotdataPath)
        .filter((f) => f.endsWith(".json"))
        .map((f) => path.join(depotdataPath, f));

    const includeLegends = process.env.INCLUDE_LEGENDS_UNITS === "true";

    console.log(`📁 Found ${jsonFiles.length} JSON files to process...`);
    console.log(`📁 Found ${topLevelFiles.length} top-level JSON files to copy...`);
    console.log(`📂 Source: ${depotdataPath}`);
    console.log(`📂 Output: ${outputPath}`);
    console.log(`📜 Legends units: ${includeLegends ? "INCLUDED" : "EXCLUDED (set INCLUDE_LEGENDS_UNITS=true to include)"}\n`);

    // Copy top-level JSON files directly (no processing needed)
    for (const topLevelFile of topLevelFiles) {
        const fileName = path.basename(topLevelFile);
        const outputFilePath = path.join(outputPath, fileName);
        fs.copyFileSync(topLevelFile, outputFilePath);
        console.log(`📋 Copied: ${fileName}`);
    }
    console.log("");

    let successCount = 0;
    let errorCount = 0;
    let fileIndex = 0;

    // Cache for faction-config.json files to avoid re-reading them
    const factionConfigCache = new Map();

    let skippedLegendsCount = 0;

    for (const jsonFile of jsonFiles) {
        fileIndex++;
        const relativePath = path.relative(depotdataPath, jsonFile);

        console.log(`[${fileIndex}/${jsonFiles.length}] Processing: ${relativePath}`);

        const result = await processJsonFile(jsonFile, depotdataPath, outputPath, factionConfigCache);
        if (result.success) {
            if (result.skipped) {
                skippedLegendsCount++;
                console.log(`⏭️  Skipped (Legends): ${relativePath}\n`);
            } else {
                successCount++;
                console.log(`✅ Completed: ${relativePath}\n`);
            }
        } else {
            errorCount++;
            console.log(`❌ Failed: ${relativePath}\n`);
        }
    }

    // Write audit log for invalid modelCost entries
    const logsDir = path.join(__dirname, "..", "..", "logs");
    writeAuditLog(logsDir);

    console.log("═".repeat(50));
    console.log(`📊 Processing Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    if (skippedLegendsCount > 0) {
        console.log(`   ⏭️  Skipped (Legends): ${skippedLegendsCount}`);
    }
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📄 Total: ${jsonFiles.length}`);
    if (invalidModelCosts.length > 0 || invalidUnitCompositions.length > 0) {
        if (invalidModelCosts.length > 0) {
            console.log(`   ⚠️  Invalid modelCost entries: ${invalidModelCosts.length}`);
        }
        if (invalidUnitCompositions.length > 0) {
            console.log(`   ⚠️  Invalid unitComposition entries: ${invalidUnitCompositions.length}`);
        }
    }
    console.log("═".repeat(50));
}

// Run the script
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});

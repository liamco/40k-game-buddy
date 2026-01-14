/**
 * Extract Effects Script - OpenAI Version
 *
 * Uses OpenAI API to extract structured effects from Warhammer 40k game rule descriptions.
 * Processes all data/src JSON files to extract effects from:
 * - Faction abilities (in faction.json files - e.g., Oath of Moment)
 * - Detachment abilities (in faction.json files)
 * - Enhancements (in faction.json files)
 * - Stratagems (in faction.json files and core-stratagems.json)
 * - Unit abilities (in datasheet JSON files)
 *
 * Usage:
 *   1. Set OPENAI_API_KEY in your .env file
 *   2. Optionally set OPENAI_MODEL (defaults to "gpt-4o-mini")
 *   3. Optionally set SKIP_EXISTING_EFFECTS (defaults to "true")
 *   4. Optionally set API_DELAY_MS (defaults to 200) - delay between API calls to avoid rate limits
 *   5. Optionally set API_RETRY_DELAY_MS (defaults to 60000) - delay when rate limited before retry
 *
 *   Process all files:
 *     npm run extract-effects:openai
 *
 *   Process specific files (for testing):
 *     npm run extract-effects:openai "factions/tyranids/faction.json" "factions/space-marines/datasheets/000000060.json"
 *
 *   Or use environment variable for files:
 *     FILES_TO_PROCESS='["factions/tyranids/faction.json"]' npm run extract-effects:openai
 *     FILES_TO_PROCESS="factions/tyranids/faction.json,factions/space-marines/faction.json" npm run extract-effects:openai
 *
 *   Process specific directories:
 *     DIRECTORIES_TO_PROCESS='["factions/space-marines", "factions/tyranids"]' npm run extract-effects:openai
 *     DIRECTORIES_TO_PROCESS="factions/space-marines,factions/tyranids" npm run extract-effects:openai
 *
 *   For single description test:
 *     npm run extract-effects:openai "<description>" [itemName]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { buildMechanicsPrompt } from "./mechanic-schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Throttling configuration
const API_DELAY_MS = parseInt(process.env.API_DELAY_MS || "200", 10);
const API_RETRY_DELAY_MS = parseInt(process.env.API_RETRY_DELAY_MS || "60000", 10);
const MAX_RETRIES = 3;

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Load core abilities registry (from processed data directory)
const coreAbilitiesPath = path.join(__dirname, "..", "..", "src", "app", "data", "dist", "core-abilities.json");
let CORE_ABILITIES = {};
if (fs.existsSync(coreAbilitiesPath)) {
    const coreAbilitiesData = JSON.parse(fs.readFileSync(coreAbilitiesPath, "utf-8"));
    CORE_ABILITIES = coreAbilitiesData.abilities || {};
    console.log(`📚 Loaded ${Object.keys(CORE_ABILITIES).length} core abilities from registry`);
}

/**
 * Gets pre-defined mechanics for a core ability if available.
 * @param {string} abilityName - The ability name to look up
 * @param {*} parameter - The ability's parameter value (for parameterized abilities)
 * @returns {Array|null} - Array of mechanics or null if not a core ability
 */
function getCoreAbilityMechanics(abilityName, parameter) {
    const normalizedName = abilityName?.toUpperCase()?.trim();
    const coreAbility = CORE_ABILITIES[normalizedName];

    if (!coreAbility) {
        return null;
    }

    if (coreAbility.type === "static") {
        // Static abilities use mechanics as-is
        return JSON.parse(JSON.stringify(coreAbility.mechanics));
    }

    if (coreAbility.type === "parameterized") {
        if (parameter === undefined || parameter === null || parameter === "none") {
            // Parameterized ability without a parameter - skip
            return null;
        }

        // Deep clone and substitute {parameter} placeholder
        const mechanics = JSON.parse(JSON.stringify(coreAbility.mechanics));
        for (const mechanic of mechanics) {
            if (mechanic.value === "{parameter}") {
                mechanic.value = parameter;
            }
        }
        return mechanics;
    }

    return null;
}

/**
 * Extracts structured effects from a Warhammer 40k game rule description using OpenAI
 * @param {string} description - The description text to analyze
 * @param {string} itemName - Optional name/identifier of the item being processed (for logging)
 * @param {Array} factionStateFlags - Optional faction-specific state flags to include in prompt
 * @returns {Promise<Array|null>} - Array of structured effects or null
 */
export async function extractStructuredEffectsWithOpenAI(description, itemName = "Unknown", factionStateFlags = []) {
    if (!description || typeof description !== "string") {
        return null;
    }

    // Remove HTML tags for cleaner analysis
    const cleanDescription = description
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!cleanDescription) {
        return null;
    }

    // OpenAI configuration
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
        console.error(`[OpenAI] ❌ OPENAI_API_KEY not found in environment variables`);
        console.error(`[OpenAI]    Please set OPENAI_API_KEY in your .env file or as an environment variable`);
        return null;
    }

    // Truncate description for logging (first 100 chars)
    const descriptionPreview = cleanDescription.length > 100 ? cleanDescription.substring(0, 100) + "..." : cleanDescription;

    console.log(`\n[OpenAI] Analyzing: ${itemName}`);
    console.log(`[OpenAI] Description: ${descriptionPreview}`);

    const startTime = Date.now();

    // Build prompt from schema (single source of truth for valid values)
    // Include faction-specific state flags if provided
    const prompt = buildMechanicsPrompt(cleanDescription, factionStateFlags);
    const fullPrompt = `You are a helpful assistant that extracts structured game rule effects from Warhammer 40k descriptions. Always return valid JSON only.\n\n${prompt}`;

    try {
        console.log(`[OpenAI] Calling OpenAI API (${model})...`);

        let response;
        let data;
        let retryCount = 0;

        while (retryCount <= MAX_RETRIES) {
            response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: "user",
                            content: fullPrompt,
                        },
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.1,
                    max_tokens: 2000,
                }),
            });

            if (response.ok) {
                data = await response.json();
                // Add delay after successful call to avoid rate limits
                await sleep(API_DELAY_MS);
                break;
            }

            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;

            // Check if rate limited (429) or server error (5xx)
            if (response.status === 429 || response.status >= 500) {
                retryCount++;
                if (retryCount <= MAX_RETRIES) {
                    const retryDelay = response.status === 429 ? API_RETRY_DELAY_MS : API_DELAY_MS * 2;
                    console.log(`[OpenAI] ⏳ Rate limited. Waiting ${retryDelay / 1000}s before retry ${retryCount}/${MAX_RETRIES}...`);
                    await sleep(retryDelay);
                    continue;
                }
            }

            throw new Error(`OpenAI API error: ${errorMessage}`);
        }

        if (!data) {
            throw new Error("Failed to get response after retries");
        }
        const content = data.choices?.[0]?.message?.content?.trim();
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        if (!content) {
            console.log(`[OpenAI] ⚠️  No content in response (${elapsed}s)`);
            return null;
        }

        // Parse JSON response
        let jsonContent = content;
        // Handle markdown code blocks if present (though response_format: json_object should prevent this)
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
            jsonContent = jsonMatch[1];
        }

        const parsed = JSON.parse(jsonContent);

        if (parsed.mechanics && Array.isArray(parsed.mechanics) && parsed.mechanics.length > 0) {
            console.log(`[OpenAI] ✅ Extracted ${parsed.mechanics.length} mechanic(s) (${elapsed}s)`);
            parsed.mechanics.forEach((mechanic, idx) => {
                const conditions = mechanic.conditions && mechanic.conditions.length > 0 ? ` [conditions: ${mechanic.conditions.length}]` : "";

                // Build display string for the mechanic
                let displayParts = [];

                // Entity
                displayParts.push(`entity:${mechanic.entity}`);

                // Effect type
                displayParts.push(`effect:${mechanic.effect}`);

                // Attribute (if present)
                if (mechanic.attribute) {
                    displayParts.push(`attribute:${mechanic.attribute}`);
                }

                // Format value display based on effect type
                if (mechanic.effect === "addsKeyword" && mechanic.keywords && Array.isArray(mechanic.keywords)) {
                    displayParts.push(`keywords:[${mechanic.keywords.join(", ")}]`);
                } else if (mechanic.effect === "addsAbility" && mechanic.abilities && Array.isArray(mechanic.abilities)) {
                    const abilitiesDisplay = mechanic.abilities.join(", ");
                    if (mechanic.value !== undefined && mechanic.value !== null) {
                        displayParts.push(`abilities:[${abilitiesDisplay}] value:${mechanic.value}`);
                    } else {
                        displayParts.push(`abilities:[${abilitiesDisplay}]`);
                    }
                } else if (mechanic.effect === "staticNumber") {
                    displayParts.push(`value:${mechanic.value}+`);
                } else if (mechanic.effect === "rollBonus") {
                    displayParts.push(`value:+${mechanic.value}`);
                } else if (mechanic.effect === "rollPenalty") {
                    displayParts.push(`value:-${mechanic.value}`);
                } else if (mechanic.value !== undefined && mechanic.value !== null) {
                    displayParts.push(`value:${mechanic.value}`);
                }

                // State (if present)
                if (mechanic.state && Array.isArray(mechanic.state) && mechanic.state.length > 0) {
                    displayParts.push(`state:[${mechanic.state.join(", ")}]`);
                }

                console.log(`[OpenAI]   ${idx + 1}. ${displayParts.join(" ")}${conditions}`);
            });
            return parsed.mechanics;
        }

        console.log(`[OpenAI] ℹ️  No mechanics found (${elapsed}s)`);
        return null;
    } catch (error) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        const errorMessage = error?.message || error?.toString() || String(error);

        console.error(`[OpenAI] ❌ Error extracting mechanics (${elapsed}s): ${errorMessage}`);

        if (errorMessage.includes("API key")) {
            console.error(`[OpenAI]    Check that OPENAI_API_KEY is set correctly in your .env file`);
        } else if (errorMessage.includes("rate limit")) {
            console.error(`[OpenAI]    Rate limit exceeded. Please wait before retrying.`);
        } else if (errorMessage.includes("insufficient_quota")) {
            console.error(`[OpenAI]    Insufficient quota. Check your OpenAI account billing.`);
        }

        return null;
    }
}

/**
 * Checks if an object should have effects extracted (has description)
 */
function shouldExtractMechanics(obj) {
    return obj && typeof obj === "object" && obj.description && typeof obj.description === "string";
}

/**
 * Extracts leader conditions from leaderFooter text.
 * This handles special cases where multiple leaders can attach to a single bodyguard unit.
 *
 * @param {string} leaderFooter - The leaderFooter HTML text
 * @returns {object|null} - LeaderCondition object or null if no special conditions
 */
function extractLeaderConditions(leaderFooter) {
    if (!leaderFooter || typeof leaderFooter !== "string" || leaderFooter.trim() === "") {
        return null;
    }

    // Remove HTML tags for cleaner analysis
    const cleanText = leaderFooter
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!cleanText) {
        return null;
    }

    const conditions = {};

    // Check for "must attach" pattern
    // Pattern: "You must attach this model to the above unit"
    if (/you must attach this model/i.test(cleanText)) {
        conditions.mustAttach = true;
    }

    // Check for "can attach even if X has already been attached" patterns
    // This indicates which existing leaders this unit can join

    // Pattern 1: "even if one CHARACTER model has already been attached"
    // Pattern 2: "even if CANIS WOLFBORN has been attached" (no "one", and "been" instead of "already been")
    const evenIfMatch = cleanText.match(/even if (?:one |a )?(.+?) (?:model |unit )?has (?:already )?been attached/i);

    if (evenIfMatch) {
        const keywordsPart = evenIfMatch[1];

        // Extract keywords from the match - they can be comma or "or" separated
        // Examples: "CHARACTER", "CAPTAIN, CHAPTER MASTER or LIEUTENANT", "CANIS WOLFBORN"
        const keywords = keywordsPart
            .split(/,\s*|\s+or\s+/i)
            .map((k) => k.trim().toUpperCase())
            .filter((k) => k.length > 0);

        if (keywords.length > 0) {
            // Check if it's a generic "CHARACTER" - this means any existing leader is allowed
            if (keywords.length === 1 && keywords[0] === "CHARACTER") {
                conditions.allowsAnyExistingLeader = true;
            } else {
                conditions.allowedExistingLeaderKeywords = keywords;
            }
        }
    }

    // Only return conditions if we found any
    if (Object.keys(conditions).length > 0) {
        return conditions;
    }

    return null;
}

/**
 * Recursively processes a JSON object to extract effects from abilities, enhancements, stratagems, and detachmentAbilities
 * @param {object} obj - The object to process
 * @param {boolean} skipExistingMechanics - Whether to skip items that already have effects
 * @param {Array} factionStateFlags - Faction-specific state flags to include in OpenAI prompts
 * @returns {Promise<object>} - The processed object with effects added
 */
async function processObjectForEffects(obj, skipExistingMechanics = true, factionStateFlags = []) {
    if (Array.isArray(obj)) {
        return Promise.all(obj.map((item) => processObjectForEffects(item, skipExistingMechanics, factionStateFlags)));
    } else if (obj !== null && typeof obj === "object") {
        // If this object has factionStateFlags, use them for nested processing
        const effectiveFactionFlags = obj.factionStateFlags || factionStateFlags;
        const processed = {};

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                // Special handling for abilities, enhancements, stratagems, factionAbilities, and detachmentAbilities arrays
                if ((key === "abilities" || key === "enhancements" || key === "stratagems" || key === "factionAbilities" || key === "detachmentAbilities") && Array.isArray(obj[key])) {
                    const itemType =
                        key.charAt(0).toUpperCase() +
                        key
                            .slice(1)
                            .replace(/([A-Z])/g, " $1")
                            .trim();
                    console.log(`\n📋 Processing ${obj[key].length} ${itemType.toLowerCase()}...`);

                    processed[key] = await Promise.all(
                        obj[key].map(async (item, index) => {
                            const itemName = item.name || item.id || `${itemType} ${index + 1}`;
                            const processedItem = await processObjectForEffects(item, skipExistingMechanics, effectiveFactionFlags);

                            // Extract effects from the description
                            if (processedItem.description) {
                                // Skip if item already has effects and skipExistingMechanics is enabled
                                const hasExistingEffects = processedItem.mechanics && Array.isArray(processedItem.mechanics) && processedItem.mechanics.length > 0;

                                if (hasExistingEffects && skipExistingMechanics) {
                                    console.log(`[OpenAI] ⏭️  Skipping ${itemName} (already has ${processedItem.mechanics.length} effect(s))`);
                                } else {
                                    // First, check if this is a core ability with pre-defined mechanics
                                    const coreMechanics = getCoreAbilityMechanics(processedItem.name, processedItem.parameter);

                                    if (coreMechanics) {
                                        console.log(`[Core] ✅ Using pre-defined mechanics for ${itemName}` + (processedItem.parameter ? ` (${processedItem.parameter})` : ""));
                                        processedItem.mechanics = coreMechanics;
                                    } else {
                                        // Extract structured effects with OpenAI
                                        // Pass faction state flags for faction-specific states
                                        const structuredEffects = await extractStructuredEffectsWithOpenAI(processedItem.description, itemName, effectiveFactionFlags);
                                        if (structuredEffects && structuredEffects.length > 0) {
                                            processedItem.mechanics = structuredEffects;
                                        }
                                    }
                                }
                            }
                            return processedItem;
                        })
                    );
                } else {
                    // Check if this object should have effects extracted
                    if (shouldExtractMechanics(obj[key]) && typeof obj[key] === "object") {
                        processed[key] = await processObjectForEffects(obj[key], skipExistingMechanics, effectiveFactionFlags);

                        // Extract structured effects if this is a stratagem, ability, enhancement, or detachmentAbility
                        if (obj[key].description) {
                            // Check if we should skip items that already have effects
                            const hasExistingEffects = processed[key].mechanics && Array.isArray(processed[key].mechanics) && processed[key].mechanics.length > 0;

                            if (hasExistingEffects && skipExistingMechanics) {
                                const itemName = obj[key].name || obj[key].id || "Unknown item";
                                console.log(`[OpenAI] ⏭️  Skipping ${itemName} (already has ${processed[key].mechanics.length} effect(s))`);
                            } else if (!hasExistingEffects) {
                                const itemName = obj[key].name || obj[key].id || "Unknown item";

                                // First, check if this is a core ability with pre-defined mechanics
                                const coreMechanics = getCoreAbilityMechanics(obj[key].name, obj[key].parameter);

                                if (coreMechanics) {
                                    console.log(`[Core] ✅ Using pre-defined mechanics for ${itemName}` + (obj[key].parameter ? ` (${obj[key].parameter})` : ""));
                                    processed[key].mechanics = coreMechanics;
                                } else {
                                    const structuredEffects = await extractStructuredEffectsWithOpenAI(obj[key].description, itemName, effectiveFactionFlags);
                                    if (structuredEffects && structuredEffects.length > 0) {
                                        processed[key].mechanics = structuredEffects;
                                    }
                                }
                            }
                        }
                    } else {
                        processed[key] = await processObjectForEffects(obj[key], skipExistingMechanics, effectiveFactionFlags);
                    }
                }
            }
        }

        return processed;
    } else {
        return obj;
    }
}

/**
 * Processes a single JSON file to extract effects
 * @param {string} filePath - Path to the JSON file
 * @param {boolean} skipExistingMechanics - Whether to skip items that already have effects
 */
async function processJsonFileForEffects(filePath, skipExistingMechanics) {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(content);

        // Process the data
        const processedData = await processObjectForEffects(data, skipExistingMechanics);

        // Check if this is a datasheet file with leaderFooter
        // Datasheets have leaderFooter at the top level
        if (processedData.leaderFooter && typeof processedData.leaderFooter === "string") {
            const leaderConditions = extractLeaderConditions(processedData.leaderFooter);
            if (leaderConditions) {
                // Only set if we extracted conditions and either:
                // 1. skipExistingMechanics is false, OR
                // 2. there are no existing leaderConditions
                const hasExistingConditions = processedData.leaderConditions && Object.keys(processedData.leaderConditions).length > 0;

                if (!hasExistingConditions || !skipExistingMechanics) {
                    processedData.leaderConditions = leaderConditions;
                    console.log(`[LeaderFooter] ✅ Extracted leader conditions: ${JSON.stringify(leaderConditions)}`);
                } else {
                    console.log(`[LeaderFooter] ⏭️  Skipping (already has leaderConditions)`);
                }
            }
        }

        // Write back to file with proper formatting
        fs.writeFileSync(filePath, JSON.stringify(processedData, null, 2), "utf-8");

        return { processed: true };
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        return { processed: false, error: error.message };
    }
}

/**
 * Filters JSON files based on provided file paths or patterns
 * @param {string[]} allFiles - All found JSON files
 * @param {string[]} fileFilters - Array of file paths or patterns to match
 * @param {string} depotdataPath - Base path to depotdata directory
 * @returns {string[]} - Filtered array of file paths
 */
function filterFiles(allFiles, fileFilters, depotdataPath) {
    if (!fileFilters || fileFilters.length === 0) {
        return allFiles;
    }

    const normalizedDepotPath = depotdataPath.replace(/\\/g, "/");
    const filtered = [];

    for (const filePath of allFiles) {
        const normalizedPath = filePath.replace(/\\/g, "/");
        const relativePath = normalizedPath.replace(normalizedDepotPath + "/", "");

        // Check if this file matches any of the filters
        const matches = fileFilters.some((filter) => {
            const normalizedFilter = filter.replace(/\\/g, "/");

            // Exact match (relative path)
            if (relativePath === normalizedFilter || relativePath.endsWith("/" + normalizedFilter)) {
                return true;
            }

            // Partial match (contains filter)
            if (relativePath.includes(normalizedFilter)) {
                return true;
            }

            // Absolute path match
            if (normalizedPath === normalizedFilter || normalizedPath.endsWith("/" + normalizedFilter)) {
                return true;
            }

            // Filename match
            const fileName = path.basename(normalizedPath);
            if (fileName === normalizedFilter || fileName === path.basename(normalizedFilter)) {
                return true;
            }

            return false;
        });

        if (matches) {
            filtered.push(filePath);
        }
    }

    return filtered;
}

/**
 * Filters JSON files based on provided directory paths
 * @param {string[]} allFiles - All found JSON files
 * @param {string[]} directoryFilters - Array of directory paths to match
 * @param {string} depotdataPath - Base path to depotdata directory
 * @returns {string[]} - Filtered array of file paths
 */
function filterByDirectories(allFiles, directoryFilters, depotdataPath) {
    if (!directoryFilters || directoryFilters.length === 0) {
        return allFiles;
    }

    const normalizedDepotPath = depotdataPath.replace(/\\/g, "/");
    const filtered = [];

    for (const filePath of allFiles) {
        const normalizedPath = filePath.replace(/\\/g, "/");
        const relativePath = normalizedPath.replace(normalizedDepotPath + "/", "");

        // Check if this file is within any of the specified directories
        const matches = directoryFilters.some((dirFilter) => {
            const normalizedFilter = dirFilter.replace(/\\/g, "/").replace(/\/$/, ""); // Remove trailing slash

            // Check if relative path starts with the directory filter
            if (relativePath.startsWith(normalizedFilter + "/")) {
                return true;
            }

            // Check if relative path equals the directory filter (for files directly in that dir)
            if (relativePath.startsWith(normalizedFilter + "/") || relativePath === normalizedFilter) {
                return true;
            }

            // Check absolute path
            if (normalizedPath.includes("/" + normalizedFilter + "/")) {
                return true;
            }

            return false;
        });

        if (matches) {
            filtered.push(filePath);
        }
    }

    return filtered;
}

/**
 * Main function to extract effects from all JSON files in processed data directory
 * Reads from and writes to src/app/data/dist (the processed data directory)
 * @param {string[]} fileFilters - Optional array of file paths/patterns to process (if empty, processes all)
 * @param {string[]} directoryFilters - Optional array of directory paths to process
 */
async function processAllFiles(fileFilters = [], directoryFilters = []) {
    const dataPath = path.join(__dirname, "..", "..", "src", "app", "data", "dist");

    if (!fs.existsSync(dataPath)) {
        console.error(`Error: ${dataPath} does not exist`);
        console.error(`Please run 'npm run parse-depot-data' first to generate the processed data.`);
        process.exit(1);
    }

    // Configuration
    const skipExistingMechanics = process.env.SKIP_EXISTING_EFFECTS !== "false"; // Default to true
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error("❌ OPENAI_API_KEY not found in environment variables");
        console.error("   Please set OPENAI_API_KEY in your .env file or as an environment variable");
        process.exit(1);
    }

    console.log("🤖 OpenAI Effects Extraction Script");
    console.log(`⏭️  Skip existing effects: ${skipExistingMechanics ? "enabled" : "disabled"}`);
    console.log(`🤖 OpenAI Model: ${process.env.OPENAI_MODEL || "gpt-4o-mini"}`);
    if (directoryFilters.length > 0) {
        console.log(`📂 Filtering to ${directoryFilters.length} directory(ies):`);
        directoryFilters.forEach((filter) => console.log(`   - ${filter}`));
    }
    if (fileFilters.length > 0) {
        console.log(`📌 Filtering to ${fileFilters.length} file(s):`);
        fileFilters.forEach((filter) => console.log(`   - ${filter}`));
    }
    console.log("");

    // Find all JSON files recursively
    const allJsonFiles = [];

    function findJsonFiles(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                findJsonFiles(fullPath);
            } else if (entry.isFile() && entry.name.endsWith(".json")) {
                allJsonFiles.push(fullPath);
            }
        }
    }

    findJsonFiles(dataPath);

    // Filter by directories first, then by files
    let jsonFiles = allJsonFiles;

    if (directoryFilters.length > 0) {
        jsonFiles = filterByDirectories(jsonFiles, directoryFilters, dataPath);
    }

    if (fileFilters.length > 0) {
        jsonFiles = filterFiles(jsonFiles, fileFilters, dataPath);
    }

    const hasFilters = fileFilters.length > 0 || directoryFilters.length > 0;

    if (hasFilters && jsonFiles.length === 0) {
        console.error(`❌ No files found matching the provided filters`);
        console.error(`   Searched ${allJsonFiles.length} files`);
        process.exit(1);
    }

    console.log(`📁 Found ${jsonFiles.length} JSON file(s) to process (out of ${allJsonFiles.length} total)...\n`);

    let successCount = 0;
    let errorCount = 0;
    let fileIndex = 0;

    for (const jsonFile of jsonFiles) {
        fileIndex++;
        const relativePath = path.relative(dataPath, jsonFile);

        console.log(`[${fileIndex}/${jsonFiles.length}] Processing: ${relativePath}`);

        const result = await processJsonFileForEffects(jsonFile, skipExistingMechanics);

        if (result.processed) {
            successCount++;
            console.log(`✅ Completed: ${relativePath}\n`);
        } else {
            errorCount++;
            console.log(`❌ Failed: ${relativePath}${result.error ? ` (${result.error})` : ""}\n`);
        }
    }

    console.log("═".repeat(50));
    console.log(`📊 Processing Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📄 Total: ${jsonFiles.length}`);
    console.log("═".repeat(50));
}

/**
 * Parses an environment variable as an array (JSON or comma-separated)
 * @param {string} envVar - The environment variable value
 * @returns {string[]} - Parsed array of values
 */
function parseEnvArray(envVar) {
    if (!envVar) return [];

    try {
        // Try parsing as JSON array first
        const parsed = JSON.parse(envVar);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return [parsed];
    } catch {
        // If not JSON, treat as comma-separated list
        return envVar
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f);
    }
}

/**
 * CLI interface for running the function directly
 */
async function main() {
    // Get arguments from command line
    const args = process.argv.slice(2);

    // Check for file filters in environment variable
    let fileFilters = parseEnvArray(process.env.FILES_TO_PROCESS);

    // Check for directory filters in environment variable
    let directoryFilters = parseEnvArray(process.env.DIRECTORIES_TO_PROCESS);

    // Check if first argument looks like a description (starts with quote or is a short string)
    // vs a file path (contains slashes or ends with .json)
    const firstArg = args[0];
    const looksLikeDescription = firstArg && (firstArg.startsWith('"') || firstArg.startsWith("'") || (!firstArg.includes("/") && !firstArg.includes("\\") && !firstArg.endsWith(".json") && firstArg.length < 200));

    // If arguments provided and looks like description, run single description test
    if (args.length > 0 && looksLikeDescription) {
        const description = process.env.DESCRIPTION || args[0];
        const itemName = args[1] || "CLI Test";

        if (!description) {
            console.error("❌ Error: No description provided");
            console.error("   Provide description as argument or set DESCRIPTION environment variable");
            process.exit(1);
        }

        console.log("🤖 OpenAI Effects Extraction (Single Test)");
        console.log("═".repeat(50));

        const mechanics = await extractStructuredEffectsWithOpenAI(description, itemName);

        console.log("\n═".repeat(50));

        if (mechanics && mechanics.length > 0) {
            console.log("\n📋 Final Result:");
            console.log(JSON.stringify({ mechanics }, null, 2));
            process.exit(0);
        } else {
            console.log("\n⚠️  No effects extracted");
            process.exit(0);
        }
    } else {
        // Treat arguments as file paths if provided
        if (args.length > 0) {
            fileFilters = [...fileFilters, ...args];
        }

        // Process files (all if no filters, filtered if filters provided)
        await processAllFiles(fileFilters, directoryFilters);
    }
}

// Run if called directly (check if this file is being executed)
const isMainModule = process.argv[1] && (process.argv[1].endsWith("extract-effects.js") || process.argv[1].replace(/\\/g, "/").endsWith("extract-effects.js"));

if (isMainModule) {
    main().catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
}

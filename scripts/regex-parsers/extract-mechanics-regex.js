/**
 * Regex-based Mechanics Extractor
 *
 * Extracts structured mechanics from ability descriptions using regex patterns.
 * Only handles high-reliability patterns (~95%+ accuracy). Complex or ambiguous
 * descriptions should be processed by the OpenAI extractor.
 *
 * Usage:
 *   npm run extract-effects:regex
 *
 *   Process specific directories:
 *     DIRECTORIES_TO_PROCESS="factions/space-marines,factions/tyranids" npm run extract-effects:regex
 *
 *   Dry run (preview without writing):
 *     DRY_RUN=true npm run extract-effects:regex
 *
 * Run this BEFORE the OpenAI extractor. The OpenAI extractor will skip items
 * that already have mechanics extracted.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "..", "..", "src", "app", "data", "output");
const DRY_RUN = process.env.DRY_RUN === "true";

// Stats for reporting
const stats = {
    filesProcessed: 0,
    abilitiesProcessed: 0,
    mechanicsExtracted: 0,
    skippedExisting: 0,
    patterns: {},
};

/**
 * Clean HTML tags and normalize text for pattern matching
 */
function cleanDescription(description) {
    if (!description || typeof description !== "string") return "";
    return description
        .replace(/<[^>]+>/g, " ")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Check if text contains multiple roll modifiers with conditional language.
 * These complex abilities should be handled by OpenAI, not regex.
 *
 * Examples that should return true:
 * - "add 1 to the Hit roll. If the target is Battle-shocked, add 1 to the Wound roll as well."
 * - "subtract 1 from hit rolls. If this unit charged, add 1 to wound rolls."
 *
 * Examples that should return false:
 * - "add 1 to hit rolls" (simple, unconditional)
 * - "while leading a unit, add 1 to hit rolls" (single condition, single effect)
 */
function hasMultipleConditionalModifiers(text) {
    // Count how many times we see roll modifier patterns
    const rollModifierPattern = /(?:add|subtract)\s+\d+\s+(?:to|from)\s+(?:the\s+)?(?:hit|wound|save)\s+roll/gi;
    const modifierMatches = text.match(rollModifierPattern) || [];

    // If there's more than one roll modifier, check for conditional language
    if (modifierMatches.length > 1) {
        // Check for conditional keywords that indicate different conditions for different effects
        const conditionalPatterns = [
            /if\s+(?:the\s+)?target\s+is/i,
            /if\s+(?:the\s+)?(?:enemy\s+)?unit\s+is/i,
            /if\s+this\s+(?:model|unit)\s+(?:charged|moved|remained)/i,
            /as\s+well/i, // "add 1 to wound roll as well" implies conditional
            /in\s+addition/i,
        ];

        for (const pattern of conditionalPatterns) {
            if (pattern.test(text)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Pattern definitions for high-reliability extractions
 * Each pattern returns an array of mechanics or null if no match
 */
const PATTERNS = {
    /**
     * Invulnerable Save: "4+ invulnerable save", "an invulnerable save of 4+"
     * ~99% reliability
     */
    invulnerableSave: {
        name: "Invulnerable Save",
        extract: (text) => {
            // Pattern: "X+ invulnerable save" or "invulnerable save of X+"
            const match = text.match(/(\d)\+?\s*invulnerable\s+save|invulnerable\s+save\s+of\s+(\d)\+?/i);
            if (match) {
                const value = parseInt(match[1] || match[2], 10);
                return [
                    {
                        entity: "thisModel",
                        effect: "staticNumber",
                        attribute: "invSv",
                        value: value,
                    },
                ];
            }
            return null;
        },
    },

    /**
     * Feel No Pain: "5+ Feel No Pain", "Feel No Pain 5+", "a 5+ Feel No Pain"
     * ~99% reliability
     */
    feelNoPain: {
        name: "Feel No Pain",
        extract: (text) => {
            // Pattern: "X+ Feel No Pain" or "Feel No Pain X+" or "Feel No Pain of X+"
            const match = text.match(/(\d)\+?\s*feel\s+no\s+pain|feel\s+no\s+pain\s+(?:of\s+)?(\d)\+?/i);
            if (match) {
                const value = parseInt(match[1] || match[2], 10);
                return [
                    {
                        entity: "thisModel",
                        effect: "addsAbility",
                        abilities: ["FEEL NO PAIN"],
                        value: value,
                    },
                ];
            }
            return null;
        },
    },

    /**
     * Hit roll modifiers: "+1 to hit", "subtract 1 from hit rolls", "-1 to hit rolls"
     * Only extracts unconditional modifiers. Skips if conditional language detected.
     * ~95% reliability for simple cases
     */
    hitRollModifier: {
        name: "Hit Roll Modifier",
        extract: (text) => {
            // Skip if text contains multiple roll modifiers with conditions
            // e.g., "add 1 to Hit roll. If the target is X, add 1 to Wound roll"
            // These complex abilities should go to OpenAI
            if (hasMultipleConditionalModifiers(text)) {
                return null;
            }

            const mechanics = [];

            // Pattern: "add X to hit rolls" or "+X to hit"
            const bonusMatch = text.match(/(?:add\s+)?(\d+)\s+to\s+(?:the\s+)?hit\s+roll|(\+\d+)\s+to\s+hit/i);
            if (bonusMatch) {
                const value = parseInt(bonusMatch[1] || bonusMatch[2], 10);
                mechanics.push({
                    entity: "thisUnit",
                    effect: "rollBonus",
                    attribute: "h",
                    value: Math.abs(value),
                });
            }

            // Pattern: "subtract X from hit rolls" or "-X to hit"
            const penaltyMatch = text.match(/subtract\s+(\d+)\s+from\s+(?:the\s+)?hit\s+roll|(-\d+)\s+to\s+hit/i);
            if (penaltyMatch) {
                const value = parseInt(penaltyMatch[1] || penaltyMatch[2], 10);
                mechanics.push({
                    entity: "thisUnit",
                    effect: "rollPenalty",
                    attribute: "h",
                    value: Math.abs(value),
                });
            }

            return mechanics.length > 0 ? mechanics : null;
        },
    },

    /**
     * Wound roll modifiers: "+1 to wound", "subtract 1 from wound rolls"
     * Only extracts unconditional modifiers. Skips if conditional language detected.
     * ~95% reliability for simple cases
     */
    woundRollModifier: {
        name: "Wound Roll Modifier",
        extract: (text) => {
            // Skip if text contains multiple roll modifiers with conditions
            if (hasMultipleConditionalModifiers(text)) {
                return null;
            }

            const mechanics = [];

            // Pattern: "add X to wound rolls" or "+X to wound"
            const bonusMatch = text.match(/(?:add\s+)?(\d+)\s+to\s+(?:the\s+)?wound\s+roll|(\+\d+)\s+to\s+wound/i);
            if (bonusMatch) {
                const value = parseInt(bonusMatch[1] || bonusMatch[2], 10);
                mechanics.push({
                    entity: "thisUnit",
                    effect: "rollBonus",
                    attribute: "w",
                    value: Math.abs(value),
                });
            }

            // Pattern: "subtract X from wound rolls"
            const penaltyMatch = text.match(/subtract\s+(\d+)\s+from\s+(?:the\s+)?wound\s+roll|(-\d+)\s+to\s+wound/i);
            if (penaltyMatch) {
                const value = parseInt(penaltyMatch[1] || penaltyMatch[2], 10);
                mechanics.push({
                    entity: "thisUnit",
                    effect: "rollPenalty",
                    attribute: "w",
                    value: Math.abs(value),
                });
            }

            return mechanics.length > 0 ? mechanics : null;
        },
    },

    /**
     * Reroll hits: "re-roll hit rolls", "re-roll hit rolls of 1"
     * ~95% reliability
     */
    rerollHits: {
        name: "Reroll Hits",
        extract: (text) => {
            // Pattern: "re-roll hit rolls of 1" or "reroll hit rolls of 1"
            if (/re-?roll\s+(?:all\s+)?hit\s+rolls?\s+of\s+1/i.test(text)) {
                return [
                    {
                        entity: "thisUnit",
                        effect: "reroll",
                        attribute: "h",
                        value: "ones",
                    },
                ];
            }

            // Pattern: "re-roll failed hit rolls" or "reroll failed hit rolls"
            if (/re-?roll\s+failed\s+hit\s+rolls?/i.test(text)) {
                return [
                    {
                        entity: "thisUnit",
                        effect: "reroll",
                        attribute: "h",
                        value: "failed",
                    },
                ];
            }

            // Pattern: "re-roll hit rolls" (all) - but NOT "re-roll hit rolls of 1"
            if (/re-?roll\s+(?:all\s+)?hit\s+rolls?(?!\s+of)/i.test(text)) {
                return [
                    {
                        entity: "thisUnit",
                        effect: "reroll",
                        attribute: "h",
                        value: "all",
                    },
                ];
            }

            return null;
        },
    },

    /**
     * Reroll wounds: "re-roll wound rolls", "re-roll wound rolls of 1"
     * ~95% reliability
     */
    rerollWounds: {
        name: "Reroll Wounds",
        extract: (text) => {
            // Pattern: "re-roll wound rolls of 1"
            if (/re-?roll\s+(?:all\s+)?wound\s+rolls?\s+of\s+1/i.test(text)) {
                return [
                    {
                        entity: "thisUnit",
                        effect: "reroll",
                        attribute: "w",
                        value: "ones",
                    },
                ];
            }

            // Pattern: "re-roll failed wound rolls"
            if (/re-?roll\s+failed\s+wound\s+rolls?/i.test(text)) {
                return [
                    {
                        entity: "thisUnit",
                        effect: "reroll",
                        attribute: "w",
                        value: "failed",
                    },
                ];
            }

            // Pattern: "re-roll wound rolls" (all)
            if (/re-?roll\s+(?:all\s+)?wound\s+rolls?(?!\s+of)/i.test(text)) {
                return [
                    {
                        entity: "thisUnit",
                        effect: "reroll",
                        attribute: "w",
                        value: "all",
                    },
                ];
            }

            return null;
        },
    },

    /**
     * Damage reduction: "reduce the Damage by 1", "reduce Damage characteristic by 1"
     * ~95% reliability
     */
    damageReduction: {
        name: "Damage Reduction",
        extract: (text) => {
            // Pattern: "reduce the Damage by X" or "reduce Damage characteristic by X"
            const match = text.match(/reduce\s+(?:the\s+)?damage(?:\s+characteristic)?\s+(?:of\s+(?:that|the)\s+attack\s+)?by\s+(\d+)/i);
            if (match) {
                const value = parseInt(match[1], 10);
                return [
                    {
                        entity: "thisModel",
                        effect: "rollPenalty",
                        attribute: "d",
                        value: value,
                    },
                ];
            }
            return null;
        },
    },

    /**
     * Deadly Demise: "Deadly Demise D3", "Deadly Demise 1"
     * ~99% reliability
     */
    deadlyDemise: {
        name: "Deadly Demise",
        extract: (text) => {
            // Pattern: "Deadly Demise X" or "Deadly Demise DX"
            const match = text.match(/deadly\s+demise\s+(D?\d+)/i);
            if (match) {
                const value = match[1].toUpperCase();
                return [
                    {
                        entity: "thisModel",
                        effect: "addsAbility",
                        abilities: ["DEADLY DEMISE"],
                        value: value.startsWith("D") ? value : parseInt(value, 10),
                    },
                ];
            }
            return null;
        },
    },

    /**
     * Deep Strike: "has the Deep Strike ability", "This unit has Deep Strike"
     * ~99% reliability
     */
    deepStrike: {
        name: "Deep Strike",
        extract: (text) => {
            if (/(?:has|have|gains?)\s+(?:the\s+)?deep\s+strike(?:\s+ability)?/i.test(text)) {
                return [
                    {
                        entity: "thisUnit",
                        effect: "addsAbility",
                        abilities: ["DEEP STRIKE"],
                        value: true,
                    },
                ];
            }
            return null;
        },
    },

    /**
     * Scouts: "Scouts X\"", "has the Scouts 6\" ability"
     * ~99% reliability
     */
    scouts: {
        name: "Scouts",
        extract: (text) => {
            const match = text.match(/(?:has|have|gains?)\s+(?:the\s+)?scouts\s+(\d+)[""]?(?:\s+ability)?|scouts\s+(\d+)[""]?/i);
            if (match) {
                const value = parseInt(match[1] || match[2], 10);
                return [
                    {
                        entity: "thisUnit",
                        effect: "addsAbility",
                        abilities: ["SCOUTS"],
                        value: value,
                    },
                ];
            }
            return null;
        },
    },

    /**
     * Stealth: "has the Stealth ability", "This unit has Stealth"
     * ~99% reliability
     */
    stealth: {
        name: "Stealth",
        extract: (text) => {
            if (/(?:has|have|gains?)\s+(?:the\s+)?stealth(?:\s+ability)?/i.test(text)) {
                return [
                    {
                        entity: "thisUnit",
                        effect: "addsAbility",
                        abilities: ["STEALTH"],
                        value: true,
                    },
                ];
            }
            return null;
        },
    },

    /**
     * Lone Operative: "has the Lone Operative ability"
     * ~99% reliability
     */
    loneOperative: {
        name: "Lone Operative",
        extract: (text) => {
            if (/(?:has|have|gains?)\s+(?:the\s+)?lone\s+operative(?:\s+ability)?/i.test(text)) {
                return [
                    {
                        entity: "thisUnit",
                        effect: "addsAbility",
                        abilities: ["LONE OPERATIVE"],
                        value: true,
                    },
                ];
            }
            return null;
        },
    },

    /**
     * Infiltrators: "has the Infiltrators ability"
     * ~99% reliability
     */
    infiltrators: {
        name: "Infiltrators",
        extract: (text) => {
            if (/(?:has|have|gains?)\s+(?:the\s+)?infiltrators?(?:\s+ability)?/i.test(text)) {
                return [
                    {
                        entity: "thisUnit",
                        effect: "addsAbility",
                        abilities: ["INFILTRATORS"],
                        value: true,
                    },
                ];
            }
            return null;
        },
    },
};

/**
 * Extract mechanics from a description using all patterns
 * Returns { mechanics: [], matchedPatterns: [] } or null if no matches
 */
function extractMechanics(description) {
    const cleanedText = cleanDescription(description);
    if (!cleanedText) return null;

    const allMechanics = [];
    const matchedPatterns = [];

    for (const [patternKey, pattern] of Object.entries(PATTERNS)) {
        const mechanics = pattern.extract(cleanedText);
        if (mechanics && mechanics.length > 0) {
            allMechanics.push(...mechanics);
            matchedPatterns.push(pattern.name);
            stats.patterns[pattern.name] = (stats.patterns[pattern.name] || 0) + 1;
        }
    }

    if (allMechanics.length > 0) {
        return { mechanics: allMechanics, matchedPatterns };
    }

    return null;
}

/**
 * Process abilities array and extract mechanics
 */
function processAbilities(abilities, itemName = "Unknown") {
    if (!Array.isArray(abilities)) return abilities;

    return abilities.map((ability) => {
        stats.abilitiesProcessed++;

        // Skip if already has mechanics
        if (ability.mechanics && Array.isArray(ability.mechanics) && ability.mechanics.length > 0) {
            stats.skippedExisting++;
            return ability;
        }

        // Skip if no description
        if (!ability.description) {
            return ability;
        }

        // Try to extract mechanics
        const result = extractMechanics(ability.description);
        if (result) {
            stats.mechanicsExtracted++;
            const abilityName = ability.name || "Unknown ability";
            console.log(`   ✅ ${abilityName}: ${result.matchedPatterns.join(", ")}`);
            return {
                ...ability,
                mechanics: result.mechanics,
                mechanicsSource: "regex",
            };
        }

        return ability;
    });
}

/**
 * Process a single JSON file
 */
function processFile(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    let modified = false;

    const fileName = path.basename(filePath);
    const isFactionFile = fileName === "faction.json";

    // Process datasheet abilities
    if (data.abilities && Array.isArray(data.abilities)) {
        const originalCount = stats.mechanicsExtracted;
        data.abilities = processAbilities(data.abilities, data.name || fileName);
        if (stats.mechanicsExtracted > originalCount) {
            modified = true;
        }
    }

    // Process faction file specific arrays
    if (isFactionFile) {
        // Process faction abilities
        if (data.factionAbilities && Array.isArray(data.factionAbilities)) {
            const originalCount = stats.mechanicsExtracted;
            data.factionAbilities = processAbilities(data.factionAbilities, "Faction Abilities");
            if (stats.mechanicsExtracted > originalCount) {
                modified = true;
            }
        }

        // Process detachments
        if (data.detachments && Array.isArray(data.detachments)) {
            for (const detachment of data.detachments) {
                // Detachment abilities
                if (detachment.abilities && Array.isArray(detachment.abilities)) {
                    const originalCount = stats.mechanicsExtracted;
                    detachment.abilities = processAbilities(detachment.abilities, `${detachment.name} Abilities`);
                    if (stats.mechanicsExtracted > originalCount) {
                        modified = true;
                    }
                }

                // Enhancements
                if (detachment.enhancements && Array.isArray(detachment.enhancements)) {
                    const originalCount = stats.mechanicsExtracted;
                    detachment.enhancements = processAbilities(detachment.enhancements, `${detachment.name} Enhancements`);
                    if (stats.mechanicsExtracted > originalCount) {
                        modified = true;
                    }
                }

                // Stratagems
                if (detachment.stratagems && Array.isArray(detachment.stratagems)) {
                    const originalCount = stats.mechanicsExtracted;
                    detachment.stratagems = processAbilities(detachment.stratagems, `${detachment.name} Stratagems`);
                    if (stats.mechanicsExtracted > originalCount) {
                        modified = true;
                    }
                }
            }
        }
    }

    // Write back if modified and not dry run
    if (modified && !DRY_RUN) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }

    return modified;
}

/**
 * Find all JSON files in a directory recursively
 */
function findJsonFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...findJsonFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith(".json")) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Parse directory filters from environment variable
 */
function parseDirectoryFilters() {
    const envVar = process.env.DIRECTORIES_TO_PROCESS;
    if (!envVar) return null;

    try {
        const parsed = JSON.parse(envVar);
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
    } catch {
        return envVar
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean);
    }
}

/**
 * Main function
 */
async function main() {
    console.log("🔧 Regex-based Mechanics Extractor");
    console.log("═".repeat(50));

    if (DRY_RUN) {
        console.log("🏃 DRY RUN MODE - No files will be modified\n");
    }

    const directoryFilters = parseDirectoryFilters();

    // Find files to process
    let jsonFiles;
    if (directoryFilters) {
        console.log(`📂 Processing directories: ${directoryFilters.join(", ")}\n`);
        jsonFiles = [];
        for (const dir of directoryFilters) {
            const fullPath = path.join(DATA_PATH, dir);
            if (fs.existsSync(fullPath)) {
                jsonFiles.push(...findJsonFiles(fullPath));
            } else {
                console.warn(`⚠️  Directory not found: ${dir}`);
            }
        }
    } else {
        console.log(`📂 Processing all files in: ${DATA_PATH}\n`);
        jsonFiles = findJsonFiles(DATA_PATH);
    }

    // Filter to faction.json and datasheet files only
    jsonFiles = jsonFiles.filter((f) => {
        const fileName = path.basename(f);
        const dirName = path.basename(path.dirname(f));
        return fileName === "faction.json" || dirName === "datasheets";
    });

    console.log(`📄 Found ${jsonFiles.length} files to process\n`);

    for (const filePath of jsonFiles) {
        const relativePath = path.relative(DATA_PATH, filePath);
        stats.filesProcessed++;

        const modified = processFile(filePath);
        if (modified) {
            console.log(`📝 ${relativePath}\n`);
        }
    }

    // Print summary
    console.log("═".repeat(50));
    console.log("📊 Summary:");
    console.log(`   Files processed: ${stats.filesProcessed}`);
    console.log(`   Abilities processed: ${stats.abilitiesProcessed}`);
    console.log(`   Mechanics extracted: ${stats.mechanicsExtracted}`);
    console.log(`   Skipped (existing): ${stats.skippedExisting}`);

    if (Object.keys(stats.patterns).length > 0) {
        console.log("\n📋 Patterns matched:");
        for (const [pattern, count] of Object.entries(stats.patterns).sort((a, b) => b[1] - a[1])) {
            console.log(`   ${pattern}: ${count}`);
        }
    }

    console.log("═".repeat(50));
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});

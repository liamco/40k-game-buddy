/**
 * Migrate Abilities Script
 *
 * Combines two operations:
 * 1. Clean Core Abilities - Removes embedded mechanics from abilities defined in core-abilities.json
 * 2. Migrate Faction Abilities - Extracts Faction abilities from datasheets to faction.json
 *
 * Since the game engine looks up Core and Faction abilities at runtime, we don't need
 * duplicated mechanics in every datasheet. This reduces file sizes and ensures consistency.
 *
 * Usage:
 *   node scripts/regex-parsers/migrate-abilities.js
 *
 *   Options:
 *     DRY_RUN=true   Preview changes without writing files
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
    getDataOutputPath,
    findFactionDirectories,
    readJsonFile,
    writeJsonFile,
    printHeader,
    printSummary,
    deepEqual,
} from "./parser-utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.env.DRY_RUN === "true";

// ============================================================================
// CORE ABILITIES CLEANING
// ============================================================================

// Load core abilities registry
let CORE_ABILITIES = {};

function loadCoreAbilities(dataPath) {
    const coreAbilitiesPath = path.join(dataPath, "core-abilities.json");
    if (fs.existsSync(coreAbilitiesPath)) {
        const coreAbilitiesData = readJsonFile(coreAbilitiesPath);
        if (coreAbilitiesData) {
            CORE_ABILITIES = coreAbilitiesData.abilities || {};
            console.log(`📚 Loaded ${Object.keys(CORE_ABILITIES).length} core abilities from registry`);
            return true;
        }
    }
    console.error(`❌ Core abilities file not found at ${coreAbilitiesPath}`);
    return false;
}

/**
 * Checks if an ability is a core ability
 */
function isCoreAbility(abilityName) {
    const normalizedName = abilityName?.toUpperCase()?.trim();
    return normalizedName in CORE_ABILITIES;
}

/**
 * Remove mechanics from core abilities in an abilities array
 * @returns {object} - { abilities, coreRemoved }
 */
function cleanCoreAbilities(abilities) {
    if (!Array.isArray(abilities)) {
        return { abilities, coreRemoved: 0 };
    }

    let coreRemoved = 0;

    const cleaned = abilities.map((ability) => {
        const hasMechanics =
            ability.mechanics && Array.isArray(ability.mechanics) && ability.mechanics.length > 0;

        if (!hasMechanics) return ability;

        if (isCoreAbility(ability.name)) {
            coreRemoved++;
            const { mechanics, ...rest } = ability;
            return rest;
        }

        return ability;
    });

    return { abilities: cleaned, coreRemoved };
}

// ============================================================================
// FACTION ABILITIES MIGRATION
// ============================================================================

/**
 * Process a single faction directory
 * - Extract Faction abilities from datasheets
 * - Centralize them in faction.json
 * - Replace with factionAbilityIds references
 */
function processFaction(factionDir) {
    const factionJsonPath = path.join(factionDir, "faction.json");
    const datasheetsDir = path.join(factionDir, "datasheets");

    const stats = {
        datasheets: 0,
        coreAbilitiesCleaned: 0,
        factionAbilitiesExtracted: 0,
        factionReferencesAdded: 0,
    };

    if (!fs.existsSync(factionJsonPath)) {
        return stats;
    }

    if (!fs.existsSync(datasheetsDir)) {
        return stats;
    }

    // Load faction.json
    const factionData = readJsonFile(factionJsonPath);
    if (!factionData) return stats;

    // Map to store unique faction abilities by ID
    const factionAbilitiesMap = new Map();

    // Get existing faction abilities if any
    if (factionData.factionAbilities && Array.isArray(factionData.factionAbilities)) {
        for (const ability of factionData.factionAbilities) {
            factionAbilitiesMap.set(ability.id, ability);
        }
    }

    // Get all datasheet files
    const datasheetFiles = fs.readdirSync(datasheetsDir).filter((f) => f.endsWith(".json"));

    for (const datasheetFile of datasheetFiles) {
        const datasheetPath = path.join(datasheetsDir, datasheetFile);
        const datasheet = readJsonFile(datasheetPath);

        if (!datasheet) continue;

        stats.datasheets++;
        let modified = false;

        // Clean core abilities
        if (datasheet.abilities && Array.isArray(datasheet.abilities)) {
            const coreResult = cleanCoreAbilities(datasheet.abilities);
            if (coreResult.coreRemoved > 0) {
                datasheet.abilities = coreResult.abilities;
                stats.coreAbilitiesCleaned += coreResult.coreRemoved;
                modified = true;
            }
        }

        // Extract faction abilities
        if (datasheet.abilities && Array.isArray(datasheet.abilities)) {
            const factionAbilityIds = [];
            const remainingAbilities = [];

            for (const ability of datasheet.abilities) {
                if (ability.type === "Faction" && ability.id) {
                    // This is a faction ability - extract it
                    if (!factionAbilitiesMap.has(ability.id)) {
                        // New faction ability - add to map
                        factionAbilitiesMap.set(ability.id, {
                            id: ability.id,
                            name: ability.name,
                            type: "Faction",
                            description: ability.description,
                            legend: ability.legend || "",
                            mechanics: ability.mechanics || [],
                        });
                        stats.factionAbilitiesExtracted++;
                    } else {
                        // Check if mechanics differ and update if current has mechanics
                        const existing = factionAbilitiesMap.get(ability.id);
                        if (ability.mechanics && ability.mechanics.length > 0) {
                            if (!existing.mechanics || existing.mechanics.length === 0) {
                                existing.mechanics = ability.mechanics;
                                factionAbilitiesMap.set(ability.id, existing);
                            } else if (!deepEqual(existing.mechanics, ability.mechanics)) {
                                // Mechanics differ - use the one with more conditions (likely more complete)
                                const existingConditions = JSON.stringify(existing.mechanics).length;
                                const newConditions = JSON.stringify(ability.mechanics).length;
                                if (newConditions > existingConditions) {
                                    existing.mechanics = ability.mechanics;
                                    factionAbilitiesMap.set(ability.id, existing);
                                }
                            }
                        }
                    }

                    // Add reference
                    factionAbilityIds.push(ability.id);
                    stats.factionReferencesAdded++;
                    modified = true;
                } else {
                    // Keep non-faction abilities inline
                    remainingAbilities.push(ability);
                }
            }

            // Update datasheet if we found faction abilities
            if (factionAbilityIds.length > 0) {
                datasheet.factionAbilityIds = factionAbilityIds;
                datasheet.abilities = remainingAbilities;
            }
        }

        // Write updated datasheet
        if (modified && !DRY_RUN) {
            writeJsonFile(datasheetPath, datasheet);
        }
    }

    // Add faction abilities to faction.json
    const factionAbilities = Array.from(factionAbilitiesMap.values());
    if (factionAbilities.length > 0 && !DRY_RUN) {
        factionData.factionAbilities = factionAbilities;
        writeJsonFile(factionJsonPath, factionData);
    }

    return stats;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    printHeader("Migrate Abilities (Core + Faction)");

    const dataPath = getDataOutputPath(__dirname);

    if (!fs.existsSync(dataPath)) {
        console.error(`❌ Data path not found: ${dataPath}`);
        console.error(`   Run 'npm run parse-depot-data' first to generate the processed data.`);
        process.exit(1);
    }

    console.log(`📁 Data path: ${dataPath}`);
    console.log(`🧪 Dry run: ${DRY_RUN ? "YES (no files will be modified)" : "NO"}`);
    console.log("");

    // Load core abilities registry
    if (!loadCoreAbilities(dataPath)) {
        process.exit(1);
    }
    console.log("");

    // Get all faction directories
    const factionsPath = path.join(dataPath, "factions");
    const factionDirs = findFactionDirectories(factionsPath);

    console.log(`📁 Found ${factionDirs.length} faction directories\n`);

    const totals = {
        factions: 0,
        datasheets: 0,
        coreAbilitiesCleaned: 0,
        factionAbilitiesExtracted: 0,
        factionReferencesAdded: 0,
    };

    for (const factionDir of factionDirs) {
        const factionName = path.basename(factionDir);
        const stats = processFaction(factionDir);

        if (stats.coreAbilitiesCleaned > 0 || stats.factionAbilitiesExtracted > 0) {
            console.log(`📂 ${factionName}:`);
            if (stats.coreAbilitiesCleaned > 0) {
                console.log(`   🗑️  Core ability mechanics removed: ${stats.coreAbilitiesCleaned}`);
            }
            if (stats.factionAbilitiesExtracted > 0) {
                console.log(`   ✅ Faction abilities extracted: ${stats.factionAbilitiesExtracted}`);
                console.log(`   🔗 References added: ${stats.factionReferencesAdded}`);
            }
        }

        totals.factions++;
        totals.datasheets += stats.datasheets;
        totals.coreAbilitiesCleaned += stats.coreAbilitiesCleaned;
        totals.factionAbilitiesExtracted += stats.factionAbilitiesExtracted;
        totals.factionReferencesAdded += stats.factionReferencesAdded;
    }

    printSummary({
        "Factions processed": totals.factions,
        "Datasheets processed": totals.datasheets,
        "Core ability mechanics removed": totals.coreAbilitiesCleaned,
        "Faction abilities extracted": totals.factionAbilitiesExtracted,
        "Faction references added": totals.factionReferencesAdded,
    });

    if (DRY_RUN) {
        console.log("\n💡 Run without DRY_RUN=true to apply changes");
    }
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});

/**
 * Clean Core Abilities Script
 *
 * Removes embedded mechanics from abilities that are defined in core-abilities.json.
 * Since the game engine now looks up core abilities at runtime, we don't need
 * duplicated mechanics in every datasheet.
 *
 * Usage:
 *   node scripts/clean-core-abilities.js
 *
 *   Or with options:
 *     DRY_RUN=true node scripts/clean-core-abilities.js  # Preview changes without writing files
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load core abilities registry from processed data directory
const coreAbilitiesPath = path.join(__dirname, "..", "..", "src", "app", "data", "core-abilities.json");

let CORE_ABILITIES = {};
if (fs.existsSync(coreAbilitiesPath)) {
    const coreAbilitiesData = JSON.parse(fs.readFileSync(coreAbilitiesPath, "utf-8"));
    CORE_ABILITIES = coreAbilitiesData.abilities || {};
    console.log(`📚 Loaded ${Object.keys(CORE_ABILITIES).length} core abilities from registry`);
} else {
    console.error(`❌ Core abilities file not found at ${coreAbilitiesPath}`);
    process.exit(1);
}

/**
 * Checks if an ability is a core ability
 * @param {string} abilityName - The ability name to check
 * @returns {boolean} - True if this is a core ability
 */
function isCoreAbility(abilityName) {
    const normalizedName = abilityName?.toUpperCase()?.trim();
    return normalizedName in CORE_ABILITIES;
}

/**
 * Processes abilities array and removes mechanics from core abilities
 * @param {Array} abilities - Array of ability objects
 * @param {boolean} dryRun - If true, don't modify the abilities, just count
 * @returns {object} - Stats about what was processed
 */
function processAbilities(abilities, dryRun = false) {
    const stats = {
        total: 0,
        removedMechanics: 0,
        keptMechanics: 0,
        noMechanics: 0,
    };

    if (!Array.isArray(abilities)) {
        return stats;
    }

    for (const ability of abilities) {
        stats.total++;

        const hasMechanics = ability.mechanics && Array.isArray(ability.mechanics) && ability.mechanics.length > 0;

        if (!hasMechanics) {
            stats.noMechanics++;
            continue;
        }

        if (isCoreAbility(ability.name)) {
            stats.removedMechanics++;
            if (!dryRun) {
                delete ability.mechanics;
            }
        } else {
            stats.keptMechanics++;
        }
    }

    return stats;
}

/**
 * Processes a single JSON file
 * @param {string} filePath - Path to the JSON file
 * @param {boolean} dryRun - If true, don't modify files
 * @returns {object} - Stats about what was processed
 */
function processJsonFile(filePath, dryRun = false) {
    const stats = {
        abilities: { total: 0, removedMechanics: 0, keptMechanics: 0, noMechanics: 0 },
        modified: false,
    };

    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(content);

        // Process abilities array (in datasheets)
        if (data.abilities && Array.isArray(data.abilities)) {
            const abilityStats = processAbilities(data.abilities, dryRun);
            stats.abilities.total += abilityStats.total;
            stats.abilities.removedMechanics += abilityStats.removedMechanics;
            stats.abilities.keptMechanics += abilityStats.keptMechanics;
            stats.abilities.noMechanics += abilityStats.noMechanics;

            if (abilityStats.removedMechanics > 0) {
                stats.modified = true;
            }
        }

        // Write back if modified and not dry run
        if (stats.modified && !dryRun) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
        }

        return stats;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return stats;
    }
}

/**
 * Main function
 */
async function main() {
    const dataPath = path.join(__dirname, "..", "..", "src", "app", "data");

    if (!fs.existsSync(dataPath)) {
        console.error(`Error: ${dataPath} does not exist`);
        console.error(`Please run 'npm run parse-depot-data' first to generate the processed data.`);
        process.exit(1);
    }

    const dryRun = process.env.DRY_RUN === "true";

    console.log("\n🧹 Clean Core Abilities Script");
    console.log("═".repeat(50));
    console.log(`📁 Data path: ${dataPath}`);
    console.log(`🧪 Dry run: ${dryRun ? "YES (no files will be modified)" : "NO"}`);
    console.log("");

    // Find all datasheet JSON files
    const jsonFiles = [];

    function findDatasheetFiles(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                findDatasheetFiles(fullPath);
            } else if (entry.isFile() && entry.name.endsWith(".json")) {
                // Only process datasheet files (in datasheets directories)
                if (fullPath.includes("/datasheets/") || fullPath.includes("\\datasheets\\")) {
                    jsonFiles.push(fullPath);
                }
            }
        }
    }

    findDatasheetFiles(dataPath);

    console.log(`📄 Found ${jsonFiles.length} datasheet files\n`);

    // Process all files
    const totals = {
        files: jsonFiles.length,
        filesModified: 0,
        abilities: { total: 0, removedMechanics: 0, keptMechanics: 0, noMechanics: 0 },
    };

    for (const jsonFile of jsonFiles) {
        const stats = processJsonFile(jsonFile, dryRun);

        if (stats.modified) {
            totals.filesModified++;
            const relativePath = path.relative(dataPath, jsonFile);
            console.log(`✅ ${dryRun ? "[DRY RUN] Would clean" : "Cleaned"}: ${relativePath}`);
        }

        totals.abilities.total += stats.abilities.total;
        totals.abilities.removedMechanics += stats.abilities.removedMechanics;
        totals.abilities.keptMechanics += stats.abilities.keptMechanics;
        totals.abilities.noMechanics += stats.abilities.noMechanics;
    }

    // Summary
    console.log("\n" + "═".repeat(50));
    console.log("📊 Summary:");
    console.log(`   📄 Files processed: ${totals.files}`);
    console.log(`   📝 Files ${dryRun ? "that would be" : ""} modified: ${totals.filesModified}`);
    console.log("");
    console.log(`   📋 Abilities processed: ${totals.abilities.total}`);
    console.log(`   🗑️  Core ability mechanics removed: ${totals.abilities.removedMechanics}`);
    console.log(`   ✅ Non-core mechanics kept: ${totals.abilities.keptMechanics}`);
    console.log(`   ➖ No mechanics to remove: ${totals.abilities.noMechanics}`);
    console.log("═".repeat(50));

    if (dryRun && totals.filesModified > 0) {
        console.log("\n💡 Run without DRY_RUN=true to apply changes");
    }
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});

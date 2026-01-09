/**
 * Apply Core Abilities Script
 *
 * Applies pre-defined mechanics from core-abilities.json to existing datasheets.
 * This allows updating datasheets with core ability mechanics without calling OpenAI.
 *
 * Usage:
 *   npm run apply-core-abilities
 *
 *   Or with options:
 *     DRY_RUN=true npm run apply-core-abilities  # Preview changes without writing files
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load core abilities registry
const coreAbilitiesPath = path.join(
    __dirname,
    "..",
    "src",
    "app",
    "depotdata",
    "core-abilities.json"
);

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
 * Processes abilities array and applies core ability mechanics
 * @param {Array} abilities - Array of ability objects
 * @param {boolean} dryRun - If true, don't modify the abilities, just count
 * @returns {object} - Stats about what was processed
 */
function processAbilities(abilities, dryRun = false) {
    const stats = {
        total: 0,
        alreadyHasMechanics: 0,
        appliedCore: 0,
        notCore: 0,
    };

    if (!Array.isArray(abilities)) {
        return stats;
    }

    for (const ability of abilities) {
        stats.total++;

        // Skip if already has mechanics
        if (ability.mechanics && Array.isArray(ability.mechanics) && ability.mechanics.length > 0) {
            stats.alreadyHasMechanics++;
            continue;
        }

        // Try to get core ability mechanics
        const coreMechanics = getCoreAbilityMechanics(ability.name, ability.parameter);

        if (coreMechanics) {
            stats.appliedCore++;
            if (!dryRun) {
                ability.mechanics = coreMechanics;
            }
        } else {
            stats.notCore++;
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
        abilities: { total: 0, alreadyHasMechanics: 0, appliedCore: 0, notCore: 0 },
        modified: false,
    };

    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(content);

        // Process abilities array (in datasheets)
        if (data.abilities && Array.isArray(data.abilities)) {
            const abilityStats = processAbilities(data.abilities, dryRun);
            stats.abilities.total += abilityStats.total;
            stats.abilities.alreadyHasMechanics += abilityStats.alreadyHasMechanics;
            stats.abilities.appliedCore += abilityStats.appliedCore;
            stats.abilities.notCore += abilityStats.notCore;

            if (abilityStats.appliedCore > 0) {
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
    const depotdataPath = path.join(__dirname, "..", "src", "app", "depotdata");

    if (!fs.existsSync(depotdataPath)) {
        console.error(`Error: ${depotdataPath} does not exist`);
        process.exit(1);
    }

    const dryRun = process.env.DRY_RUN === "true";

    console.log("\n🔧 Apply Core Abilities Script");
    console.log("═".repeat(50));
    console.log(`📁 Data path: ${depotdataPath}`);
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

    findDatasheetFiles(depotdataPath);

    console.log(`📄 Found ${jsonFiles.length} datasheet files\n`);

    // Process all files
    const totals = {
        files: jsonFiles.length,
        filesModified: 0,
        abilities: { total: 0, alreadyHasMechanics: 0, appliedCore: 0, notCore: 0 },
    };

    const appliedByAbility = {};

    for (const jsonFile of jsonFiles) {
        const stats = processJsonFile(jsonFile, dryRun);

        if (stats.modified) {
            totals.filesModified++;
            const relativePath = path.relative(depotdataPath, jsonFile);
            console.log(`✅ ${dryRun ? "[DRY RUN] Would update" : "Updated"}: ${relativePath}`);
        }

        totals.abilities.total += stats.abilities.total;
        totals.abilities.alreadyHasMechanics += stats.abilities.alreadyHasMechanics;
        totals.abilities.appliedCore += stats.abilities.appliedCore;
        totals.abilities.notCore += stats.abilities.notCore;
    }

    // Summary
    console.log("\n" + "═".repeat(50));
    console.log("📊 Summary:");
    console.log(`   📄 Files processed: ${totals.files}`);
    console.log(`   📝 Files ${dryRun ? "that would be" : ""} modified: ${totals.filesModified}`);
    console.log("");
    console.log(`   📋 Abilities processed: ${totals.abilities.total}`);
    console.log(`   ⏭️  Already had mechanics: ${totals.abilities.alreadyHasMechanics}`);
    console.log(`   ✅ Core mechanics applied: ${totals.abilities.appliedCore}`);
    console.log(`   ❓ Not core abilities: ${totals.abilities.notCore}`);
    console.log("═".repeat(50));

    if (dryRun && totals.filesModified > 0) {
        console.log("\n💡 Run without DRY_RUN=true to apply changes");
    }
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});

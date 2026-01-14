/**
 * Migrate Faction Abilities Script
 *
 * Extracts faction abilities (type: "Faction") from datasheets and centralizes them
 * in faction.json files. Replaces the full ability objects in datasheets with
 * factionAbilityIds references.
 *
 * This reduces duplication (e.g., Oath of Moment appears in 275+ Space Marines datasheets)
 * and allows OpenAI to process each faction ability only once.
 *
 * Usage:
 *   node scripts/migrate-faction-abilities.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read from and write to the processed data directory
const DATA_PATH = path.join(__dirname, "..", "..", "src", "app", "data", "factions");

/**
 * Deep equality check for two objects
 */
function deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Process a single faction directory
 * @param {string} factionDir - Path to the faction directory
 * @returns {object} - Stats about the migration
 */
function processFaction(factionDir) {
    const factionJsonPath = path.join(factionDir, "faction.json");
    const datasheetsDir = path.join(factionDir, "datasheets");

    if (!fs.existsSync(factionJsonPath)) {
        console.log(`  ⚠️  No faction.json found, skipping`);
        return { datasheets: 0, abilitiesExtracted: 0, referencesAdded: 0 };
    }

    if (!fs.existsSync(datasheetsDir)) {
        console.log(`  ⚠️  No datasheets directory found, skipping`);
        return { datasheets: 0, abilitiesExtracted: 0, referencesAdded: 0 };
    }

    // Load faction.json
    const factionData = JSON.parse(fs.readFileSync(factionJsonPath, "utf-8"));

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

    let referencesAdded = 0;

    for (const datasheetFile of datasheetFiles) {
        const datasheetPath = path.join(datasheetsDir, datasheetFile);
        const datasheet = JSON.parse(fs.readFileSync(datasheetPath, "utf-8"));

        if (!datasheet.abilities || !Array.isArray(datasheet.abilities)) {
            continue;
        }

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
                referencesAdded++;
            } else {
                // Keep non-faction abilities inline
                remainingAbilities.push(ability);
            }
        }

        // Update datasheet if we found faction abilities
        if (factionAbilityIds.length > 0) {
            datasheet.factionAbilityIds = factionAbilityIds;
            datasheet.abilities = remainingAbilities;

            // Write updated datasheet
            fs.writeFileSync(datasheetPath, JSON.stringify(datasheet, null, 2), "utf-8");
        }
    }

    // Add faction abilities to faction.json
    const factionAbilities = Array.from(factionAbilitiesMap.values());
    if (factionAbilities.length > 0) {
        factionData.factionAbilities = factionAbilities;
        fs.writeFileSync(factionJsonPath, JSON.stringify(factionData, null, 2), "utf-8");
    }

    return {
        datasheets: datasheetFiles.length,
        abilitiesExtracted: factionAbilities.length,
        referencesAdded,
    };
}

/**
 * Main function
 */
function main() {
    console.log("═".repeat(60));
    console.log("🔄 Migrating Faction Abilities to faction.json");
    console.log("═".repeat(60));
    console.log("");

    if (!fs.existsSync(DATA_PATH)) {
        console.error(`❌ Depot data path not found: ${DATA_PATH}`);
        process.exit(1);
    }

    // Get all faction directories
    const factionDirs = fs
        .readdirSync(DATA_PATH, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

    console.log(`📁 Found ${factionDirs.length} faction directories\n`);

    let totalStats = {
        factions: 0,
        datasheets: 0,
        abilitiesExtracted: 0,
        referencesAdded: 0,
    };

    for (const factionDir of factionDirs) {
        const factionPath = path.join(DATA_PATH, factionDir);
        console.log(`📂 Processing: ${factionDir}`);

        const stats = processFaction(factionPath);

        if (stats.abilitiesExtracted > 0) {
            console.log(`   ✅ Extracted ${stats.abilitiesExtracted} unique faction abilities`);
            console.log(`   ✅ Added ${stats.referencesAdded} references across ${stats.datasheets} datasheets`);
        } else if (stats.datasheets > 0) {
            console.log(`   ℹ️  No faction abilities found in ${stats.datasheets} datasheets`);
        }

        totalStats.factions++;
        totalStats.datasheets += stats.datasheets;
        totalStats.abilitiesExtracted += stats.abilitiesExtracted;
        totalStats.referencesAdded += stats.referencesAdded;

        console.log("");
    }

    console.log("═".repeat(60));
    console.log("📊 Migration Summary:");
    console.log(`   📁 Factions processed: ${totalStats.factions}`);
    console.log(`   📄 Datasheets processed: ${totalStats.datasheets}`);
    console.log(`   🎯 Unique faction abilities extracted: ${totalStats.abilitiesExtracted}`);
    console.log(`   🔗 References added to datasheets: ${totalStats.referencesAdded}`);
    console.log("═".repeat(60));
}

main();

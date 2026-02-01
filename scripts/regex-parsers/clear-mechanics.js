/**
 * Clear Mechanics by Source
 *
 * Removes mechanics from abilities based on their mechanicsSource value.
 * Useful for re-running extractors after fixing patterns.
 *
 * Usage:
 *   Clear all regex-extracted mechanics:
 *     SOURCE=regex node scripts/regex-parsers/clear-mechanics.js
 *
 *   Clear all OpenAI-extracted mechanics:
 *     SOURCE=openai node scripts/regex-parsers/clear-mechanics.js
 *
 *   Limit to specific directories:
 *     SOURCE=regex DIRECTORIES_TO_PROCESS="factions/tyranids" node scripts/regex-parsers/clear-mechanics.js
 *
 *   Dry run (preview without writing):
 *     SOURCE=regex DRY_RUN=true node scripts/regex-parsers/clear-mechanics.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "..", "..", "src", "app", "data", "output");
const DRY_RUN = process.env.DRY_RUN === "true";
const SOURCE = process.env.SOURCE;

if (!SOURCE) {
    console.error("❌ ERROR: SOURCE environment variable is required");
    console.error("   Usage: SOURCE=regex node scripts/regex-parsers/clear-mechanics.js");
    console.error("   Valid sources: regex, openai, core");
    process.exit(1);
}

// Stats for reporting
const stats = {
    filesProcessed: 0,
    filesModified: 0,
    abilitiesCleared: 0,
};

/**
 * Clear mechanics from abilities array based on source
 */
function clearMechanicsFromAbilities(abilities, source) {
    if (!Array.isArray(abilities)) return { abilities, cleared: 0 };

    let cleared = 0;

    const updatedAbilities = abilities.map((ability) => {
        if (ability.mechanicsSource === source) {
            cleared++;
            // Remove mechanics and mechanicsSource, keep everything else
            const { mechanics, mechanicsSource, ...rest } = ability;
            return rest;
        }
        return ability;
    });

    return { abilities: updatedAbilities, cleared };
}

/**
 * Process a single JSON file
 */
function processFile(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    let totalCleared = 0;

    const fileName = path.basename(filePath);
    const isFactionFile = fileName === "faction.json";

    // Process datasheet abilities
    if (data.abilities && Array.isArray(data.abilities)) {
        const result = clearMechanicsFromAbilities(data.abilities, SOURCE);
        data.abilities = result.abilities;
        totalCleared += result.cleared;
    }

    // Process faction file specific arrays
    if (isFactionFile) {
        // Process faction abilities
        if (data.factionAbilities && Array.isArray(data.factionAbilities)) {
            const result = clearMechanicsFromAbilities(data.factionAbilities, SOURCE);
            data.factionAbilities = result.abilities;
            totalCleared += result.cleared;
        }

        // Process detachments
        if (data.detachments && Array.isArray(data.detachments)) {
            for (const detachment of data.detachments) {
                // Detachment abilities
                if (detachment.abilities && Array.isArray(detachment.abilities)) {
                    const result = clearMechanicsFromAbilities(detachment.abilities, SOURCE);
                    detachment.abilities = result.abilities;
                    totalCleared += result.cleared;
                }

                // Enhancements
                if (detachment.enhancements && Array.isArray(detachment.enhancements)) {
                    const result = clearMechanicsFromAbilities(detachment.enhancements, SOURCE);
                    detachment.enhancements = result.abilities;
                    totalCleared += result.cleared;
                }

                // Stratagems
                if (detachment.stratagems && Array.isArray(detachment.stratagems)) {
                    const result = clearMechanicsFromAbilities(detachment.stratagems, SOURCE);
                    detachment.stratagems = result.abilities;
                    totalCleared += result.cleared;
                }
            }
        }
    }

    // Write back if modified and not dry run
    if (totalCleared > 0) {
        stats.abilitiesCleared += totalCleared;
        stats.filesModified++;

        if (!DRY_RUN) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
        }

        const relativePath = path.relative(DATA_PATH, filePath);
        console.log(`   ${relativePath}: cleared ${totalCleared} abilities`);
    }

    return totalCleared > 0;
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
        return envVar.split(",").map((d) => d.trim()).filter(Boolean);
    }
}

/**
 * Main function
 */
async function main() {
    console.log("🧹 Clear Mechanics by Source");
    console.log("═".repeat(50));
    console.log(`   Source to clear: ${SOURCE}`);

    if (DRY_RUN) {
        console.log("   Mode: DRY RUN (no files will be modified)\n");
    } else {
        console.log("   Mode: LIVE (files will be modified)\n");
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
        stats.filesProcessed++;
        processFile(filePath);
    }

    // Print summary
    console.log("\n" + "═".repeat(50));
    console.log("📊 Summary:");
    console.log(`   Files processed: ${stats.filesProcessed}`);
    console.log(`   Files modified: ${stats.filesModified}`);
    console.log(`   Abilities cleared: ${stats.abilitiesCleared}`);

    if (DRY_RUN && stats.abilitiesCleared > 0) {
        console.log("\n⚠️  DRY RUN - No files were actually modified");
        console.log("   Run without DRY_RUN=true to apply changes");
    }

    console.log("═".repeat(50));
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});

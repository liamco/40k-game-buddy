/**
 * Parse Damaged Profiles Script
 *
 * Extracts structured mechanics from damagedW and damagedDescription fields.
 * Converts text like "While this model has 1-4 wounds remaining, subtract 1 from the Hit roll"
 * into damagedThreshold and damagedMechanics properties.
 *
 * Usage:
 *   node scripts/parse-damaged-profiles.js
 *   node scripts/parse-damaged-profiles.js --dry-run
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read from and write to the processed data directory
const DATA_PATH = path.join(__dirname, "..", "..", "src", "app", "data", "factions");

const DRY_RUN = process.argv.includes("--dry-run");

/**
 * Extract the upper threshold from damagedW string
 * e.g., "1-4" -> 4, "1-10" -> 10
 */
function parseThreshold(damagedW) {
    if (!damagedW || typeof damagedW !== "string") return null;

    // Handle both regular hyphen and en-dash
    const match = damagedW.match(/\d+[-‑](\d+)/);
    if (match) {
        return parseInt(match[1], 10);
    }
    return null;
}

/**
 * Parse damagedDescription into structured mechanics
 */
function parseDamagedMechanics(description) {
    if (!description || typeof description !== "string") return [];

    const mechanics = [];

    // Pattern: "subtract X from the Hit roll"
    const hitPenaltyMatch = description.match(/subtract\s+(\d+)\s+from\s+(?:the\s+)?[Hh]it\s+roll/i);
    if (hitPenaltyMatch) {
        mechanics.push({
            entity: "thisModel",
            effect: "rollPenalty",
            attribute: "h",
            value: parseInt(hitPenaltyMatch[1], 10),
        });
    }

    // Pattern: "subtract X from this model's Objective Control characteristic"
    // Note: Handle both regular apostrophe (U+0027) and right single quotation mark (U+2019)
    const ocPenaltyMatch = description.match(/subtract\s+(\d+)\s+from\s+(?:this\s+)?(?:model|its)[\u0027\u2019]?s?\s+Objective\s+Control\s+characteristic/i);
    if (ocPenaltyMatch) {
        mechanics.push({
            entity: "thisModel",
            effect: "statPenalty",
            attribute: "oc",
            value: parseInt(ocPenaltyMatch[1], 10),
        });
    }

    // Pattern: "add X to the Attacks characteristic of this model's melee weapons"
    // Note: Handle both regular apostrophe (U+0027) and right single quotation mark (U+2019)
    const meleeAttacksBonusMatch = description.match(/add\s+(\d+)\s+to\s+the\s+Attacks\s+characteristic\s+of\s+this\s+model[\u0027\u2019]?s?\s+melee\s+weapons/i);
    if (meleeAttacksBonusMatch) {
        mechanics.push({
            entity: "thisModel",
            effect: "statBonus",
            attribute: "a",
            value: parseInt(meleeAttacksBonusMatch[1], 10),
            conditions: [
                {
                    weapon: "type",
                    operator: "equals",
                    value: "Melee",
                },
            ],
        });
    }

    // Pattern: "add X to the Attacks characteristic" (general, no weapon restriction)
    const attacksBonusMatch = description.match(/add\s+(\d+)\s+to\s+(?:the\s+)?Attacks\s+characteristic(?!\s+of)/i);
    if (attacksBonusMatch) {
        mechanics.push({
            entity: "thisModel",
            effect: "statBonus",
            attribute: "a",
            value: parseInt(attacksBonusMatch[1], 10),
        });
    }

    // Pattern: "subtract X from the Attacks characteristic"
    const attacksPenaltyMatch = description.match(/subtract\s+(\d+)\s+from\s+(?:the\s+)?Attacks\s+characteristic/i);
    if (attacksPenaltyMatch) {
        mechanics.push({
            entity: "thisModel",
            effect: "statPenalty",
            attribute: "a",
            value: parseInt(attacksPenaltyMatch[1], 10),
        });
    }

    // Pattern: "the Attacks characteristics of all of its weapons are halved"
    const attacksHalvedMatch = description.match(/Attacks\s+characteristics?\s+(?:of\s+)?(?:all\s+of\s+)?(?:its|this\s+model[\u0027\u2019]?s?)\s+weapons\s+(?:are|is)\s+halved/i);
    if (attacksHalvedMatch) {
        mechanics.push({
            entity: "thisModel",
            effect: "statMultiplier",
            attribute: "a",
            value: 0.5,
        });
    }

    // Pattern: "add X to the Attacks characteristic of this model's [weapon name]"
    // Note: Handle both regular apostrophe (U+0027) and right single quotation mark (U+2019)
    const specificWeaponAttacksMatch = description.match(/add\s+(\d+)\s+to\s+the\s+Attacks\s+characteristic\s+of\s+this\s+model[\u0027\u2019]?s?\s+([^.]+)/i);
    if (specificWeaponAttacksMatch && !specificWeaponAttacksMatch[2].toLowerCase().includes("melee weapons")) {
        mechanics.push({
            entity: "thisModel",
            effect: "statBonus",
            attribute: "a",
            value: parseInt(specificWeaponAttacksMatch[1], 10),
            conditions: [
                {
                    weapon: "name",
                    operator: "includes",
                    value: specificWeaponAttacksMatch[2].trim(),
                },
            ],
        });
    }

    return mechanics;
}

/**
 * Find all JSON files recursively
 */
function findJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            findJsonFiles(filePath, fileList);
        } else if (file.endsWith(".json") && !file.includes("faction.json")) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

/**
 * Process a single datasheet file
 */
function processDatasheet(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const datasheet = JSON.parse(content);

    // Skip if no damagedW or damagedDescription
    if (!datasheet.damagedW || !datasheet.damagedDescription) {
        return { modified: false };
    }

    // Skip if already has damagedMechanics
    if (datasheet.damagedMechanics && Array.isArray(datasheet.damagedMechanics) && datasheet.damagedMechanics.length > 0) {
        return { modified: false, alreadyProcessed: true };
    }

    const threshold = parseThreshold(datasheet.damagedW);
    const mechanics = parseDamagedMechanics(datasheet.damagedDescription);

    if (threshold === null && mechanics.length === 0) {
        return { modified: false };
    }

    // Update datasheet
    if (threshold !== null) {
        datasheet.damagedThreshold = threshold;
    }
    if (mechanics.length > 0) {
        datasheet.damagedMechanics = mechanics;
    }

    if (!DRY_RUN) {
        fs.writeFileSync(filePath, JSON.stringify(datasheet, null, 2), "utf-8");
    }

    return {
        modified: true,
        threshold,
        mechanics,
        name: datasheet.name,
    };
}

/**
 * Main function
 */
function main() {
    console.log("═".repeat(60));
    console.log("🔧 Parse Damaged Profiles Script");
    console.log("═".repeat(60));
    console.log(`📁 Data path: ${DATA_PATH}`);
    console.log(`🧪 Dry run: ${DRY_RUN ? "YES" : "NO"}`);
    console.log("");

    if (!fs.existsSync(DATA_PATH)) {
        console.error(`❌ Depot data path not found: ${DATA_PATH}`);
        process.exit(1);
    }

    const jsonFiles = findJsonFiles(DATA_PATH);
    console.log(`📄 Found ${jsonFiles.length} datasheet files\n`);

    let stats = {
        processed: 0,
        modified: 0,
        alreadyProcessed: 0,
        unrecognizedPatterns: [],
    };

    for (const filePath of jsonFiles) {
        const result = processDatasheet(filePath);
        stats.processed++;

        if (result.alreadyProcessed) {
            stats.alreadyProcessed++;
        } else if (result.modified) {
            stats.modified++;
            console.log(`✅ ${result.name}`);
            console.log(`   Threshold: ${result.threshold}`);
            console.log(`   Mechanics: ${JSON.stringify(result.mechanics)}`);
        }
    }

    // Check for any descriptions that weren't parsed
    console.log("\n" + "═".repeat(60));
    console.log("🔍 Checking for unrecognized patterns...\n");

    for (const filePath of jsonFiles) {
        const content = fs.readFileSync(filePath, "utf-8");
        const datasheet = JSON.parse(content);

        if (datasheet.damagedDescription && datasheet.damagedDescription.trim()) {
            const mechanics = parseDamagedMechanics(datasheet.damagedDescription);
            if (mechanics.length === 0) {
                stats.unrecognizedPatterns.push({
                    name: datasheet.name,
                    description: datasheet.damagedDescription,
                });
            }
        }
    }

    if (stats.unrecognizedPatterns.length > 0) {
        console.log("⚠️  Unrecognized patterns:");
        for (const item of stats.unrecognizedPatterns) {
            console.log(`   - ${item.name}: "${item.description}"`);
        }
    } else {
        console.log("✅ All non-empty descriptions were successfully parsed!");
    }

    console.log("\n" + "═".repeat(60));
    console.log("📊 Summary:");
    console.log(`   📄 Files processed: ${stats.processed}`);
    console.log(`   📝 Files modified: ${stats.modified}`);
    console.log(`   ⏭️  Already processed: ${stats.alreadyProcessed}`);
    console.log(`   ⚠️  Unrecognized patterns: ${stats.unrecognizedPatterns.length}`);
    console.log("═".repeat(60));
}

main();

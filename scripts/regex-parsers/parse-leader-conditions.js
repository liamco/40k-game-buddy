/**
 * Parse Leader Conditions Script
 *
 * Extracts structured conditions from leaderFooter fields.
 * Converts text like "You can attach this model to one of the above units even if one Captain or Chapter Master model has already been attached to it"
 * into leaderConditions properties.
 *
 * Usage:
 *   node scripts/regex-parsers/parse-leader-conditions.js
 *   node scripts/regex-parsers/parse-leader-conditions.js --dry-run
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read from and write to the processed data directory
const DATA_PATH = path.join(__dirname, "..", "..", "src", "app", "data", "output", "factions");

const DRY_RUN = process.argv.includes("--dry-run");

/**
 * Strip HTML tags from text
 */
function stripHtml(text) {
    if (!text) return "";
    return text.replace(/<[^>]*>/g, "").trim();
}

/**
 * Normalize text for consistent matching
 * - Strip HTML
 * - Normalize whitespace
 * - Handle special characters
 */
function normalizeText(text) {
    if (!text) return "";
    return stripHtml(text)
        .replace(/\s+/g, " ")
        .replace(/[\u2018\u2019]/g, "'") // Normalize smart quotes
        .trim();
}

/**
 * Parse a list of leader keywords/names from text
 * e.g., "Captain, Chapter Master or Lieutenant" -> ["CAPTAIN", "CHAPTER MASTER", "LIEUTENANT"]
 * e.g., "Canoness, Palatine, Junith Eruita or AESTRED THURGA" -> ["CANONESS", "PALATINE", "JUNITH ERUITA", "AESTRED THURGA"]
 */
function parseLeaderList(text) {
    if (!text) return [];

    // Split on ", " and " or "
    const parts = text
        .split(/,\s*|\s+or\s+/i)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

    // Remove trailing "model", "unit", "units" from each part
    return parts.map((p) =>
        p
            .replace(/\s+(model|unit|units)s?$/i, "")
            .trim()
            .toUpperCase()
    );
}

/**
 * Parse equipment requirements from text
 * e.g., "cannot be attached to a BLADEGUARD VETERAN SQUAD unless this model is equipped with a relic shield"
 */
function parseEquipmentRequirements(text) {
    const requirements = [];
    const normalized = normalizeText(text);

    // Pattern: "cannot be attached to a [UNIT] unless this model is equipped with a [EQUIPMENT]"
    const requirementRegex = /cannot be attached to (?:a |an )?([A-Z][A-Z\s]+(?:SQUAD|UNIT)?)\s+unless\s+(?:this\s+)?model is equipped with (?:a |an )?([^,.]+)/gi;

    let match;
    while ((match = requirementRegex.exec(normalized)) !== null) {
        requirements.push({
            targetUnitKeywords: [match[1].trim().toUpperCase()],
            requiredEquipment: match[2].trim().toLowerCase(),
        });
    }

    return requirements;
}

/**
 * Parse leaderFooter into structured leaderConditions
 */
function parseLeaderConditions(leaderFooter) {
    if (!leaderFooter || typeof leaderFooter !== "string") return null;

    const normalized = normalizeText(leaderFooter);
    const conditions = {};

    // Pattern 1: "even if one [Leader1, Leader2 or Leader3] model has already been attached"
    // This indicates the unit can have multiple leaders
    const multiLeaderPatterns = [
        // "even if one Captain or Chapter Master model has already been attached"
        /even if (?:one |a )?([^.]+?)\s+(?:model |unit )?has already been attached/i,
        // "even if one other Character model has already been attached"
        /even if (?:one )?other\s+([^.]+?)\s+(?:model |unit )?has already been attached/i,
    ];

    for (const pattern of multiLeaderPatterns) {
        const match = normalized.match(pattern);
        if (match) {
            const leaderText = match[1].trim();

            // Check if it's "any" leader or specific types
            if (/character/i.test(leaderText) && !/specific/i.test(leaderText)) {
                // "other Character model" means any existing leader is allowed
                conditions.allowsAnyExistingLeader = true;
            } else if (/other\s+leader/i.test(leaderText)) {
                // "other Leader unit" means any existing leader is allowed
                conditions.allowsAnyExistingLeader = true;
            } else {
                // Specific leader types
                conditions.allowedExistingLeaderKeywords = parseLeaderList(leaderText);
            }
            break;
        }
    }

    // Pattern 2: "You must attach this model to a [UNIT]"
    // This indicates the leader must be attached (cannot be standalone)
    const mustAttachMatch = normalized.match(/(?:you )?must attach this (?:model|unit)/i);
    if (mustAttachMatch) {
        conditions.mustAttach = true;
    }

    // Pattern 3: Equipment requirements
    // "cannot be attached to a BLADEGUARD VETERAN SQUAD unless this model is equipped with a relic shield"
    const equipmentReqs = parseEquipmentRequirements(normalized);
    if (equipmentReqs.length > 0) {
        conditions.equipmentRequirements = equipmentReqs;
    }

    // Pattern 4: "a unit cannot have more than one [X]" or "a unit cannot have two [X]"
    const maxTypeMatch = normalized.match(/unit cannot have (?:more than |two )?(one|\d+)\s+([^.]+)/i);
    if (maxTypeMatch) {
        const count = maxTypeMatch[1].toLowerCase() === "one" ? 1 : parseInt(maxTypeMatch[1], 10);
        conditions.maxOfThisType = count;
    }

    // Only return if we found any conditions
    if (Object.keys(conditions).length === 0) {
        return null;
    }

    return conditions;
}

/**
 * Find all JSON files recursively in datasheets subdirectories
 */
function findDatasheetFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            findDatasheetFiles(filePath, fileList);
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

    // Skip if no leaderFooter
    if (!datasheet.leaderFooter || !datasheet.leaderFooter.trim()) {
        return { modified: false };
    }

    // Skip if already has leaderConditions
    if (datasheet.leaderConditions && Object.keys(datasheet.leaderConditions).length > 0) {
        return { modified: false, alreadyProcessed: true };
    }

    const conditions = parseLeaderConditions(datasheet.leaderFooter);

    if (!conditions) {
        return { modified: false, noConditionsParsed: true, leaderFooter: datasheet.leaderFooter };
    }

    // Update datasheet
    datasheet.leaderConditions = conditions;

    if (!DRY_RUN) {
        fs.writeFileSync(filePath, JSON.stringify(datasheet, null, 2), "utf-8");
    }

    return {
        modified: true,
        conditions,
        name: datasheet.name,
        leaderFooter: datasheet.leaderFooter,
    };
}

/**
 * Main function
 */
function main() {
    console.log("═".repeat(60));
    console.log("🔧 Parse Leader Conditions Script");
    console.log("═".repeat(60));
    console.log(`📁 Data path: ${DATA_PATH}`);
    console.log(`🧪 Dry run: ${DRY_RUN ? "YES" : "NO"}`);
    console.log("");

    if (!fs.existsSync(DATA_PATH)) {
        console.error(`❌ Data path not found: ${DATA_PATH}`);
        process.exit(1);
    }

    const jsonFiles = findDatasheetFiles(DATA_PATH);
    console.log(`📄 Found ${jsonFiles.length} datasheet files\n`);

    let stats = {
        processed: 0,
        modified: 0,
        alreadyProcessed: 0,
        withLeaderFooter: 0,
        unrecognizedPatterns: [],
    };

    for (const filePath of jsonFiles) {
        const result = processDatasheet(filePath);
        stats.processed++;

        if (result.alreadyProcessed) {
            stats.alreadyProcessed++;
            stats.withLeaderFooter++;
        } else if (result.modified) {
            stats.modified++;
            stats.withLeaderFooter++;
            console.log(`✅ ${result.name}`);
            console.log(`   Footer: "${normalizeText(result.leaderFooter).substring(0, 80)}..."`);
            console.log(`   Conditions: ${JSON.stringify(result.conditions)}`);
            console.log("");
        } else if (result.noConditionsParsed && result.leaderFooter) {
            stats.withLeaderFooter++;
            stats.unrecognizedPatterns.push({
                name: "",
                leaderFooter: result.leaderFooter,
            });
        }
    }

    // Report unrecognized patterns with unit names
    console.log("\n" + "═".repeat(60));
    console.log("🔍 Checking for unrecognized patterns...\n");

    const unrecognized = [];
    for (const filePath of jsonFiles) {
        const content = fs.readFileSync(filePath, "utf-8");
        const datasheet = JSON.parse(content);

        if (datasheet.leaderFooter && datasheet.leaderFooter.trim()) {
            // Skip if already has conditions
            if (datasheet.leaderConditions && Object.keys(datasheet.leaderConditions).length > 0) {
                continue;
            }
            const conditions = parseLeaderConditions(datasheet.leaderFooter);
            if (!conditions) {
                unrecognized.push({
                    name: datasheet.name,
                    leaderFooter: normalizeText(datasheet.leaderFooter),
                });
            }
        }
    }

    if (unrecognized.length > 0) {
        console.log("⚠️  Unrecognized patterns:");
        for (const item of unrecognized) {
            console.log(`   - ${item.name}:`);
            console.log(`     "${item.leaderFooter.substring(0, 100)}..."`);
            console.log("");
        }
    } else {
        console.log("✅ All leaderFooter texts were successfully parsed!");
    }

    console.log("\n" + "═".repeat(60));
    console.log("📊 Summary:");
    console.log(`   📄 Files processed: ${stats.processed}`);
    console.log(`   📝 Files with leaderFooter: ${stats.withLeaderFooter}`);
    console.log(`   ✅ Files modified: ${stats.modified}`);
    console.log(`   ⏭️  Already processed: ${stats.alreadyProcessed}`);
    console.log(`   ⚠️  Unrecognized patterns: ${unrecognized.length}`);
    console.log("═".repeat(60));
}

main();

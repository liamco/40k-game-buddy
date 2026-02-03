/**
 * Parse Datasheet Fields Script
 *
 * Combines two operations:
 * 1. Parse Damaged Profiles - Extracts damagedThreshold and damagedMechanics from damagedW/damagedDescription
 * 2. Parse Leader Conditions - Extracts leaderConditions from leaderFooter
 *
 * Both operations parse specific text fields into structured data for runtime use.
 *
 * Usage:
 *   node scripts/regex-parsers/parse-datasheet-fields.js
 *
 *   Options:
 *     DRY_RUN=true   Preview changes without writing files
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getFactionsOutputPath, findDatasheetFiles, readJsonFile, writeJsonFile, normalizeText, printHeader, printSummary } from "./parser-utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.env.DRY_RUN === "true";

// ============================================================================
// DAMAGED PROFILES PARSING
// ============================================================================

/**
 * Extract the upper threshold from damagedW string
 * e.g., "1-4" -> 4, "1-10" -> 10
 */
function parseDamagedThreshold(damagedW) {
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
 * Process damaged profile fields in a datasheet
 * Works with consolidated damaged object structure: { range, threshold, description, mechanics }
 * @returns {object} - { modified, threshold, mechanics }
 */
function processDamagedProfile(datasheet) {
    // Skip if no damaged object or missing range/description
    if (!datasheet.damaged || !datasheet.damaged.range || !datasheet.damaged.description) {
        return { modified: false };
    }

    // Skip if already has mechanics populated
    if (datasheet.damaged.mechanics && Array.isArray(datasheet.damaged.mechanics) && datasheet.damaged.mechanics.length > 0) {
        return { modified: false, alreadyProcessed: true };
    }

    const threshold = parseDamagedThreshold(datasheet.damaged.range);
    const mechanics = parseDamagedMechanics(datasheet.damaged.description);

    if (threshold === null && mechanics.length === 0) {
        return { modified: false };
    }

    // Update the consolidated damaged object
    if (threshold !== null) {
        datasheet.damaged.threshold = threshold;
    }
    if (mechanics.length > 0) {
        datasheet.damaged.mechanics = mechanics;
    }

    return { modified: true, threshold, mechanics };
}

// ============================================================================
// LEADER CONDITIONS PARSING
// ============================================================================

/**
 * Parse a list of leader keywords/names from text
 * e.g., "Captain, Chapter Master or Lieutenant" -> ["CAPTAIN", "CHAPTER MASTER", "LIEUTENANT"]
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
    const multiLeaderPatterns = [/even if (?:one |a )?([^.]+?)\s+(?:model |unit )?has already been attached/i, /even if (?:one )?other\s+([^.]+?)\s+(?:model |unit )?has already been attached/i];

    for (const pattern of multiLeaderPatterns) {
        const match = normalized.match(pattern);
        if (match) {
            const leaderText = match[1].trim();

            if (/character/i.test(leaderText) && !/specific/i.test(leaderText)) {
                conditions.allowsAnyExistingLeader = true;
            } else if (/other\s+leader/i.test(leaderText)) {
                conditions.allowsAnyExistingLeader = true;
            } else {
                conditions.allowedExistingLeaderKeywords = parseLeaderList(leaderText);
            }
            break;
        }
    }

    // Pattern 2: "You must attach this model to a [UNIT]"
    const mustAttachMatch = normalized.match(/(?:you )?must attach this (?:model|unit)/i);
    if (mustAttachMatch) {
        conditions.mustAttach = true;
    }

    // Pattern 3: Equipment requirements
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
 * Process leader conditions fields in a datasheet
 * Works with consolidated leader object structure: { description, footer, conditions, attachableUnits }
 * @returns {object} - { modified, conditions }
 */
function processLeaderConditions(datasheet) {
    // Skip if no leader object or no footer
    if (!datasheet.leader || !datasheet.leader.footer || !datasheet.leader.footer.trim()) {
        return { modified: false };
    }

    // Skip if already has conditions populated
    if (datasheet.leader.conditions && Object.keys(datasheet.leader.conditions).length > 0) {
        return { modified: false, alreadyProcessed: true };
    }

    const conditions = parseLeaderConditions(datasheet.leader.footer);

    if (!conditions) {
        return { modified: false, noConditionsParsed: true };
    }

    // Update the consolidated leader object
    datasheet.leader.conditions = conditions;

    return { modified: true, conditions };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    printHeader("Parse Datasheet Fields (Damaged Profiles + Leader Conditions)");

    const dataPath = getFactionsOutputPath(__dirname);

    if (!fs.existsSync(dataPath)) {
        console.error(`❌ Data path not found: ${dataPath}`);
        console.error(`   Run 'npm run parse-depot-data' first.`);
        process.exit(1);
    }

    console.log(`📁 Data path: ${dataPath}`);
    console.log(`🧪 Dry run: ${DRY_RUN ? "YES" : "NO"}`);
    console.log("");

    // Find all datasheet files
    const datasheetFiles = findDatasheetFiles(dataPath);
    console.log(`📄 Found ${datasheetFiles.length} datasheet files\n`);

    const stats = {
        filesProcessed: 0,
        damagedProfilesAdded: 0,
        damagedAlreadyProcessed: 0,
        damagedUnrecognized: [],
        leaderConditionsAdded: 0,
        leaderAlreadyProcessed: 0,
        leaderUnrecognized: [],
    };

    for (const filePath of datasheetFiles) {
        const datasheet = readJsonFile(filePath);
        if (!datasheet) continue;

        stats.filesProcessed++;
        let modified = false;

        // Process damaged profile
        const damagedResult = processDamagedProfile(datasheet);
        if (damagedResult.modified) {
            stats.damagedProfilesAdded++;
            modified = true;
            console.log(`✅ Damaged: ${datasheet.name} (threshold: ${damagedResult.threshold})`);
        } else if (damagedResult.alreadyProcessed) {
            stats.damagedAlreadyProcessed++;
        }

        // Process leader conditions
        const leaderResult = processLeaderConditions(datasheet);
        if (leaderResult.modified) {
            stats.leaderConditionsAdded++;
            modified = true;
            console.log(`✅ Leader: ${datasheet.name} (${JSON.stringify(leaderResult.conditions)})`);
        } else if (leaderResult.alreadyProcessed) {
            stats.leaderAlreadyProcessed++;
        }

        // Write updated file
        if (modified && !DRY_RUN) {
            writeJsonFile(filePath, datasheet);
        }
    }

    // Check for unrecognized patterns
    console.log("\n🔍 Checking for unrecognized patterns...\n");

    for (const filePath of datasheetFiles) {
        const datasheet = readJsonFile(filePath);
        if (!datasheet) continue;

        // Check damaged description (using consolidated structure)
        if (datasheet.damaged && datasheet.damaged.description && datasheet.damaged.description.trim()) {
            if (!datasheet.damaged.mechanics || !Array.isArray(datasheet.damaged.mechanics) || datasheet.damaged.mechanics.length === 0) {
                const mechanics = parseDamagedMechanics(datasheet.damaged.description);
                if (mechanics.length === 0) {
                    stats.damagedUnrecognized.push({
                        name: datasheet.name,
                        description: datasheet.damaged.description,
                    });
                }
            }
        }

        // Check leader footer (using consolidated structure)
        if (datasheet.leader && datasheet.leader.footer && datasheet.leader.footer.trim()) {
            if (!datasheet.leader.conditions || Object.keys(datasheet.leader.conditions).length === 0) {
                const conditions = parseLeaderConditions(datasheet.leader.footer);
                if (!conditions) {
                    stats.leaderUnrecognized.push({
                        name: datasheet.name,
                        leaderFooter: normalizeText(datasheet.leader.footer),
                    });
                }
            }
        }
    }

    if (stats.damagedUnrecognized.length > 0) {
        console.log("⚠️  Unrecognized damaged patterns:");
        for (const item of stats.damagedUnrecognized) {
            console.log(`   - ${item.name}: "${item.description}"`);
        }
        console.log("");
    }

    if (stats.leaderUnrecognized.length > 0) {
        console.log("⚠️  Unrecognized leader patterns:");
        for (const item of stats.leaderUnrecognized) {
            console.log(`   - ${item.name}:`);
            console.log(`     "${item.leaderFooter.substring(0, 100)}..."`);
        }
        console.log("");
    }

    if (stats.damagedUnrecognized.length === 0 && stats.leaderUnrecognized.length === 0) {
        console.log("✅ All patterns were successfully recognized!\n");
    }

    printSummary({
        "Files processed": stats.filesProcessed,
        "Damaged profiles added": stats.damagedProfilesAdded,
        "Damaged already processed": stats.damagedAlreadyProcessed,
        "Damaged unrecognized": stats.damagedUnrecognized.length,
        "Leader conditions added": stats.leaderConditionsAdded,
        "Leader already processed": stats.leaderAlreadyProcessed,
        "Leader unrecognized": stats.leaderUnrecognized.length,
    });

    if (DRY_RUN) {
        console.log("\n💡 Run without DRY_RUN=true to apply changes");
    }
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});

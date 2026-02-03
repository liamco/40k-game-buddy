/**
 * Generate Precomputed Loadouts Script
 *
 * Detects datasheets with complex wargear options and generates all valid
 * loadout combinations for them. Complex datasheets are those with:
 * - Package deals (multiple weapons replaced/added together)
 * - Overlapping replacements (same weapon can be replaced by different options)
 *
 * This script now consumes the pre-parsed wargear options from parse-wargear-options.js
 * instead of doing its own parsing.
 *
 * Usage:
 *   npm run generate-loadouts
 *
 * Prerequisites:
 *   npm run parse-wargear-options  (must run first to generate parsedWargearOptions)
 *
 * This script reads from src/app/data/output and writes back to the same location.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getFactionsOutputPath, findDatasheetFiles, readJsonFile, writeJsonFile, normalizeForComparison, printHeader, printSummary } from "./parser-utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manual overrides for complexity detection
// Some datasheets might need to be forced as complex or simple
const COMPLEXITY_OVERRIDES = {
    // Force these datasheets to be treated as complex
    complex: [
        "000001346", // Lieutenant (Space Marines) - known complex case
    ],
    // Force these datasheets to be treated as simple (skip loadout generation)
    // These use standard swap UI - overlapping options are independent model swaps
    simple: [
        "000000460", // Hive Tyrant (Tyranids) - uses standard swap UI with constraints
        // Overlapping replacements - multiple models can independently swap the same weapon type
        "000000903", // Battle Sisters Squad (Adepta Sororitas)
        "000000848", // Skitarii Rangers (Adeptus Mechanicus)
        "000000849", // Skitarii Vanguard (Adeptus Mechanicus)
        "000003916", // Ynnari Kabalite Warriors (Aeldari)
        "000003834", // Tempestus Aquilons (Astra Militarum)
        "000004053", // Fellgor Beastmen (Chaos Daemons)
        "000003852", // Fellgor Beastmen (Chaos Knights)
        "000001604", // Fellgor Beastmen (Chaos Space Marines)
        "000000644", // Kabalite Warriors (Drukhari)
        "000003818", // Sisters of Battle Squad (Imperial Agents)
        "000003842", // Skitarii Rangers (Imperial Knights)
        "000003843", // Skitarii Vanguard (Imperial Knights)
        "000004076", // Goremongers (World Eaters)
        "000002692", // Tyranid Warriors With Ranged Bio-weapons (Tyranids)
        "000000468", // Termagants (Tyranids)
    ],
};

/**
 * Latin ordinal names for loadout labeling
 */
const LATIN_ORDINALS = [
    "Primus",
    "Secundus",
    "Tertius",
    "Quartus",
    "Quintus",
    "Sextus",
    "Septimus",
    "Octavus",
    "Nonus",
    "Decimus",
    "Undecimus",
    "Duodecimus",
    "Tertius Decimus",
    "Quartus Decimus",
    "Quintus Decimus",
    "Sextus Decimus",
    "Septimus Decimus",
    "Duodevicesimus",
    "Undevicesimus",
    "Vicesimus",
    "Vicesimus Primus",
    "Vicesimus Secundus",
    "Vicesimus Tertius",
    "Vicesimus Quartus",
    "Vicesimus Quintus",
];

/**
 * Get loadout label by index
 */
function getLoadoutLabel(index) {
    if (index < LATIN_ORDINALS.length) {
        return `Loadout ${LATIN_ORDINALS[index]}`;
    }
    return `Loadout ${index + 1}`;
}

// ============================================================================
// USING PARSED WARGEAR OPTIONS
// ============================================================================

/**
 * Convert a parsed wargear option to the format needed for loadout generation
 * @param {object} parsedOption - A WargearOptionDef from parsedWargearOptions
 * @returns {object|null} - Converted option or null if not valid for loadout generation
 */
function convertParsedOption(parsedOption) {
    // Skip unparsed options
    if (!parsedOption.wargearParsed) {
        return null;
    }

    // Skip footnotes and "none" entries
    if (parsedOption.targeting.type === "unknown" || parsedOption.action.type === "unknown") {
        return null;
    }

    const action = parsedOption.action;
    const isReplace = action.type === "replace";

    // Extract weapon names from removes
    const replacesWeaponNames = isReplace ? action.removes.map((ref) => ref.name) : [];

    // Extract weapon names and packages from adds
    const addsWeaponNames = [];
    const addsWeaponPackages = [];

    for (const choice of action.adds || []) {
        if (choice.isPackage && choice.weapons.length > 1) {
            // This is a package deal
            addsWeaponPackages.push(choice.weapons.map((w) => w.name));
        } else {
            // Single weapon(s)
            for (const weapon of choice.weapons) {
                addsWeaponNames.push(weapon.name);
            }
        }
    }

    // Determine if this is a package deal
    const isPackageDeal = replacesWeaponNames.length > 1 || addsWeaponPackages.length > 0;

    return {
        line: parsedOption.line,
        description: parsedOption.rawText,
        action: isReplace ? "replace" : "add",
        replacesWeaponNames,
        addsWeaponNames,
        addsWeaponPackages,
        isPackageDeal,
    };
}

/**
 * Detect if a datasheet has complex wargear options using parsedWargearOptions
 */
function detectComplexity(datasheet) {
    // Check manual overrides first
    if (COMPLEXITY_OVERRIDES.complex.includes(datasheet.id)) {
        return { isComplex: true, reason: "manual override" };
    }
    if (COMPLEXITY_OVERRIDES.simple.includes(datasheet.id)) {
        return { isComplex: false, reason: "manual override (simple)" };
    }

    // Use parsedWargearOptions if available
    const parsedOptions = datasheet.parsedWargearOptions || [];
    if (parsedOptions.length === 0) {
        return { isComplex: false, reason: "no options" };
    }

    // Convert parsed options to the format we need
    const convertedOptions = parsedOptions.map(convertParsedOption).filter((o) => o !== null);

    if (convertedOptions.length <= 1) {
        return { isComplex: false, reason: "single option only" };
    }

    // Check for package deals (multiple weapons replaced together)
    const hasPackageDeal = convertedOptions.some((opt) => opt.isPackageDeal);

    // Check for overlapping replacements (same BASE weapon replaced by different options)
    const allReplacedWeapons = convertedOptions.flatMap((opt) => opt.replacesWeaponNames.map(normalizeForComparison));
    const uniqueReplaced = new Set(allReplacedWeapons);
    const hasOverlappingReplacements = uniqueReplaced.size < allReplacedWeapons.length;

    const isComplex = hasPackageDeal || hasOverlappingReplacements;

    const reasons = [];
    if (hasPackageDeal) reasons.push("package deal");
    if (hasOverlappingReplacements) reasons.push("overlapping replacements");

    return {
        isComplex,
        reason: isComplex ? reasons.join(", ") : "simple options",
        hasPackageDeal,
        hasOverlappingReplacements,
    };
}

// ============================================================================
// WEAPON RESOLUTION
// ============================================================================

/**
 * Find weapon by name in available wargear
 */
function findWeaponByName(availableWargear, name) {
    const nameLower = normalizeForComparison(name);

    // First try exact match
    const exactMatch = availableWargear.find((w) => normalizeForComparison(w.name) === nameLower);
    if (exactMatch) return exactMatch;

    // Then try partial match
    const partialMatches = availableWargear.filter((w) => {
        const weaponLower = normalizeForComparison(w.name);
        return weaponLower.includes(nameLower) || nameLower.includes(weaponLower);
    });

    if (partialMatches.length === 0) return null;
    if (partialMatches.length === 1) return partialMatches[0];

    // Multiple matches - prefer closest length
    return partialMatches.sort((a, b) => {
        const aDiff = Math.abs(a.name.length - name.length);
        const bDiff = Math.abs(b.name.length - name.length);
        return aDiff - bDiff;
    })[0];
}

/**
 * Find a wargear ability by name in datasheet abilities
 */
function findWargearAbility(abilities, name) {
    if (!abilities || !Array.isArray(abilities)) return null;

    const nameLower = normalizeForComparison(name);

    return abilities.find((a) => {
        if (a.type !== "Wargear") return false;
        return normalizeForComparison(a.name) === nameLower;
    });
}

/**
 * Resolve an item name to either a weapon or a wargear ability
 */
function resolveWargearItem(name, availableWargear, abilities) {
    // First try to find as weapon
    const weapon = findWeaponByName(availableWargear, name);
    if (weapon) {
        return { type: "weapon", item: weapon };
    }

    // Then try to find as wargear ability
    const ability = findWargearAbility(abilities, name);
    if (ability) {
        return { type: "ability", item: ability };
    }

    return null;
}

/**
 * Get default loadout from datasheet
 */
function getDefaultLoadout(datasheet) {
    const loadoutText = datasheet.loadout || "";
    const availableWargear = datasheet.availableWargear || [];

    // Parse weapon names from loadout text
    // Format: "<b>This model is equipped with:</b> weapon1; weapon2; weapon3."
    const match = loadoutText.match(/equipped with:<\/b>\s*(.+?)\.?\s*$/i);
    if (!match) {
        // Fallback: return first weapon of each type
        const ranged = availableWargear.filter((w) => w.type === "Ranged");
        const melee = availableWargear.filter((w) => w.type === "Melee");
        return [...ranged.slice(0, 1), ...melee.slice(0, 1)].map((w) => w.id);
    }

    const weaponList = match[1];
    const weaponNames = weaponList.split(/;\s*/).map((s) => s.trim());

    const loadout = [];
    for (const name of weaponNames) {
        const weapon = findWeaponByName(availableWargear, name);
        if (weapon) {
            loadout.push(weapon.id);
        }
    }

    return loadout;
}

// ============================================================================
// LOADOUT GENERATION
// ============================================================================

/**
 * Generate all valid loadout combinations for a complex datasheet
 *
 * Uses parsedWargearOptions to enumerate all possible option choices
 * and compute the resulting loadout for each combination.
 */
function generateLoadouts(datasheet) {
    const availableWargear = datasheet.availableWargear || [];
    const abilities = datasheet.abilities || [];
    const defaultLoadoutIds = getDefaultLoadout(datasheet);
    const parsedOptions = datasheet.parsedWargearOptions || [];

    // Convert parsed options
    const convertedOptions = parsedOptions.map(convertParsedOption).filter((o) => o !== null);

    // Get default weapons
    const defaultWeapons = defaultLoadoutIds.map((id) => availableWargear.find((w) => w.id === id)).filter(Boolean);

    // Build choice sets for each option
    // Each option can be: "skip" (don't use), or one of its choices
    const optionChoices = convertedOptions.map((opt) => {
        const choices = [{ type: "skip" }]; // Always can skip an option

        // Single weapon choices
        for (const addName of opt.addsWeaponNames) {
            const resolved = resolveWargearItem(addName, availableWargear, abilities);
            if (resolved) {
                choices.push({
                    type: "single",
                    replaces: opt.replacesWeaponNames,
                    adds: [{ name: addName, resolved }],
                    isPackageDeal: false,
                });
            }
        }

        // Package deals
        for (const pkg of opt.addsWeaponPackages) {
            const resolvedItems = pkg
                .map((name) => ({
                    name,
                    resolved: resolveWargearItem(name, availableWargear, abilities),
                }))
                .filter((item) => item.resolved !== null);

            if (resolvedItems.length > 0) {
                choices.push({
                    type: "package",
                    replaces: opt.replacesWeaponNames,
                    adds: resolvedItems,
                    isPackageDeal: true,
                });
            }
        }

        // Multi-weapon replacement package (when replacesWeaponNames > 1 and addsWeaponNames matches)
        if (opt.replacesWeaponNames.length > 1 && opt.addsWeaponNames.length > 1 && opt.addsWeaponPackages.length === 0) {
            const resolvedItems = opt.addsWeaponNames
                .map((name) => ({
                    name,
                    resolved: resolveWargearItem(name, availableWargear, abilities),
                }))
                .filter((item) => item.resolved !== null);

            if (resolvedItems.length > 0) {
                // Remove individual choices we added above, replace with package
                const singleChoiceCount = opt.addsWeaponNames.length;
                choices.splice(1, singleChoiceCount);

                choices.push({
                    type: "package",
                    replaces: opt.replacesWeaponNames,
                    adds: resolvedItems,
                    isPackageDeal: true,
                });
            }
        }

        return { option: opt, choices };
    });

    // Generate all combinations of option choices
    const allCombinations = [];

    function generateCombinations(optIndex, currentChoices) {
        if (optIndex >= optionChoices.length) {
            allCombinations.push([...currentChoices]);
            return;
        }

        const { choices } = optionChoices[optIndex];
        for (const choice of choices) {
            generateCombinations(optIndex + 1, [...currentChoices, choice]);
        }
    }

    generateCombinations(0, []);

    // Compute resulting loadout for each combination
    const validLoadouts = [];

    for (const combo of allCombinations) {
        // Start with default loadout
        const weapons = defaultWeapons.map((w) => ({
            id: w.id,
            name: w.name,
            type: w.type,
        }));
        const wargearAbilities = [];
        let isPackageDeal = false;

        // Track which default weapons have been replaced
        const replacedWeaponNames = new Set();

        // Apply each chosen option
        let isValid = true;
        for (const choice of combo) {
            if (choice.type === "skip") continue;

            // Check if this choice conflicts with already-replaced weapons
            for (const replaceName of choice.replaces) {
                const normalizedReplace = normalizeForComparison(replaceName);

                // Check if weapon to be replaced still exists in loadout
                const weaponIndex = weapons.findIndex((w) => normalizeForComparison(w.name) === normalizedReplace);

                if (weaponIndex === -1) {
                    // Weapon already replaced by another option - conflict!
                    isValid = false;
                    break;
                }
            }

            if (!isValid) break;

            // Remove replaced weapons
            for (const replaceName of choice.replaces) {
                const normalizedReplace = normalizeForComparison(replaceName);
                const weaponIndex = weapons.findIndex((w) => normalizeForComparison(w.name) === normalizedReplace);
                if (weaponIndex !== -1) {
                    weapons.splice(weaponIndex, 1);
                    replacedWeaponNames.add(normalizedReplace);
                }
            }

            // Add new items
            for (const addItem of choice.adds) {
                if (addItem.resolved.type === "weapon") {
                    weapons.push({
                        id: addItem.resolved.item.id,
                        name: addItem.resolved.item.name,
                        type: addItem.resolved.item.type,
                    });
                } else if (addItem.resolved.type === "ability") {
                    wargearAbilities.push({
                        name: addItem.name,
                        abilityName: addItem.resolved.item.name,
                    });
                }
            }

            if (choice.isPackageDeal) {
                isPackageDeal = true;
            }
        }

        if (!isValid) continue;

        // No duplicate weapons
        const weaponNames = weapons.map((w) => normalizeForComparison(w.name));
        const uniqueNames = new Set(weaponNames);
        if (uniqueNames.size < weaponNames.length) {
            continue; // Has duplicates
        }

        const loadout = {
            weapons,
            isPackageDeal,
        };

        if (wargearAbilities.length > 0) {
            loadout.wargearAbilities = wargearAbilities;
        }

        validLoadouts.push(loadout);
    }

    // Remove exact duplicates
    const uniqueLoadouts = [];
    const seen = new Set();

    for (const loadout of validLoadouts) {
        const weaponKey = loadout.weapons
            .map((w) => w.id)
            .sort()
            .join("|");
        const abilityKey = (loadout.wargearAbilities || [])
            .map((a) => a.abilityName)
            .sort()
            .join("|");
        const key = `${weaponKey}::${abilityKey}`;

        if (!seen.has(key)) {
            seen.add(key);
            uniqueLoadouts.push(loadout);
        }
    }

    // Add labels
    return uniqueLoadouts.map((loadout, index) => ({
        label: getLoadoutLabel(index),
        ...loadout,
    }));
}

// ============================================================================
// FILE PROCESSING
// ============================================================================

/**
 * Process a single datasheet file
 */
function processDatasheet(filePath) {
    const datasheet = readJsonFile(filePath);
    if (!datasheet) {
        return { processed: false, reason: "read error" };
    }

    // Skip if no options or no parsedWargearOptions
    if (!datasheet.options || datasheet.options.length === 0) {
        return { processed: false, reason: "no options" };
    }

    if (!datasheet.parsedWargearOptions || datasheet.parsedWargearOptions.length === 0) {
        return { processed: false, reason: "no parsed options (run parse-wargear-options first)" };
    }

    // Detect complexity
    const complexity = detectComplexity(datasheet);

    if (!complexity.isComplex) {
        // Remove precomputedLoadouts and wargearComplexity if they exist
        if (datasheet.precomputedLoadouts || datasheet.wargearComplexity) {
            delete datasheet.precomputedLoadouts;
            delete datasheet.wargearComplexity;
            writeJsonFile(filePath, datasheet);
            return { processed: true, reason: "removed (now simple)", loadoutCount: 0 };
        }
        return { processed: false, reason: complexity.reason };
    }

    // Generate loadouts
    const loadouts = generateLoadouts(datasheet);

    if (loadouts.length === 0) {
        return { processed: false, reason: "no valid loadouts generated" };
    }

    // Add precomputedLoadouts to datasheet
    datasheet.precomputedLoadouts = loadouts;
    datasheet.wargearComplexity = {
        isComplex: true,
        reason: complexity.reason,
        generatedAt: new Date().toISOString(),
    };

    // Write back to file
    writeJsonFile(filePath, datasheet);

    return {
        processed: true,
        reason: complexity.reason,
        loadoutCount: loadouts.length,
    };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    printHeader("Generate Precomputed Loadouts for Complex Datasheets");

    const outputPath = getFactionsOutputPath(__dirname);

    if (!fs.existsSync(outputPath)) {
        console.error(`❌ Output path not found: ${outputPath}`);
        console.error("   Run 'npm run parse-depot-data' first to generate output files.");
        process.exit(1);
    }

    console.log(`📂 Source: ${outputPath}`);
    console.log("");

    // Find all datasheet files
    const datasheetFiles = findDatasheetFiles(outputPath);
    console.log(`📄 Found ${datasheetFiles.length} datasheet files\n`);

    let totalProcessed = 0;
    let totalComplex = 0;
    let totalLoadouts = 0;
    const complexDatasheets = [];

    for (const filePath of datasheetFiles) {
        const result = processDatasheet(filePath);

        totalProcessed++;

        if (result.processed && result.loadoutCount > 0) {
            totalComplex++;
            totalLoadouts += result.loadoutCount;

            // Read the datasheet name for logging
            const datasheet = readJsonFile(filePath);
            if (datasheet) {
                const factionMatch = filePath.match(/factions\/([^/]+)\//);
                const faction = factionMatch ? factionMatch[1] : "unknown";

                complexDatasheets.push({
                    id: datasheet.id,
                    name: datasheet.name,
                    faction,
                    loadoutCount: result.loadoutCount,
                    reason: result.reason,
                });

                console.log(`✅ ${datasheet.name} (${faction}): ${result.loadoutCount} loadouts - ${result.reason}`);
            }
        }
    }

    printSummary({
        "Total datasheets processed": totalProcessed,
        "Complex datasheets": totalComplex,
        "Total loadouts generated": totalLoadouts,
    });

    if (complexDatasheets.length > 0) {
        console.log("\n📋 Complex Datasheets:");
        for (const ds of complexDatasheets) {
            console.log(`   - ${ds.name} (${ds.faction}): ${ds.loadoutCount} loadouts`);
        }
    }
}

// Run the script
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});

/**
 * Generate Precomputed Loadouts Script
 *
 * Detects datasheets with complex wargear options and generates all valid
 * loadout combinations for them. Complex datasheets are those with:
 * - Package deals (multiple weapons replaced/added together)
 * - Same weapon appearing in multiple options
 * - Overlapping replacements (same weapon can be replaced by different options)
 *
 * Usage:
 *   npm run generate-loadouts
 *
 * This script reads from src/app/data/output and writes back to the same location.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

/**
 * Normalize text for comparison
 * Normalizes hyphens to spaces to handle variations like "neo-volkite" vs "neo volkite"
 */
function normalizeText(text) {
    if (typeof text !== "string") return "";
    return text
        .toLowerCase()
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014-]/g, " ") // Normalize all hyphens to spaces
        .replace(/\s+/g, " ") // Collapse multiple spaces
        .trim();
}

/**
 * Parse weapons from option description (simplified version of wargearHelpers logic)
 */
function parseWeaponsFromDescription(description) {
    const weapons = [];
    const packages = [];

    const normalized = description.replace(/<[^>]*>/g, " ").trim();

    // Check for <li> list items
    if (description.includes("<li>")) {
        const liMatches = description.matchAll(/<li>(.+?)<\/li>/gi);
        for (const match of liMatches) {
            const itemText = match[1].replace(/<[^>]*>/g, " ").trim();

            // Check if this is a package deal (contains " and " with a number)
            if (/ and \d+\s+/i.test(itemText)) {
                const parts = itemText.split(/ and /i);
                const packageWeapons = parts.map((part) => {
                    const weaponMatch = part.match(/^(\d+\s+)?(.+?)(?:\s*\*|\.|$)/i);
                    return weaponMatch ? weaponMatch[2].trim() : part.trim();
                });
                packages.push(packageWeapons);
            } else {
                const weaponMatch = itemText.match(/^(\d+\s+)?(.+?)(?:\s*\*|\.|$)/i);
                if (weaponMatch && weaponMatch[2]) {
                    weapons.push(weaponMatch[2].trim());
                }
            }
        }
    }

    if (weapons.length > 0 || packages.length > 0) {
        return { weapons, packages };
    }

    // Fallback: look for "with X" pattern (handles non-list format)
    const withMatch = normalized.match(/(?:replaced with|equipped with)\s+(.+?)\.?\s*$/i);
    if (withMatch && withMatch[1]) {
        const addedPart = withMatch[1].trim();

        // Check if it's a package deal with multiple items: "1 X, 1 Y and 1 Z"
        // Pattern: contains ", " and " and " suggesting multiple items
        if (/,.*\s+and\s+/i.test(addedPart) || /\s+and\s+\d+\s+/i.test(addedPart)) {
            // Split on ", " and " and " to get all items
            const parts = addedPart.split(/,\s*|\s+and\s+/i);
            const packageWeapons = parts
                .map((part) => {
                    const weaponMatch = part.trim().match(/^(\d+\s+)?(.+?)$/i);
                    return weaponMatch ? weaponMatch[2].trim() : part.trim();
                })
                .filter((name) => name.length > 0);

            if (packageWeapons.length > 1) {
                packages.push(packageWeapons);
            } else if (packageWeapons.length === 1) {
                weapons.push(packageWeapons[0]);
            }
        } else {
            // Single item
            const weaponMatch = addedPart.match(/^(\d+\s+)?(.+?)$/i);
            if (weaponMatch && weaponMatch[2]) {
                weapons.push(weaponMatch[2].trim());
            }
        }
    }

    return { weapons, packages };
}

/**
 * Parse replaced weapons from option description
 */
function parseReplacedWeapons(description) {
    const normalized = normalizeText(description);
    const replacedWeapons = [];

    const replaceMatch = normalized.match(/(.+?)\s+can be replaced/i);
    if (replaceMatch) {
        let replacedPart = replaceMatch[1];

        // Remove "For every X models in this unit," prefix - this is a constraint, not a weapon
        replacedPart = replacedPart.replace(/^for every \d+ models in this unit\s*,?\s*/i, "");
        // Remove "Any number of models can each have their" prefix
        replacedPart = replacedPart.replace(/^any number of models can each have their\s*/i, "");
        // Remove "X model's" or "X models'" prefix (e.g., "1 model's devourer")
        replacedPart = replacedPart.replace(/^\d+\s+models?'s?\s*/i, "");

        // Handle "X, Y and Z can be replaced" pattern
        // But first check if there's actually multiple weapons (not just constraint text)
        const hasMultipleWeapons = replacedPart.includes(" and ") || replacedPart.includes(",");

        if (hasMultipleWeapons) {
            // Split on commas and "and"
            const parts = replacedPart.split(/,\s*|\s+and\s+/i);
            for (const part of parts) {
                // Extract weapon name, removing "this model's" prefix
                const cleanPart = part
                    .replace(/^(this\s+)?model\W?s?\s+/i, "")
                    .replace(/^the\s+[a-z\s]+?'s\s+/i, "")
                    .trim();
                if (cleanPart) {
                    // Extract just the weapon name (must start with a letter, not "for" or numbers)
                    const weaponMatch = cleanPart.match(/^(\d+\s+)?([a-z][a-z\s-]+)/i);
                    if (weaponMatch && weaponMatch[2]) {
                        const weaponName = weaponMatch[2].trim();
                        // Filter out non-weapon phrases
                        if (!weaponName.match(/^(for every|models?|this unit)/i)) {
                            replacedWeapons.push(weaponName);
                        }
                    }
                }
            }
        } else {
            // Single weapon replacement
            replacedPart = replacedPart.replace(/^(this\s+)?model\W?s?\s+/i, "");
            replacedPart = replacedPart.replace(/^the\s+[a-z\s]+?'s\s+/i, "");
            const weaponMatch = replacedPart.match(/(\d+\s+)?([a-z][a-z\s-]+)/i);
            if (weaponMatch && weaponMatch[2]) {
                const weaponName = weaponMatch[2].trim();
                // Filter out non-weapon phrases
                if (!weaponName.match(/^(for every|models?|this unit)/i)) {
                    replacedWeapons.push(weaponName);
                }
            }
        }
    }

    return replacedWeapons;
}

/**
 * Parse a single option into structured data
 */
function parseOption(option) {
    const desc = option.description || "";
    const normalized = normalizeText(desc);
    const isNote = option.button === "*";

    if (isNote) {
        return null;
    }

    const isReplace = /can be replaced|replaced with/i.test(normalized);
    const action = isReplace ? "replace" : "add";

    const replacesWeaponNames = isReplace ? parseReplacedWeapons(desc) : [];
    const parsed = parseWeaponsFromDescription(desc);

    return {
        line: option.line,
        description: desc,
        action,
        replacesWeaponNames,
        addsWeaponNames: parsed.weapons,
        addsWeaponPackages: parsed.packages,
        isPackageDeal: replacesWeaponNames.length > 1 || parsed.packages.length > 0,
    };
}

/**
 * Detect if a datasheet has complex wargear options
 */
function detectComplexity(datasheet) {
    // Check manual overrides first
    if (COMPLEXITY_OVERRIDES.complex.includes(datasheet.id)) {
        return { isComplex: true, reason: "manual override" };
    }
    if (COMPLEXITY_OVERRIDES.simple.includes(datasheet.id)) {
        return { isComplex: false, reason: "manual override (simple)" };
    }

    const options = datasheet.options || [];
    if (options.length === 0) {
        return { isComplex: false, reason: "no options" };
    }

    const parsedOptions = options.map(parseOption).filter((o) => o !== null);

    if (parsedOptions.length <= 1) {
        return { isComplex: false, reason: "single option only" };
    }

    // Check for package deals (multiple weapons replaced together)
    const hasPackageDeal = parsedOptions.some((opt) => opt.isPackageDeal);

    // Check for overlapping replacements (same BASE weapon replaced by different options)
    // This creates mutual exclusivity - you can only pick one option for that weapon slot
    const allReplacedWeapons = parsedOptions.flatMap((opt) => opt.replacesWeaponNames.map(normalizeText));
    const uniqueReplaced = new Set(allReplacedWeapons);
    const hasOverlappingReplacements = uniqueReplaced.size < allReplacedWeapons.length;

    // Note: "same weapon appears in multiple options" is NOT a complexity indicator by itself.
    // If those options replace DIFFERENT base weapons, they're independent swap groups.
    // Only overlapping replacements (same base weapon) creates the mutual exclusivity problem.

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

/**
 * Find weapon by name in available wargear
 */
function findWeaponByName(availableWargear, name) {
    const nameLower = normalizeText(name);

    // First try exact match
    const exactMatch = availableWargear.find((w) => normalizeText(w.name) === nameLower);
    if (exactMatch) return exactMatch;

    // Then try partial match
    const partialMatches = availableWargear.filter((w) => {
        const weaponLower = normalizeText(w.name);
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

    const nameLower = normalizeText(name);

    return abilities.find((a) => {
        if (a.type !== "Wargear") return false;
        return normalizeText(a.name) === nameLower;
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

/**
 * Generate all valid loadout combinations for a complex datasheet
 *
 * This uses a different approach: instead of slot-based generation,
 * we enumerate all possible option choices and compute the resulting loadout.
 */
function generateLoadouts(datasheet) {
    const options = datasheet.options || [];
    const availableWargear = datasheet.availableWargear || [];
    const abilities = datasheet.abilities || [];
    const defaultLoadoutIds = getDefaultLoadout(datasheet);

    const parsedOptions = options.map(parseOption).filter((o) => o !== null);

    // Get default weapons
    const defaultWeapons = defaultLoadoutIds.map((id) => availableWargear.find((w) => w.id === id)).filter(Boolean);

    // Helper to find weapon by name
    const findWeapon = (name) => findWeaponByName(availableWargear, name);

    // Build choice sets for each option
    // Each option can be: "skip" (don't use), or one of its choices
    const optionChoices = parsedOptions.map((opt) => {
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
        // This handles "X, Y and Z can be replaced with A, B and C"
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
                const normalizedReplace = normalizeText(replaceName);

                // Check if weapon to be replaced still exists in loadout
                const weaponIndex = weapons.findIndex((w) => normalizeText(w.name) === normalizedReplace);

                if (weaponIndex === -1) {
                    // Weapon already replaced by another option - conflict!
                    isValid = false;
                    break;
                }
            }

            if (!isValid) break;

            // Remove replaced weapons
            for (const replaceName of choice.replaces) {
                const normalizedReplace = normalizeText(replaceName);
                const weaponIndex = weapons.findIndex((w) => normalizeText(w.name) === normalizedReplace);
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
        const weaponNames = weapons.map((w) => normalizeText(w.name));
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

/**
 * Process a single datasheet file
 */
function processDatasheet(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const datasheet = JSON.parse(content);

        // Skip if no options
        if (!datasheet.options || datasheet.options.length === 0) {
            return { processed: false, reason: "no options" };
        }

        // Detect complexity
        const complexity = detectComplexity(datasheet);

        if (!complexity.isComplex) {
            // Remove precomputedLoadouts and wargearComplexity if they exist (in case complexity changed)
            if (datasheet.precomputedLoadouts || datasheet.wargearComplexity) {
                delete datasheet.precomputedLoadouts;
                delete datasheet.wargearComplexity;
                fs.writeFileSync(filePath, JSON.stringify(datasheet, null, 2), "utf-8");
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
        fs.writeFileSync(filePath, JSON.stringify(datasheet, null, 2), "utf-8");

        return {
            processed: true,
            reason: complexity.reason,
            loadoutCount: loadouts.length,
        };
    } catch (error) {
        return { processed: false, reason: `error: ${error.message}` };
    }
}

/**
 * Main function
 */
async function main() {
    const outputPath = path.join(__dirname, "..", "..", "src", "app", "data", "output", "factions");

    if (!fs.existsSync(outputPath)) {
        console.error(`Error: ${outputPath} does not exist`);
        console.error("Run 'npm run parse-depot-data' first to generate output files.");
        process.exit(1);
    }

    console.log("═".repeat(60));
    console.log("🔧 Generating Precomputed Loadouts for Complex Datasheets");
    console.log("═".repeat(60));
    console.log("");

    // Find all faction directories
    const factionDirs = fs.readdirSync(outputPath, { withFileTypes: true }).filter((d) => d.isDirectory());

    let totalProcessed = 0;
    let totalComplex = 0;
    let totalLoadouts = 0;
    const complexDatasheets = [];

    for (const factionDir of factionDirs) {
        const datasheetDir = path.join(outputPath, factionDir.name, "datasheets");

        if (!fs.existsSync(datasheetDir)) {
            continue;
        }

        const datasheetFiles = fs.readdirSync(datasheetDir).filter((f) => f.endsWith(".json"));

        for (const file of datasheetFiles) {
            const filePath = path.join(datasheetDir, file);
            const result = processDatasheet(filePath);

            totalProcessed++;

            if (result.processed && result.loadoutCount > 0) {
                totalComplex++;
                totalLoadouts += result.loadoutCount;

                // Read the datasheet name for logging
                const datasheet = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                complexDatasheets.push({
                    id: datasheet.id,
                    name: datasheet.name,
                    faction: factionDir.name,
                    loadoutCount: result.loadoutCount,
                    reason: result.reason,
                });

                console.log(`✅ ${datasheet.name} (${factionDir.name}): ${result.loadoutCount} loadouts - ${result.reason}`);
            }
        }
    }

    console.log("");
    console.log("═".repeat(60));
    console.log("📊 Summary");
    console.log("═".repeat(60));
    console.log(`   Total datasheets processed: ${totalProcessed}`);
    console.log(`   Complex datasheets: ${totalComplex}`);
    console.log(`   Total loadouts generated: ${totalLoadouts}`);
    console.log("");

    if (complexDatasheets.length > 0) {
        console.log("📋 Complex Datasheets:");
        for (const ds of complexDatasheets) {
            console.log(`   - ${ds.name} (${ds.faction}): ${ds.loadoutCount} loadouts`);
        }
    }

    console.log("");
    console.log("═".repeat(60));
}

// Run the script
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});

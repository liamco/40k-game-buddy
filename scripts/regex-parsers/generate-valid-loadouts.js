/**
 * Generate Valid Loadouts Script
 *
 * Generates all legal weapon/ability loadout combinations for each datasheet,
 * storing them in a new grouped structure:
 *
 * wargear: {
 *   defaultLoadout: { raw: "...", parsed: ["id1", "id2"] },
 *   validLoadouts: [
 *     { modelType: "any", items: [["id1", "id2"], ["id1", "id3"]] },
 *     { modelType: "Sergeant", items: [["id1", "id4"]] },
 *     { modelType: "Terminator", targeting: { type: "ratio", ratio: 5 }, items: [...] }
 *   ]
 * }
 *
 * Usage:
 *   npm run generate-loadouts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Convert a weapon/ability name to its ID format
 */
function nameToId(name, datasheetId, isAbility = false) {
    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");
    if (isAbility) {
        return `wargear-ability:${slug}`;
    }
    return `${datasheetId}:${slug}`;
}

/**
 * Find weapon/ability by name and return its ID
 */
function resolveNameToId(name, weapons, abilities, datasheetId) {
    const normalizedName = name.toLowerCase().trim();

    // Check weapons first
    const weapon = weapons.find((w) => w.name.toLowerCase().trim() === normalizedName);
    if (weapon) {
        return weapon.id;
    }

    // Check abilities
    const ability = abilities.find((a) => a.name.toLowerCase().trim() === normalizedName);
    if (ability) {
        return `wargear-ability:${normalizedName.replace(/\s+/g, "-")}`;
    }

    // Fallback - construct ID from name
    return nameToId(name, datasheetId, false);
}

/**
 * Strip HTML tags from text
 */
function stripHtml(text) {
    return text.replace(/<[^>]*>/g, "").trim();
}

/**
 * Clean model type from unit composition description
 * "1 Terminator Sergeant" -> "Terminator Sergeant"
 * "4-9 Terminators" -> "Terminator"
 */
function cleanModelType(description) {
    return description
        .replace(/^\d+[-\s]*\d*\s*/, "") // Remove leading numbers
        .replace(/s$/, "") // Remove trailing 's' for plural
        .trim();
}

/**
 * Parse the default loadout text to extract weapon names per model type
 */
function parseDefaultLoadout(defaultLoadoutText, unitComposition) {
    if (!defaultLoadoutText) return [];

    const text = stripHtml(defaultLoadoutText);
    const loadouts = [];

    // Pattern: "X model is equipped with: items" or "Every X model is equipped with: items"
    const modelPatterns = [/(?:The\s+)?(\w[\w\s]+?)\s+(?:model\s+)?is equipped with:\s*([^.]+)/gi, /Every\s+(\w[\w\s]+?)\s+(?:model\s+)?is equipped with:\s*([^.]+)/gi];

    // Try model-specific patterns
    for (const pattern of modelPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const modelType = match[1].trim();
            const itemsText = match[2].trim();
            const items = itemsText
                .split(/[;,]/)
                .map((s) => s.trim())
                .filter((s) => s && s.length > 0)
                .map((s) => s.replace(/^\d+\s+/, "")); // Remove leading counts

            if (items.length > 0) {
                loadouts.push({ modelType, items });
            }
        }
    }

    // If no model-specific loadouts found, try generic pattern
    if (loadouts.length === 0) {
        const genericMatch = text.match(/equipped with:\s*([^.]+)/i);
        if (genericMatch) {
            const items = genericMatch[1]
                .split(/[;,]/)
                .map((s) => s.trim())
                .filter((s) => s && s.length > 0)
                .map((s) => s.replace(/^\d+\s+/, ""));

            // Use first unit composition model type, or "any"
            const modelType = unitComposition?.[0]?.description ? cleanModelType(stripHtml(unitComposition[0].description)) : "any";

            if (items.length > 0) {
                loadouts.push({ modelType, items });
            }
        }
    }

    return loadouts;
}

/**
 * Extract model types from unit composition
 */
function getModelTypes(unitComposition) {
    if (!unitComposition || unitComposition.length === 0) {
        return [{ modelType: "any", min: 1, max: 1 }];
    }

    return unitComposition.map((comp) => ({
        modelType: cleanModelType(stripHtml(comp.description)),
        min: comp.min,
        max: comp.max,
    }));
}

/**
 * Check if a loadout contains all specified items (by name)
 */
function loadoutContainsAll(loadout, itemNames, weapons, abilities, datasheetId) {
    for (const name of itemNames) {
        const id = resolveNameToId(name, weapons, abilities, datasheetId);
        if (!loadout.includes(id)) {
            return false;
        }
    }
    return true;
}

/**
 * Apply a replacement: remove items and add new items
 */
function applyReplacement(loadout, removes, adds, weapons, abilities, datasheetId) {
    let newLoadout = [...loadout];

    // Remove items
    for (const ref of removes) {
        const name = typeof ref === "string" ? ref : ref.name;
        const id = resolveNameToId(name, weapons, abilities, datasheetId);
        newLoadout = newLoadout.filter((item) => item !== id);
    }

    // Add items
    for (const ref of adds) {
        const name = typeof ref === "string" ? ref : ref.name;
        const isAbility = typeof ref === "object" && ref.isAbility;
        const id = isAbility ? `wargear-ability:${name.toLowerCase().trim().replace(/\s+/g, "-")}` : resolveNameToId(name, weapons, abilities, datasheetId);
        if (!newLoadout.includes(id)) {
            newLoadout.push(id);
        }
    }

    return newLoadout;
}

/**
 * Deduplicate loadouts (arrays of IDs)
 */
function deduplicateLoadouts(loadouts) {
    const seen = new Set();
    return loadouts.filter((loadout) => {
        const key = [...loadout].sort().join("|");
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

/**
 * Check if targeting applies to a model type
 */
function targetingAppliesToModel(targeting, modelType) {
    switch (targeting.type) {
        case "this-model":
        case "all-models":
        case "any-number":
        case "this-unit":
            return true;

        case "specific-model":
        case "each-model-type":
        case "n-model-specific":
            if (targeting.modelType) {
                const targetType = targeting.modelType.toLowerCase().trim();
                const currentType = modelType.toLowerCase().trim();
                return currentType === targetType || currentType === targetType + "s" || currentType + "s" === targetType || currentType.includes(targetType) || targetType.includes(currentType);
            }
            return false;

        case "conditional":
            return true;

        case "ratio":
        case "ratio-capped":
            if (targeting.modelType) {
                const targetType = targeting.modelType.toLowerCase().trim();
                const currentType = modelType.toLowerCase().trim();
                return currentType === targetType || currentType === targetType + "s" || currentType + "s" === targetType;
            }
            return true;

        case "up-to-n":
            return true;

        default:
            return true;
    }
}

/**
 * Get targeting metadata for a model type based on options
 */
function getTargetingForModelType(modelType, options) {
    for (const option of options) {
        if (!option.wargearParsed) continue;

        const targeting = option.targeting;

        // Check for ratio-based targeting
        if (targeting.type === "ratio" || targeting.type === "ratio-capped") {
            if (targetingAppliesToModel(targeting, modelType)) {
                return {
                    type: "ratio",
                    ratio: targeting.ratio,
                    count: targeting.count || 1,
                    ...(targeting.maxPerRatio && { maxPerRatio: targeting.maxPerRatio }),
                };
            }
        }

        // Check for up-to-n targeting
        if (targeting.type === "up-to-n") {
            if (targetingAppliesToModel(targeting, modelType)) {
                return {
                    type: "up-to-n",
                    max: targeting.maxTotal,
                };
            }
        }

        // Check for n-model-specific targeting
        if (targeting.type === "n-model-specific") {
            if (targetingAppliesToModel(targeting, modelType)) {
                return {
                    type: "n-model-specific",
                    count: targeting.count,
                };
            }
        }
    }

    return null;
}

/**
 * Check if a conditional option's condition is met
 */
function conditionMet(condition, loadout, weapons, abilities, datasheetId) {
    if (!condition) return true;

    if (condition.type === "equipped-with") {
        if (condition.weaponName) {
            const cleanName = condition.weaponName.replace(/^(a |an )/i, "").trim();
            const id = resolveNameToId(cleanName, weapons, abilities, datasheetId);
            return loadout.includes(id);
        }

        if (condition.weaponNames && Array.isArray(condition.weaponNames)) {
            return condition.weaponNames.every((name) => {
                const cleanName = name.replace(/^(a |an )/i, "").trim();
                const id = resolveNameToId(cleanName, weapons, abilities, datasheetId);
                return loadout.includes(id);
            });
        }
    }

    return true;
}

// ============================================================================
// MAIN LOADOUT GENERATION
// ============================================================================

/**
 * Generate all valid loadouts for a single model type
 */
function generateLoadoutsForModelType(modelType, baseLoadout, options, weapons, abilities, datasheetId) {
    let loadouts = [baseLoadout];

    for (const option of options) {
        if (!option.wargearParsed) continue;
        if (option.action.type === "unknown") continue;

        if (!targetingAppliesToModel(option.targeting, modelType)) {
            continue;
        }

        const newLoadouts = [];

        for (const loadout of loadouts) {
            // Handle conditional targeting
            if (option.targeting.type === "conditional") {
                if (!conditionMet(option.targeting.condition, loadout, weapons, abilities, datasheetId)) {
                    newLoadouts.push(loadout);
                    continue;
                }
            }

            if (option.action.type === "replace") {
                const removeNames = option.action.removes.map((r) => r.name);

                if (loadoutContainsAll(loadout, removeNames, weapons, abilities, datasheetId)) {
                    // Keep original
                    newLoadouts.push(loadout);

                    // Add each replacement choice
                    for (const choice of option.action.adds) {
                        const newLoadout = applyReplacement(loadout, option.action.removes, choice.weapons, weapons, abilities, datasheetId);
                        newLoadouts.push(newLoadout);
                    }
                } else {
                    newLoadouts.push(loadout);
                }
            } else if (option.action.type === "add") {
                // Skip unconditional adds
                const isUnconditionalAdd = option.targeting.type !== "conditional";

                if (isUnconditionalAdd) {
                    newLoadouts.push(loadout);
                } else {
                    // Conditional add - expand
                    newLoadouts.push(loadout);

                    for (const choice of option.action.adds) {
                        const addItems = choice.weapons.map((ref) => {
                            const isAbility = ref.isAbility;
                            return isAbility ? `wargear-ability:${ref.name.toLowerCase().trim().replace(/\s+/g, "-")}` : resolveNameToId(ref.name, weapons, abilities, datasheetId);
                        });

                        const newLoadout = [...loadout, ...addItems.filter((id) => !loadout.includes(id))];
                        newLoadouts.push(newLoadout);
                    }
                }
            }
        }

        loadouts = deduplicateLoadouts(newLoadouts);
    }

    return loadouts;
}

/**
 * Apply global constraints to filter out invalid loadouts
 */
function applyConstraints(loadouts, options, weapons, abilities, datasheetId) {
    const allConstraints = {
        mutuallyExclusive: [],
        maxWeaponCount: [],
    };

    for (const option of options) {
        if (option.constraints) {
            if (option.constraints.mutuallyExclusive) {
                allConstraints.mutuallyExclusive.push(...option.constraints.mutuallyExclusive);
            }
            if (option.constraints.maxWeaponCount) {
                allConstraints.maxWeaponCount.push(...option.constraints.maxWeaponCount);
            }
        }
    }

    return loadouts.filter((loadout) => {
        for (const [a, b] of allConstraints.mutuallyExclusive) {
            const idA = resolveNameToId(a, weapons, abilities, datasheetId);
            const idB = resolveNameToId(b, weapons, abilities, datasheetId);
            if (loadout.includes(idA) && loadout.includes(idB)) {
                return false;
            }
        }

        for (const { weapon, max } of allConstraints.maxWeaponCount) {
            const id = resolveNameToId(weapon, weapons, abilities, datasheetId);
            const count = loadout.filter((item) => item === id).length;
            if (count > max) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Generate all valid loadouts for a datasheet, grouped by model type
 */
function generateValidLoadouts(datasheet) {
    const weapons = datasheet.wargear?.weapons || [];
    const abilities = datasheet.wargear?.abilities || [];
    const options = datasheet.wargear?.options?.parsed || [];
    const datasheetId = datasheet.id;

    const modelTypes = getModelTypes(datasheet.unitComposition);

    // Handle both old (string) and new (object) defaultLoadout formats
    const rawDefaultLoadout = datasheet.wargear?.defaultLoadout;
    const defaultLoadoutText = typeof rawDefaultLoadout === "string" ? rawDefaultLoadout : rawDefaultLoadout?.raw || "";

    const defaultLoadouts = parseDefaultLoadout(defaultLoadoutText, datasheet.unitComposition);

    // Map to collect loadouts by model type
    const loadoutsByModelType = new Map();

    // Track which loadouts are shared across all model types
    const sharedLoadouts = new Map(); // loadout key -> count of model types that have it

    for (const { modelType } of modelTypes) {
        // Find default loadout for this model type
        let baseLoadout = defaultLoadouts.find((dl) => {
            const dlType = dl.modelType.toLowerCase();
            const mtType = modelType.toLowerCase();
            return dlType === mtType || dlType.includes(mtType) || mtType.includes(dlType) || dlType === mtType + "s" || dlType + "s" === mtType;
        });

        if (!baseLoadout && defaultLoadouts.length > 0) {
            baseLoadout = defaultLoadouts[0];
        }

        if (!baseLoadout) continue;

        const baseLoadoutIds = baseLoadout.items.map((name) => resolveNameToId(name, weapons, abilities, datasheetId));

        let loadouts = generateLoadoutsForModelType(modelType, baseLoadoutIds, options, weapons, abilities, datasheetId);

        loadouts = applyConstraints(loadouts, options, weapons, abilities, datasheetId);

        // Store loadouts for this model type
        loadoutsByModelType.set(modelType, {
            loadouts,
            targeting: getTargetingForModelType(modelType, options),
        });

        // Track shared loadouts
        for (const loadout of loadouts) {
            const key = [...loadout].sort().join("|");
            sharedLoadouts.set(key, (sharedLoadouts.get(key) || 0) + 1);
        }
    }

    // Build the grouped output
    const result = [];
    const totalModelTypes = modelTypes.length;

    // Find loadouts shared by ALL model types (these go in "any")
    const anyLoadouts = [];
    const modelTypeSpecificLoadouts = new Map();

    for (const [modelType, data] of loadoutsByModelType) {
        const specificLoadouts = [];

        for (const loadout of data.loadouts) {
            const key = [...loadout].sort().join("|");
            const sharedCount = sharedLoadouts.get(key) || 0;

            if (sharedCount === totalModelTypes && totalModelTypes > 1) {
                // This loadout is shared by all - add to "any" (only once)
                if (!anyLoadouts.some((l) => [...l].sort().join("|") === key)) {
                    anyLoadouts.push(loadout);
                }
            } else {
                // This loadout is specific to this model type
                specificLoadouts.push(loadout);
            }
        }

        if (specificLoadouts.length > 0) {
            modelTypeSpecificLoadouts.set(modelType, {
                loadouts: specificLoadouts,
                targeting: data.targeting,
            });
        }
    }

    // Add "any" group if there are shared loadouts
    if (anyLoadouts.length > 0) {
        result.push({
            modelType: "any",
            items: anyLoadouts,
        });
    }

    // Add model-type specific groups
    for (const [modelType, data] of modelTypeSpecificLoadouts) {
        const entry = {
            modelType,
            items: data.loadouts,
        };

        if (data.targeting) {
            entry.targeting = data.targeting;
        }

        result.push(entry);
    }

    // If only one model type and no "any", simplify to "any"
    if (result.length === 1 && result[0].modelType !== "any" && !result[0].targeting) {
        result[0].modelType = "any";
    }

    return result;
}

/**
 * Parse default loadout into structured format with raw and parsed
 */
function parseDefaultLoadoutStructured(defaultLoadoutText, weapons, abilities, datasheetId, unitComposition) {
    if (!defaultLoadoutText) {
        return { raw: "", parsed: [] };
    }

    const parsed = parseDefaultLoadout(defaultLoadoutText, unitComposition);

    // Get the first/primary loadout and resolve to IDs
    if (parsed.length > 0) {
        const ids = parsed[0].items.map((name) => resolveNameToId(name, weapons, abilities, datasheetId));
        return {
            raw: defaultLoadoutText,
            parsed: ids,
        };
    }

    return {
        raw: defaultLoadoutText,
        parsed: [],
    };
}

// ============================================================================
// FILE PROCESSING
// ============================================================================

/**
 * Check if a datasheet has any real wargear options
 */
function hasWargearOptions(datasheet) {
    const rawOptions = datasheet.wargear?.options?.raw || [];
    if (rawOptions.length === 0) return false;

    return rawOptions.some((opt) => {
        const desc = (opt.description || "").trim().toLowerCase();
        if (desc === "none" || desc === "none.") return false;
        if (desc.startsWith("*")) return false;
        return true;
    });
}

/**
 * Process a single datasheet JSON file
 */
function processDatasheetFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const datasheet = JSON.parse(content);

        if (!datasheet.wargear) {
            return { modified: false, loadouts: 0, noOptions: true };
        }

        const weapons = datasheet.wargear.weapons || [];
        const abilities = datasheet.wargear.abilities || [];

        // Always update defaultLoadout structure
        const oldDefaultLoadout = datasheet.wargear.defaultLoadout;
        const defaultLoadoutRaw = typeof oldDefaultLoadout === "string" ? oldDefaultLoadout : oldDefaultLoadout?.raw || "";

        datasheet.wargear.defaultLoadout = parseDefaultLoadoutStructured(defaultLoadoutRaw, weapons, abilities, datasheet.id, datasheet.unitComposition);

        // Skip loadout generation if no real options
        if (!hasWargearOptions(datasheet)) {
            datasheet.wargear.validLoadouts = [];
            fs.writeFileSync(filePath, JSON.stringify(datasheet, null, 2), "utf-8");
            return { modified: true, loadouts: 0, noOptions: true };
        }

        // Generate valid loadouts
        const validLoadouts = generateValidLoadouts(datasheet);

        datasheet.wargear.validLoadouts = validLoadouts;

        fs.writeFileSync(filePath, JSON.stringify(datasheet, null, 2), "utf-8");

        // Count total loadouts across all groups
        const totalLoadouts = validLoadouts.reduce((sum, group) => sum + group.items.length, 0);

        return {
            modified: true,
            loadouts: totalLoadouts,
            groups: validLoadouts.length,
        };
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return { modified: false, error: error.message };
    }
}

/**
 * Find all datasheet JSON files recursively
 */
function findDatasheetFiles(dir) {
    const files = [];

    function walk(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                if (entry.name === "datasheets") {
                    const datasheetFiles = fs.readdirSync(fullPath).filter((f) => f.endsWith(".json"));
                    files.push(...datasheetFiles.map((f) => path.join(fullPath, f)));
                } else {
                    walk(fullPath);
                }
            }
        }
    }

    walk(dir);
    return files;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log("═".repeat(60));
    console.log("  Generate Valid Loadouts");
    console.log("═".repeat(60));
    console.log("");

    const outputPath = path.join(__dirname, "..", "..", "src", "app", "data", "output", "factions");

    if (!fs.existsSync(outputPath)) {
        console.error(`❌ Output directory not found: ${outputPath}`);
        process.exit(1);
    }

    const datasheetFiles = findDatasheetFiles(outputPath);
    console.log(`📁 Found ${datasheetFiles.length} datasheet files to process`);
    console.log(`📂 Source: ${outputPath}`);
    console.log("");

    let totalModified = 0;
    let totalLoadouts = 0;
    let totalErrors = 0;
    let totalNoOptions = 0;
    const anomalies = {
        zeroLoadouts: [],
        highLoadouts: [],
    };

    for (let i = 0; i < datasheetFiles.length; i++) {
        const filePath = datasheetFiles[i];
        const relativePath = path.relative(outputPath, filePath);

        const result = processDatasheetFile(filePath);

        if (result.error) {
            totalErrors++;
            console.log(`❌ [${i + 1}/${datasheetFiles.length}] Error: ${relativePath}`);
        } else if (result.noOptions) {
            totalNoOptions++;
        } else if (result.modified) {
            totalModified++;
            totalLoadouts += result.loadouts;

            if (result.loadouts === 0) {
                anomalies.zeroLoadouts.push(relativePath);
            } else if (result.loadouts > 100) {
                anomalies.highLoadouts.push({ path: relativePath, count: result.loadouts });
            }

            if ((i + 1) % 100 === 0) {
                console.log(`   Processed ${i + 1}/${datasheetFiles.length} files...`);
            }
        }
    }

    console.log("");
    console.log("═".repeat(60));
    console.log("📊 Summary:");
    console.log(`   📄 Files processed: ${datasheetFiles.length}`);
    console.log(`   ⏭️  Skipped (no options): ${totalNoOptions}`);
    console.log(`   ✏️  With loadouts generated: ${totalModified}`);
    console.log(`   📦 Total loadouts generated: ${totalLoadouts}`);
    if (totalModified > 0) {
        console.log(`   📈 Average loadouts per datasheet: ${(totalLoadouts / totalModified).toFixed(1)}`);
    }
    if (totalErrors > 0) {
        console.log(`   ❌ Errors: ${totalErrors}`);
    }
    console.log("═".repeat(60));

    if (anomalies.zeroLoadouts.length > 0) {
        console.log("");
        console.log("⚠️  Datasheets with 0 loadouts:");
        anomalies.zeroLoadouts.slice(0, 10).forEach((p) => console.log(`   - ${p}`));
        if (anomalies.zeroLoadouts.length > 10) {
            console.log(`   ... and ${anomalies.zeroLoadouts.length - 10} more`);
        }
    }

    if (anomalies.highLoadouts.length > 0) {
        console.log("");
        console.log("⚠️  Datasheets with >100 loadouts (may indicate bug):");
        anomalies.highLoadouts.slice(0, 10).forEach(({ path, count }) => console.log(`   - ${path}: ${count} loadouts`));
    }
}

main().catch(console.error);

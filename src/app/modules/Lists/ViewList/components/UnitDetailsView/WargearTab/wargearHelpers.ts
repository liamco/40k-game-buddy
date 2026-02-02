import { ArmyListItem, ModelInstance } from "#types/Lists.tsx";
import { Weapon } from "#types/Weapons.tsx";

// Types for parsed option data
export interface ParsedOption {
    line: number;
    description: string;
    isNote: boolean;

    // WHO can take this option
    targeting: OptionTargeting;

    // WHAT the option does
    action: "replace" | "add";

    // Weapons involved
    replacesWeaponNames: string[];
    addsWeaponNames: string[]; // Single weapon choices (e.g., ["assault cannon", "heavy flamer"])
    addsWeaponPackages: string[][]; // Package deals where multiple weapons are added together (e.g., [["cyclone missile launcher", "storm bolter"]])
    isPackageDeal: boolean; // Deprecated - use addsWeaponPackages.length > 0 instead

    // Constraint info
    constraint: OptionConstraint;
}

export interface OptionTargeting {
    type: "this-model" | "specific-model" | "any-number" | "all-models" | "one-model" | "up-to-n" | "ratio" | "ratio-up-to" | "conditional";
    modelType?: string; // For specific-model or one-model targeting (e.g., "Sergeant", "Tactical Marine")
    n?: number; // For up-to-n, one-model count, ratio, etc.
    upTo?: number; // For ratio-up-to (the cap per ratio group)
}

export interface OptionConstraint {
    maxPerUnit: number; // Total max across the unit
    maxPerModel: number; // Max per individual model (usually 1)
}

// Represents what options a specific model instance has available
export interface ModelOptionsInfo {
    instance: ModelInstance;
    instanceIndex: number; // Position in the unit (0-indexed)
    modelType: string;
    currentWeapons: Weapon[];

    // Options available to this model
    availableOptions: AvailableOption[];

    // Does this model have any options at all?
    hasOptions: boolean;
}

export interface AvailableOption {
    parsedOption: ParsedOption;
    isEligible: boolean; // Can this model take this option?
    isDisabled: boolean; // Eligible but maxed out?
    currentUsage: number; // How many times has this option been used across the unit?
    maxUsage: number; // Max times this can be used
}

// For grouping models in the UI
export interface ModelDisplayGroup {
    modelType: string;
    startIndex: number; // e.g., 1 for "#1-8"
    endIndex: number; // e.g., 8 for "#1-8"
    instances: ModelInstance[];
    sharedWeapons: Weapon[];
    hasOptions: boolean;
}

/**
 * Parse option targeting from description
 */
export function parseOptionTargeting(description: string): OptionTargeting {
    const normalized = description
        .replace(/<[^>]*>/g, " ")
        .trim()
        .toLowerCase();

    // "This model's..." or "This model can be equipped..."
    if (/^this model/i.test(normalized)) {
        return { type: "this-model" };
    }

    // "The Sergeant/Superior/Champion..." (leader models with "the" prefix)
    const leaderMatch = normalized.match(/^the ([a-z\s]+?)((?:'s)?\s+(bolt|power|storm|chain|close|plasma|melta)|\s+can)/i);
    if (leaderMatch) {
        const modelType = leaderMatch[1].trim();
        return { type: "specific-model", modelType };
    }

    // "Any number of models..."
    if (/^any number/i.test(normalized)) {
        return { type: "any-number" };
    }

    // "All models in this unit..." - every model gets the swap (all-or-nothing)
    if (/^all models/i.test(normalized)) {
        return { type: "all-models" };
    }

    // "For every N models, up to M can..."
    const ratioUpToMatch = normalized.match(/for every (\d+) models.*up to (\d+)/i);
    if (ratioUpToMatch) {
        return {
            type: "ratio-up-to",
            n: parseInt(ratioUpToMatch[1], 10),
            upTo: parseInt(ratioUpToMatch[2], 10),
        };
    }

    // "For every N models, X ModelType's weapon can..." - ratio with specific model type
    // Example: "For every 5 models in this unit, 1 Heavy Intercessor's heavy bolt rifle can be replaced"
    const ratioWithModelTypeMatch = normalized.match(/for every (\d+) models.*?(\d+)\s+([a-z][a-z\s]+?)'s\s+/i);
    if (ratioWithModelTypeMatch) {
        const possibleModelType = ratioWithModelTypeMatch[3].trim();
        // "model" is a generic term, not a specific model type - don't set modelType filter
        const isGenericModel = possibleModelType.toLowerCase() === "model";
        return {
            type: "ratio",
            n: parseInt(ratioWithModelTypeMatch[1], 10),
            upTo: parseInt(ratioWithModelTypeMatch[2], 10),
            ...(isGenericModel ? {} : { modelType: possibleModelType }),
        };
    }

    // "For every N models, 1 can..." (no specific model type)
    const ratioMatch = normalized.match(/for every (\d+) models.*?(\d+)\s+\w+.*?can/i);
    if (ratioMatch) {
        return {
            type: "ratio",
            n: parseInt(ratioMatch[1], 10),
            upTo: parseInt(ratioMatch[2], 10),
        };
    }

    // Simple ratio: "For every N models..."
    const simpleRatioMatch = normalized.match(/for every (\d+) models/i);
    if (simpleRatioMatch) {
        return {
            type: "ratio",
            n: parseInt(simpleRatioMatch[1], 10),
            upTo: 1,
        };
    }

    // "Up to N models..."
    const upToMatch = normalized.match(/^up to (\d+)/i);
    if (upToMatch) {
        return { type: "up-to-n", n: parseInt(upToMatch[1], 10) };
    }

    // "1 Tactical Marine's..." or "1 Model can..." - one specific model type can take this
    // This pattern: "1 [ModelType]'s [weapon] can be replaced..."
    const oneModelTypeMatch = normalized.match(/^(\d+)\s+([a-z\s]+?)(?:'s\s+[a-z\s-]+\s+can|\s+can)/i);
    if (oneModelTypeMatch) {
        const count = parseInt(oneModelTypeMatch[1], 10);
        const modelType = oneModelTypeMatch[2].trim();
        // If it's a generic "model" or "models", treat as one-model
        if (modelType === "model" || modelType === "models") {
            return { type: "one-model", n: count };
        }
        // Otherwise it's a specific model type (like "Tactical Marine")
        return { type: "one-model", n: count, modelType };
    }

    // "If this model is equipped with..."
    if (/^if /i.test(normalized)) {
        return { type: "conditional" };
    }

    // Default: treat as this-model
    return { type: "this-model" };
}

/**
 * Parse weapons from option description
 */
export interface ParsedWeapons {
    weapons: string[]; // Single weapon choices
    packages: string[][]; // Package deals (multiple weapons bundled together)
}

export function parseWeaponsFromDescription(description: string): ParsedWeapons {
    const weapons: string[] = [];
    const packages: string[][] = [];

    // Check for <li> list items
    if (description.includes("<li>")) {
        const liMatches = description.matchAll(/<li>(.+?)<\/li>/gi);
        for (const match of liMatches) {
            const itemText = match[1].replace(/<[^>]*>/g, " ").trim();

            // Check if this is a package deal (contains " and " with a number, e.g., "X and 1 Y")
            if (/ and \d+\s+/i.test(itemText)) {
                // Split on " and " and extract weapon names
                const parts = itemText.split(/ and /i);
                const packageWeapons = parts.map((part) => {
                    const weaponMatch = part.match(/^(\d+\s+)?(.+?)(?:\s*\*|\.|$)/i);
                    return weaponMatch ? weaponMatch[2].trim() : part.trim();
                });
                packages.push(packageWeapons);
            } else {
                // Single weapon
                const weaponMatch = itemText.match(/^(\d+\s+)?(.+?)(?:\s*\*|\.|$)/i);
                if (weaponMatch && weaponMatch[2]) {
                    weapons.push(weaponMatch[2].trim());
                }
            }
        }
    }

    if (weapons.length > 0 || packages.length > 0) return { weapons, packages };

    // Fallback: look for "with X" pattern
    const withMatch = description.match(/(?:replaced with|equipped with)\s+(\d+\s+)?([^.<]+)/i);
    if (withMatch && withMatch[2]) {
        weapons.push(withMatch[2].trim());
    }

    return { weapons, packages };
}

/**
 * Check if an option description indicates a package deal (multiple weapons given together)
 */
export function isPackageDeal(description: string): boolean {
    // Look for patterns like "X and Y" in the added weapons
    // But NOT in the replaced weapons section
    const afterWith = description.toLowerCase().split(/replaced with|equipped with/i)[1] || "";
    return /\band\b/.test(afterWith) && !/<li>/.test(afterWith);
}

/**
 * Parse a full option into structured data
 */
export function parseOption(option: { line: number; button: string; description: string }, totalModels: number): ParsedOption {
    const desc = option.description || "";
    const normalized = desc
        .replace(/<[^>]*>/g, " ")
        .trim()
        .toLowerCase();
    const isNote = option.button === "*";

    const targeting = parseOptionTargeting(desc);

    // Determine action type
    const isReplace = /can be replaced|replaced with/i.test(normalized);
    const isAdd = /can be equipped|equipped with/i.test(normalized) && !isReplace;
    const action: "replace" | "add" = isReplace ? "replace" : "add";

    // Parse replaced weapons
    const replacesWeaponNames: string[] = [];
    if (isReplace) {
        // Try multiple patterns to extract the replaced weapon
        // Pattern 1: "X can be replaced with Y"
        let replaceMatch = normalized.match(/(.+?)\s+can be replaced/i);

        // Pattern 2: "can each have their X replaced with Y" (for "any number" options)
        if (!replaceMatch) {
            const theirPattern = normalized.match(/their\s+([a-z][a-z\s-]+?)\s+replaced with/i);
            if (theirPattern) {
                replacesWeaponNames.push(theirPattern[1].trim());
            }
        }

        if (replaceMatch && replacesWeaponNames.length === 0) {
            let replacedPart = replaceMatch[1];

            // For ratio patterns like "For every 5 models..., 1 Heavy Intercessor's heavy bolt rifle"
            // Extract from after the model type reference
            const ratioModelMatch = replacedPart.match(/\d+\s+[a-z\s]+?'s\s+(.+)$/i);
            if (ratioModelMatch) {
                replacesWeaponNames.push(ratioModelMatch[1].trim());
            }
            // For "any number of models can each have their X replaced" pattern
            else if (/their\s+/i.test(replacedPart)) {
                const theirMatch = replacedPart.match(/their\s+(.+)$/i);
                if (theirMatch) {
                    replacesWeaponNames.push(theirMatch[1].trim());
                }
            } else {
                // Strip "This model's" etc.
                replacedPart = replacedPart.replace(/^(this\s+)?model\W?s?\s+/i, "");
                // Strip "The [Model Type]'s" pattern (e.g., "The Terminator Sergeant's")
                replacedPart = replacedPart.replace(/^the\s+[a-z\s]+?'s\s+/i, "");
                // Extract weapon name
                const weaponMatch = replacedPart.match(/(\d+\s+)?([a-z][a-z\s-]+)/i);
                if (weaponMatch && weaponMatch[2]) {
                    replacesWeaponNames.push(weaponMatch[2].trim());
                }
            }
        }
    }

    // Parse added weapons
    const parsedWeapons = parseWeaponsFromDescription(desc);
    const addsWeaponNames = parsedWeapons.weapons;
    const addsWeaponPackages = parsedWeapons.packages;
    const packageDeal = addsWeaponPackages.length > 0;

    // Calculate constraint
    let maxPerUnit = 1;
    switch (targeting.type) {
        case "this-model":
            maxPerUnit = 1;
            break;
        case "any-number":
            maxPerUnit = totalModels;
            break;
        case "all-models":
            // All-or-nothing: either all models take it or none do
            maxPerUnit = totalModels;
            break;
        case "one-model":
            // "1 Tactical Marine's boltgun can be replaced" = 1 model can take it
            maxPerUnit = targeting.n || 1;
            break;
        case "up-to-n":
            maxPerUnit = targeting.n || 1;
            break;
        case "ratio":
        case "ratio-up-to": {
            const groups = Math.floor(totalModels / (targeting.n || 5));
            maxPerUnit = groups * (targeting.upTo || 1);
            break;
        }
        case "specific-model":
            maxPerUnit = 1; // Usually just the one leader
            break;
        default:
            maxPerUnit = 1;
    }

    return {
        line: option.line,
        description: desc,
        isNote,
        targeting,
        action,
        replacesWeaponNames,
        addsWeaponNames,
        addsWeaponPackages,
        isPackageDeal: packageDeal,
        constraint: {
            maxPerUnit,
            maxPerModel: 1,
        },
    };
}

/**
 * Get options info for each model instance
 */
export function getModelOptionsInfo(unit: ArmyListItem, parsedOptions: ParsedOption[]): ModelOptionsInfo[] {
    if (!unit.modelInstances || !unit.availableWargear) return [];

    const totalModels = unit.modelInstances.length;

    return unit.modelInstances.map((instance, idx) => {
        const currentWeapons = instance.loadout.map((id) => unit.availableWargear!.find((w) => w.id === id)).filter((w): w is Weapon => w !== undefined);

        const availableOptions: AvailableOption[] = parsedOptions
            .filter((opt) => !opt.isNote)
            .map((opt) => {
                // Count current usage across all models
                const currentUsage = countOptionUsage(unit, opt);

                // Determine if this specific model is eligible
                const isEligible = isModelEligibleForOption(instance, idx, opt, totalModels, unit);

                // Disabled if eligible but maxed out
                const isDisabled = isEligible && currentUsage >= opt.constraint.maxPerUnit;

                return {
                    parsedOption: opt,
                    isEligible,
                    isDisabled,
                    currentUsage,
                    maxUsage: opt.constraint.maxPerUnit,
                };
            });

        const hasOptions = availableOptions.some((opt) => opt.isEligible);

        return {
            instance,
            instanceIndex: idx,
            modelType: instance.modelType,
            currentWeapons,
            availableOptions,
            hasOptions,
        };
    });
}

/**
 * Check if a specific model instance is eligible for an option
 */
function isModelEligibleForOption(instance: ModelInstance, instanceIndex: number, option: ParsedOption, totalModels: number, unit: ArmyListItem): boolean {
    const targeting = option.targeting;

    switch (targeting.type) {
        case "this-model":
            // Only for single-model units
            return totalModels === 1;

        case "specific-model":
            // Check if model type matches using the full matching logic
            if (!targeting.modelType) return false;
            return modelTypeMatches(instance.modelType, targeting.modelType);

        case "any-number":
            // Any model can take it
            return true;

        case "all-models":
            // All models are eligible - this is an all-or-nothing swap
            return true;

        case "one-model":
        case "up-to-n": {
            // For these, we need to decide which models can show the option
            // If there's a specific model type, check it
            if (targeting.modelType) {
                const targetLower = targeting.modelType.toLowerCase();
                const modelLower = instance.modelType.toLowerCase();
                const typeMatches = modelLower.includes(targetLower) || targetLower.includes(modelLower);
                if (!typeMatches) return false;
            }

            // Check if this model has the weapon being replaced
            if (option.action === "replace" && option.replacesWeaponNames.length > 0) {
                return hasWeaponByName(instance, option.replacesWeaponNames[0], unit.availableWargear || []);
            }
            return true;
        }

        case "ratio":
        case "ratio-up-to": {
            // Ratio is based on TOTAL models in the unit (e.g., "for every 5 models")
            // For example, "1 in 5" on a 5-model unit = 1 model can take the option
            const ratioN = targeting.n || 5;
            const maxAllowed = Math.floor(totalModels / ratioN) * (targeting.upTo || 1);

            // If maxAllowed is 0, no one is eligible
            if (maxAllowed === 0) return false;

            // If there's a specific model type, check if this model matches
            // e.g., "1 Heavy Intercessor's" should only apply to Heavy Intercessors, not the Sergeant
            if (targeting.modelType) {
                if (!modelTypeMatches(instance.modelType, targeting.modelType)) {
                    return false;
                }
            }

            // If this model has ALREADY taken the option (has the added weapon),
            // they should always be eligible so they can deselect/change it
            if (option.action === "replace" && option.addsWeaponNames.length > 0) {
                const hasAddedWeapon = option.addsWeaponNames.some((name) => hasWeaponByName(instance, name, unit.availableWargear || []));
                if (hasAddedWeapon) return true;
            }

            // Find ALL models that match the model type (if specified)
            // We need to track both: models that could still take the option AND models that already have
            const matchingModelIndices: number[] = [];
            const alreadyTakenIndices: number[] = [];

            unit.modelInstances?.forEach((m, i) => {
                // Check model type match if specified
                if (targeting.modelType) {
                    if (!modelTypeMatches(m.modelType, targeting.modelType)) {
                        return; // Skip this model
                    }
                }

                matchingModelIndices.push(i);

                // Check if this model has already taken the option
                if (option.action === "replace" && option.addsWeaponNames.length > 0) {
                    const hasAddedWeapon = option.addsWeaponNames.some((name) => hasWeaponByName(m, name, unit.availableWargear || []));
                    if (hasAddedWeapon) {
                        alreadyTakenIndices.push(i);
                    }
                }
            });

            // If no matching models, not eligible
            if (matchingModelIndices.length === 0) return false;

            // Calculate how many more models can take the option
            const remainingSlots = maxAllowed - alreadyTakenIndices.length;

            // If all slots are used, no new models are eligible
            if (remainingSlots <= 0) return false;

            // Show option on the FIRST remainingSlots models that haven't already taken it
            const availableIndices = matchingModelIndices.filter((i) => !alreadyTakenIndices.includes(i));
            const showOnIndices = availableIndices.slice(0, remainingSlots);
            return showOnIndices.includes(instanceIndex);
        }

        case "conditional": {
            // Conditional options check if the model has specific equipment
            // Parse the condition from the description (e.g., "If this model is equipped with X")
            const conditionMatch = option.description.toLowerCase().match(/if this model is equipped with (?:an? )?([^,]+)/i);
            if (!conditionMatch) return false;

            const requiredWeapon = conditionMatch[1].trim();
            return hasWeaponByName(instance, requiredWeapon, unit.availableWargear || []);
        }

        default:
            return false;
    }
}

/**
 * Check if a model type matches a target type.
 * Handles singular/plural variations and excludes leader suffixes.
 * e.g., "Heavy Intercessor" matches "Heavy Intercessors" but NOT "Heavy Intercessor Sergeant"
 */
function modelTypeMatches(modelType: string, targetType: string): boolean {
    const modelLower = modelType.toLowerCase();
    const targetLower = targetType.toLowerCase();

    // Leader suffixes that indicate a different model type
    const leaderSuffixes = ["sergeant", "superior", "champion", "synaptic", "prime", "nob", "boss", "leader", "captain", "lieutenant"];

    // Check if model type has a leader suffix that the target doesn't mention
    const modelHasLeaderSuffix = leaderSuffixes.some((suffix) => modelLower.includes(suffix));
    const targetHasLeaderSuffix = leaderSuffixes.some((suffix) => targetLower.includes(suffix));

    // If model is a leader type but target isn't looking for leaders, no match
    // e.g., "Terminator Sergeant" should NOT match target "Terminator"
    if (modelHasLeaderSuffix && !targetHasLeaderSuffix) {
        return false;
    }

    // If target specifies a leader type but model isn't that leader, no match
    // e.g., "Terminator" should NOT match target "Terminator Sergeant"
    if (targetHasLeaderSuffix && !modelHasLeaderSuffix) {
        return false;
    }

    // Now do fuzzy matching
    // Handle singular/plural: "Heavy Intercessor" should match "Heavy Intercessors"
    // Strip trailing 's' for comparison
    const modelBase = modelLower.replace(/s$/, "");
    const targetBase = targetLower.replace(/s$/, "");

    return modelBase.includes(targetBase) || targetBase.includes(modelBase);
}

/**
 * Check if a model instance has a weapon by name.
 * Uses the same matching logic as findWeaponByName to avoid mismatches
 * between similar names like "Onslaught gatling cannon" vs "Heavy onslaught gatling cannon"
 */
function hasWeaponByName(instance: ModelInstance, weaponName: string, availableWargear: Weapon[]): boolean {
    // Find the weapon we're looking for using the improved matching
    const targetWeapon = findWeaponByName(availableWargear, weaponName);
    if (!targetWeapon) return false;

    // Check if the model's loadout contains this specific weapon
    return instance.loadout.includes(targetWeapon.id);
}

/**
 * Count how many times an option has been used across the unit
 */
function countOptionUsage(unit: ArmyListItem, option: ParsedOption): number {
    if (!unit.modelInstances || !unit.availableWargear) return 0;

    // Count models that have used this specific option
    // Use optionSelections if available for accurate tracking
    if (option.action === "replace" && option.addsWeaponNames.length > 0) {
        let count = 0;
        unit.modelInstances.forEach((instance) => {
            // If we have explicit option tracking, use it
            if (instance.optionSelections && instance.optionSelections[option.line] !== undefined) {
                // Check if the selection for this option line is one of the added weapons (not the default)
                const selectedWeaponId = instance.optionSelections[option.line];
                const replacedWeapon = findWeaponByName(unit.availableWargear!, option.replacesWeaponNames[0]);
                if (replacedWeapon && selectedWeaponId !== replacedWeapon.id) {
                    count++;
                }
            } else {
                // Fallback: check if model has added weapon AND doesn't have the replaced weapon
                // This indicates the option was used
                const hasAddedWeapon = option.addsWeaponNames.some((name) => hasWeaponByName(instance, name, unit.availableWargear!));
                const hasReplacedWeapon = option.replacesWeaponNames.some((name) => hasWeaponByName(instance, name, unit.availableWargear!));
                if (hasAddedWeapon && !hasReplacedWeapon) count++;
            }
        });
        return count;
    }

    // For additions, count models that have the added weapon
    if (option.action === "add" && option.addsWeaponNames.length > 0) {
        let count = 0;
        unit.modelInstances.forEach((instance) => {
            const hasAddedWeapon = option.addsWeaponNames.some((name) => hasWeaponByName(instance, name, unit.availableWargear!));
            if (hasAddedWeapon) count++;
        });
        return count;
    }

    return 0;
}

/**
 * Group models for display based on options and loadouts
 */
export function groupModelsForDisplay(modelOptionsInfos: ModelOptionsInfo[], unit: ArmyListItem): ModelDisplayGroup[] {
    if (modelOptionsInfos.length === 0) return [];

    const groups: ModelDisplayGroup[] = [];
    let currentGroup: ModelDisplayGroup | null = null;

    modelOptionsInfos.forEach((info, idx) => {
        const loadoutKey = info.instance.loadout.sort().join("|");
        const canGroup = !info.hasOptions; // Only group if no options

        if (currentGroup && canGroup && !currentGroup.hasOptions && currentGroup.modelType === info.modelType && currentGroup.instances[0].loadout.sort().join("|") === loadoutKey) {
            // Extend current group
            currentGroup.instances.push(info.instance);
            currentGroup.endIndex = idx + 1;
        } else {
            // Start new group
            if (currentGroup) {
                groups.push(currentGroup);
            }
            currentGroup = {
                modelType: info.modelType,
                startIndex: idx + 1, // 1-indexed for display
                endIndex: idx + 1,
                instances: [info.instance],
                sharedWeapons: info.currentWeapons,
                hasOptions: info.hasOptions,
            };
        }
    });

    if (currentGroup) {
        groups.push(currentGroup);
    }

    return groups;
}

/**
 * Find a weapon by name in available wargear.
 * Prioritizes exact matches over partial matches to avoid confusion
 * between similar names like "Onslaught gatling cannon" vs "Heavy onslaught gatling cannon"
 */
export function findWeaponByName(availableWargear: Weapon[], name: string): Weapon | undefined {
    const nameLower = name.toLowerCase().trim();

    // First try exact match
    const exactMatch = availableWargear.find((w) => w.name.toLowerCase() === nameLower);
    if (exactMatch) return exactMatch;

    // Then try partial match, but prefer shorter weapon names when the search term is contained
    // This ensures "onslaught gatling cannon" matches the actual "Onslaught gatling cannon"
    // rather than "Heavy onslaught gatling cannon"
    const partialMatches = availableWargear.filter((w) => {
        const weaponLower = w.name.toLowerCase();
        return weaponLower.includes(nameLower) || nameLower.includes(weaponLower);
    });

    if (partialMatches.length === 0) return undefined;
    if (partialMatches.length === 1) return partialMatches[0];

    // Multiple matches - prefer the one whose name length is closest to the search term
    // This helps pick "Onslaught gatling cannon" over "Heavy onslaught gatling cannon"
    // when searching for "onslaught gatling cannon"
    return partialMatches.sort((a, b) => {
        const aDiff = Math.abs(a.name.length - name.length);
        const bDiff = Math.abs(b.name.length - name.length);
        return aDiff - bDiff;
    })[0];
}

/**
 * Check if a weapon name is a generic reference like "ranged weapon" or "melee weapon"
 */
export function isGenericWeaponReference(name: string): boolean {
    const normalized = name.toLowerCase().trim();
    return normalized === "ranged weapon" || normalized === "melee weapon";
}

/**
 * Get the weapon type from a generic reference
 */
export function getGenericWeaponType(name: string): "Ranged" | "Melee" | null {
    const normalized = name.toLowerCase().trim();
    if (normalized === "ranged weapon") return "Ranged";
    if (normalized === "melee weapon") return "Melee";
    return null;
}

/**
 * Resolve a generic weapon reference to actual weapons from the model's loadout
 */
export function resolveGenericWeaponReference(genericName: string, loadout: string[], availableWargear: Weapon[]): Weapon[] {
    const weaponType = getGenericWeaponType(genericName);
    if (!weaponType) return [];

    return loadout.map((id) => availableWargear.find((w) => w.id === id)).filter((w): w is Weapon => w !== undefined && w.type === weaponType);
}

/**
 * Categorized options by their targeting type for UI rendering
 */
export interface CategorizedOptions {
    unitWideOptions: ParsedOption[]; // targeting.type === "all-models"
    ratioOptions: ParsedOption[]; // targeting.type === "ratio" | "ratio-up-to"
    otherOptions: ParsedOption[]; // everything else (this-model, specific-model, any-number, etc.)
}

/**
 * Categorize parsed options by their targeting type.
 * Used to separate unit-wide options from per-model options in the UI.
 */
export function categorizeOptions(parsedOptions: ParsedOption[]): CategorizedOptions {
    return {
        unitWideOptions: parsedOptions.filter((opt) => opt.targeting.type === "all-models" && !opt.isNote),
        ratioOptions: parsedOptions.filter((opt) => (opt.targeting.type === "ratio" || opt.targeting.type === "ratio-up-to") && !opt.isNote),
        otherOptions: parsedOptions.filter((opt) => !["all-models", "ratio", "ratio-up-to"].includes(opt.targeting.type) && !opt.isNote),
    };
}

/**
 * Get the indices of models that are eligible for ratio options.
 * For example, "for every 10 models, 1 model can..." means the first N models
 * are eligible where N = floor(totalModels / 10).
 *
 * @param totalModels - Total number of models in the unit
 * @param ratioOptions - Parsed ratio options
 * @returns Set of model indices (0-indexed) that are eligible for ratio options
 */
export function getModelsEligibleForRatioOptions(totalModels: number, ratioOptions: ParsedOption[]): Set<number> {
    const eligibleIndices = new Set<number>();

    for (const ratioOpt of ratioOptions) {
        const ratio = ratioOpt.targeting.n || 10;
        const upTo = ratioOpt.targeting.upTo || 1;
        const maxEligible = Math.floor(totalModels / ratio) * upTo;

        // First N models are eligible (0-indexed)
        for (let i = 0; i < maxEligible && i < totalModels; i++) {
            eligibleIndices.add(i);
        }
    }

    return eligibleIndices;
}

/**
 * Check if a unit has any "all models" options.
 */
export function hasUnitWideOptions(parsedOptions: ParsedOption[]): boolean {
    return parsedOptions.some((opt) => opt.targeting.type === "all-models" && !opt.isNote);
}

/**
 * Get the current unit-wide weapon ID for a given option line.
 * Returns the weapon selected in unitWideSelections, or falls back to the default weapon.
 */
export function getUnitWideWeaponId(unit: ArmyListItem, unitWideOptions: ParsedOption[]): string | null {
    // Check if there's an explicit selection for ANY of the unit-wide options
    // (they all replace the same weapon, so any selection tells us the current weapon)
    if (unit.unitWideSelections) {
        for (const opt of unitWideOptions) {
            if (unit.unitWideSelections[opt.line]) {
                return unit.unitWideSelections[opt.line];
            }
        }
    }

    // Fall back to the default (replaced) weapon from the first option
    const firstOption = unitWideOptions[0];
    if (firstOption && firstOption.replacesWeaponNames.length > 0) {
        const defaultWeapon = findWeaponByName(unit.availableWargear || [], firstOption.replacesWeaponNames[0]);
        return defaultWeapon?.id || null;
    }

    return null;
}

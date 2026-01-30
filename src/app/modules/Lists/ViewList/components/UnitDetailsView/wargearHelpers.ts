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
    addsWeaponNames: string[]; // If multiple, it's a choice or package
    isPackageDeal: boolean; // e.g., "cyclone missile launcher and storm bolter"

    // Constraint info
    constraint: OptionConstraint;
}

export interface OptionTargeting {
    type: "this-model" | "specific-model" | "any-number" | "one-model" | "up-to-n" | "ratio" | "ratio-up-to" | "conditional";
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

    // "For every N models, up to M can..."
    const ratioUpToMatch = normalized.match(/for every (\d+) models.*up to (\d+)/i);
    if (ratioUpToMatch) {
        return {
            type: "ratio-up-to",
            n: parseInt(ratioUpToMatch[1], 10),
            upTo: parseInt(ratioUpToMatch[2], 10),
        };
    }

    // "For every N models, 1 can..."
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
export function parseWeaponsFromDescription(description: string): string[] {
    const weapons: string[] = [];

    // Check for <li> list items
    if (description.includes("<li>")) {
        const liMatches = description.matchAll(/<li>(.+?)<\/li>/gi);
        for (const match of liMatches) {
            const itemText = match[1].replace(/<[^>]*>/g, " ").trim();
            // Extract weapon names (patterns like "1 assault cannon" or "assault cannon")
            const weaponMatch = itemText.match(/^(\d+\s+)?(.+?)(?:\s*\*|\.|$)/i);
            if (weaponMatch && weaponMatch[2]) {
                weapons.push(weaponMatch[2].trim());
            }
        }
    }

    if (weapons.length > 0) return weapons;

    // Fallback: look for "with X" pattern
    const withMatch = description.match(/(?:replaced with|equipped with)\s+(\d+\s+)?([^.<]+)/i);
    if (withMatch && withMatch[2]) {
        weapons.push(withMatch[2].trim());
    }

    return weapons;
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
        const replaceMatch = normalized.match(/(.+?)\s+can be replaced/i);
        if (replaceMatch) {
            let replacedPart = replaceMatch[1];
            // Strip "This model's" etc.
            replacedPart = replacedPart.replace(/^(this\s+)?model\W?s?\s+/i, "");
            replacedPart = replacedPart.replace(/^the\s+[a-z\s]+?'?s?\s+/i, "");
            // Extract weapon name
            const weaponMatch = replacedPart.match(/(\d+\s+)?([a-z][a-z\s-]+)/i);
            if (weaponMatch && weaponMatch[2]) {
                replacesWeaponNames.push(weaponMatch[2].trim());
            }
        }
    }

    // Parse added weapons
    const addsWeaponNames = parseWeaponsFromDescription(desc);
    const packageDeal = isPackageDeal(desc);

    // Calculate constraint
    let maxPerUnit = 1;
    switch (targeting.type) {
        case "this-model":
            maxPerUnit = 1;
            break;
        case "any-number":
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
            // Check if model type matches
            if (!targeting.modelType) return false;
            const targetLower = targeting.modelType.toLowerCase();
            const modelLower = instance.modelType.toLowerCase();
            return modelLower.includes(targetLower) || targetLower.includes(modelLower);

        case "any-number":
            // Any model can take it
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
            // Only the LAST N eligible models (based on ratio) should show the option
            // For example, "1 in 5" on a 10-model unit = show on models 9-10
            const ratioN = targeting.n || 5;
            const maxAllowed = Math.floor(totalModels / ratioN) * (targeting.upTo || 1);

            // Find models that could take this option (have the weapon to replace)
            const eligibleIndices: number[] = [];
            unit.modelInstances?.forEach((m, i) => {
                if (option.action === "replace" && option.replacesWeaponNames.length > 0) {
                    if (hasWeaponByName(m, option.replacesWeaponNames[0], unit.availableWargear || [])) {
                        eligibleIndices.push(i);
                    }
                } else {
                    eligibleIndices.push(i);
                }
            });

            // Show option on the LAST maxAllowed eligible models
            const showOnIndices = eligibleIndices.slice(-maxAllowed);
            return showOnIndices.includes(instanceIndex);
        }

        case "conditional":
            // TODO: Implement conditional checks
            return false;

        default:
            return false;
    }
}

/**
 * Check if a model instance has a weapon by name
 */
function hasWeaponByName(instance: ModelInstance, weaponName: string, availableWargear: Weapon[]): boolean {
    const nameLower = weaponName.toLowerCase();
    return instance.loadout.some((weaponId) => {
        const weapon = availableWargear.find((w) => w.id === weaponId);
        return weapon && weapon.name.toLowerCase().includes(nameLower);
    });
}

/**
 * Count how many times an option has been used across the unit
 */
function countOptionUsage(unit: ArmyListItem, option: ParsedOption): number {
    if (!unit.modelInstances || !unit.availableWargear) return 0;

    // Count models that have one of the "adds" weapons but not the "replaces" weapon
    if (option.action === "replace" && option.addsWeaponNames.length > 0) {
        let count = 0;
        unit.modelInstances.forEach((instance) => {
            const hasAddedWeapon = option.addsWeaponNames.some((name) => hasWeaponByName(instance, name, unit.availableWargear!));
            if (hasAddedWeapon) count++;
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
 * Find a weapon by name in available wargear
 */
export function findWeaponByName(availableWargear: Weapon[], name: string): Weapon | undefined {
    const nameLower = name.toLowerCase();
    return availableWargear.find((w) => {
        const weaponLower = w.name.toLowerCase();
        return weaponLower.includes(nameLower) || nameLower.includes(weaponLower);
    });
}

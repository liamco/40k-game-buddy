/**
 * Loadout Validation Hook
 *
 * Validates model loadouts against pre-computed valid loadout combinations.
 * Uses the new validLoadouts structure with modelType grouping.
 */

import { useMemo } from "react";
import { ValidLoadoutGroup } from "#types/Units.tsx";
import { ModelInstance } from "#types/Lists.tsx";

export interface LoadoutValidationResult {
    isValid: boolean;
    matchedGroup: ValidLoadoutGroup | null;
    closestMatch: string[] | null; // The valid loadout that's closest to current
    missingItems: string[]; // Items in valid loadout but not in current
    extraItems: string[]; // Items in current but not in valid loadout
}

export interface UnitLoadoutValidation {
    modelValidations: Map<string, LoadoutValidationResult>; // instanceId -> validation
    hasAnyInvalid: boolean;
    invalidCount: number;
}

/**
 * Normalize a loadout for comparison (sort items)
 */
function normalizeLoadout(loadout: string[]): string {
    return [...loadout].sort().join("|");
}

/**
 * Check if a loadout matches any valid loadout in a group
 */
function findMatchingLoadout(loadout: string[], validLoadouts: string[][]): string[] | null {
    const normalizedCurrent = normalizeLoadout(loadout);

    for (const valid of validLoadouts) {
        if (normalizeLoadout(valid) === normalizedCurrent) {
            return valid;
        }
    }

    return null;
}

/**
 * Find the closest valid loadout to the current one
 */
function findClosestLoadout(loadout: string[], validLoadouts: string[][]): { loadout: string[]; missing: string[]; extra: string[] } | null {
    if (validLoadouts.length === 0) {
        return null;
    }

    let best: { loadout: string[]; missing: string[]; extra: string[] } | null = null;
    let bestScore = -Infinity;

    const currentSet = new Set(loadout);

    for (const valid of validLoadouts) {
        const validSet = new Set(valid);

        // Calculate overlap
        const overlap = loadout.filter((id) => validSet.has(id)).length;
        const missing = valid.filter((id) => !currentSet.has(id));
        const extra = loadout.filter((id) => !validSet.has(id));

        // Score: overlap - (missing + extra) to prefer loadouts with more overlap and fewer differences
        const score = overlap - (missing.length + extra.length);

        if (score > bestScore) {
            bestScore = score;
            best = { loadout: valid, missing, extra };
        }
    }

    return best;
}

/**
 * Check if a model type matches a valid loadout group's modelType
 */
function modelTypeMatchesGroup(modelType: string, groupModelType: string): boolean {
    // "any" matches everything
    if (groupModelType === "any") return true;

    // "all" is for unit-wide, doesn't apply to individual models
    if (groupModelType === "all") return false;

    const normalizedModel = modelType.toLowerCase().trim();
    const normalizedGroup = groupModelType.toLowerCase().trim();

    // Exact match
    if (normalizedModel === normalizedGroup) return true;

    // Handle plural forms
    if (normalizedModel === normalizedGroup + "s" || normalizedGroup === normalizedModel + "s") {
        return true;
    }

    return false;
}

/**
 * Get valid loadouts for a specific model type.
 * Combines model-specific loadouts with "any" loadouts (which apply to all models).
 * Returns a synthetic group containing all applicable loadouts.
 */
function getValidLoadoutsForModelType(modelType: string, validLoadoutGroups: ValidLoadoutGroup[]): ValidLoadoutGroup | null {
    const combinedItems: string[][] = [];
    let hasSpecificMatch = false;

    // Always include "any" group loadouts (they apply to all models)
    const anyGroup = validLoadoutGroups.find((g) => g.modelType === "any");
    if (anyGroup) {
        combinedItems.push(...anyGroup.items);
    }

    // Also include model-specific loadouts if they exist
    for (const group of validLoadoutGroups) {
        if (group.modelType !== "any" && group.modelType !== "all" && modelTypeMatchesGroup(modelType, group.modelType)) {
            combinedItems.push(...group.items);
            hasSpecificMatch = true;
        }
    }

    if (combinedItems.length === 0) {
        return null;
    }

    // Return a synthetic group with all applicable loadouts
    return {
        modelType: hasSpecificMatch ? modelType : "any",
        items: combinedItems,
    };
}

/**
 * Validate a single model's loadout
 */
function validateModelLoadout(modelType: string, loadout: string[], validLoadoutGroups: ValidLoadoutGroup[]): LoadoutValidationResult {
    // If no valid loadouts defined, consider everything valid
    if (!validLoadoutGroups || validLoadoutGroups.length === 0) {
        return {
            isValid: true,
            matchedGroup: null,
            closestMatch: null,
            missingItems: [],
            extraItems: [],
        };
    }

    const group = getValidLoadoutsForModelType(modelType, validLoadoutGroups);

    if (!group) {
        // No matching group found - consider valid (no restrictions)
        return {
            isValid: true,
            matchedGroup: null,
            closestMatch: null,
            missingItems: [],
            extraItems: [],
        };
    }

    // Check for exact match
    const match = findMatchingLoadout(loadout, group.items);
    if (match) {
        return {
            isValid: true,
            matchedGroup: group,
            closestMatch: match,
            missingItems: [],
            extraItems: [],
        };
    }

    // Find closest match for feedback
    const closest = findClosestLoadout(loadout, group.items);

    return {
        isValid: false,
        matchedGroup: group,
        closestMatch: closest?.loadout || null,
        missingItems: closest?.missing || [],
        extraItems: closest?.extra || [],
    };
}

/**
 * Hook to validate all model loadouts in a unit
 */
export function useLoadoutValidation(modelInstances: ModelInstance[] | undefined, validLoadoutGroups: ValidLoadoutGroup[] | undefined): UnitLoadoutValidation {
    return useMemo(() => {
        const modelValidations = new Map<string, LoadoutValidationResult>();
        let invalidCount = 0;

        if (!modelInstances || !validLoadoutGroups) {
            return {
                modelValidations,
                hasAnyInvalid: false,
                invalidCount: 0,
            };
        }

        for (const instance of modelInstances) {
            const result = validateModelLoadout(instance.modelType, instance.loadout, validLoadoutGroups);

            modelValidations.set(instance.instanceId, result);

            if (!result.isValid) {
                invalidCount++;
            }
        }

        return {
            modelValidations,
            hasAnyInvalid: invalidCount > 0,
            invalidCount,
        };
    }, [modelInstances, validLoadoutGroups]);
}

/**
 * Hook to validate a single model's loadout
 */
export function useModelLoadoutValidation(modelType: string, loadout: string[], validLoadoutGroups: ValidLoadoutGroup[] | undefined): LoadoutValidationResult {
    return useMemo(() => {
        if (!validLoadoutGroups) {
            return {
                isValid: true,
                matchedGroup: null,
                closestMatch: null,
                missingItems: [],
                extraItems: [],
            };
        }

        return validateModelLoadout(modelType, loadout, validLoadoutGroups);
    }, [modelType, loadout, validLoadoutGroups]);
}

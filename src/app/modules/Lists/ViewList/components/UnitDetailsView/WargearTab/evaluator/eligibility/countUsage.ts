/**
 * Usage Counting Utilities
 *
 * Functions for counting how many times options have been used.
 */

import { ModelInstance } from "#types/Lists.tsx";
import { WargearOptionDef } from "../../parser/types";

/**
 * Count how many models have made a selection for each option line.
 */
export function countOptionUsage(modelInstances: ModelInstance[], unitWideSelections: Record<number, string>): Record<number, number> {
    const counts: Record<number, number> = {};

    // Count per-model selections
    for (const instance of modelInstances) {
        const selections = instance.optionSelections || {};
        for (const lineStr of Object.keys(selections)) {
            const line = parseInt(lineStr, 10);
            counts[line] = (counts[line] || 0) + 1;
        }
    }

    // Unit-wide selections count as 1 (they apply to all models)
    // But for usage counting, we treat them specially
    for (const lineStr of Object.keys(unitWideSelections)) {
        const line = parseInt(lineStr, 10);
        // Don't add to count - unit-wide is handled separately
    }

    return counts;
}

/**
 * Count how many models have selected a specific weapon.
 */
export function countWeaponUsage(weaponId: string, modelInstances: ModelInstance[], unitWideSelections: Record<number, string>): number {
    let count = 0;

    // Check if it's a unit-wide selection
    for (const selected of Object.values(unitWideSelections)) {
        if (selected === weaponId) {
            // Unit-wide selection applies to all models
            return modelInstances.length;
        }
    }

    // Count per-model selections
    for (const instance of modelInstances) {
        const selections = instance.optionSelections || {};
        for (const selected of Object.values(selections)) {
            if (selected === weaponId) {
                count++;
            }
        }
    }

    return count;
}

/**
 * Get the current selection for an option on a specific model.
 */
export function getCurrentSelection(optionLine: number, modelInstance: ModelInstance, unitWideSelections: Record<number, string>): string | null {
    // Model-specific selection takes precedence
    const modelSelection = modelInstance.optionSelections?.[optionLine];
    if (modelSelection) {
        return modelSelection;
    }

    // Fall back to unit-wide selection
    const unitWideSelection = unitWideSelections[optionLine];
    if (unitWideSelection) {
        return unitWideSelection;
    }

    return null;
}

/**
 * Calculate how many slots are available for a ratio-based option.
 */
export function calculateRatioSlots(totalModels: number, ratio: number, cap?: number): number {
    const baseSlots = Math.floor(totalModels / ratio);
    if (cap !== undefined) {
        return baseSlots * cap;
    }
    return baseSlots;
}

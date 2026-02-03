/**
 * Constraint Eligibility Checks
 *
 * Checks additional constraints that may block certain weapon choices.
 */

import { WargearOptionDef, ConstraintsDef, WeaponChoice } from "../../parser/types";
import { EligibilityContext } from "../types";

interface ConstraintResult {
    blockedWeapons: Set<string>;
    isDisabled: boolean;
    reason?: string;
}

/**
 * Check constraints and return which weapons are blocked.
 */
export function checkConstraintEligibility(
    option: WargearOptionDef,
    context: EligibilityContext
): ConstraintResult {
    const { constraints } = option;
    const blockedWeapons = new Set<string>();
    let isDisabled = false;
    let reason: string | undefined;

    // Check restricted weapons (weapons that cannot be replaced)
    if (constraints.restrictedWeapons) {
        for (const restricted of constraints.restrictedWeapons) {
            // If model has the restricted weapon via a selection, block it
            const hasRestricted = context.modelInstance.currentLoadout.some((w) =>
                w.toLowerCase().includes(restricted.toLowerCase())
            );
            if (hasRestricted) {
                // This model cannot use this option because it has the restricted weapon
                isDisabled = true;
                reason = `${restricted} cannot be replaced`;
            }
        }
    }

    // Check no-duplicates constraint
    if (constraints.noDuplicates) {
        const selectedWeapons = getSelectedWeaponsForOption(option, context);
        for (const selected of selectedWeapons) {
            blockedWeapons.add(selected);
        }
    }

    // Check must-be-different constraint
    if (constraints.mustBeDifferent) {
        // Block weapons already selected by this model for this option
        const modelSelections = context.modelInstance.currentLoadout;
        for (const weapon of modelSelections) {
            blockedWeapons.add(weapon);
        }
    }

    // Check max selections
    if (constraints.maxSelections) {
        const currentCount = countSelectionsForOption(option, context);
        if (currentCount >= constraints.maxSelections) {
            isDisabled = true;
            reason = `Maximum ${constraints.maxSelections} selections reached`;
        }
    }

    return { blockedWeapons, isDisabled, reason };
}

/**
 * Get all weapons that have been selected for this option across the unit.
 */
function getSelectedWeaponsForOption(
    option: WargearOptionDef,
    context: EligibilityContext
): string[] {
    const weapons: string[] = [];
    const line = option.line;

    // Check unit-wide selections
    if (context.unitWideSelections[line]) {
        weapons.push(context.unitWideSelections[line]);
    }

    // Check per-model selections
    for (const model of context.allModelInstances) {
        if (model.selections[line]) {
            weapons.push(model.selections[line]);
        }
    }

    return weapons;
}

/**
 * Count how many selections have been made for this option.
 */
function countSelectionsForOption(
    option: WargearOptionDef,
    context: EligibilityContext
): number {
    const line = option.line;
    let count = 0;

    // Count unit-wide selection
    if (context.unitWideSelections[line]) {
        count++;
    }

    // Count per-model selections
    for (const model of context.allModelInstances) {
        if (model.selections[line]) {
            count++;
        }
    }

    return count;
}

/**
 * Check if a specific weapon choice is blocked by constraints.
 */
export function isWeaponChoiceBlocked(
    choice: WeaponChoice,
    blockedWeapons: Set<string>
): boolean {
    return choice.weapons.some((ref) => blockedWeapons.has(ref.name));
}

import { Model } from "../types/Models";
import { WargearAbility } from "../types/Units";

export interface ModifiedStat {
    base: number;
    modified: number;
}

export interface ModifiedStats {
    sv?: ModifiedStat;
    invSv?: ModifiedStat;
    w?: ModifiedStat;
    t?: ModifiedStat;
    m?: ModifiedStat;
    ld?: ModifiedStat;
    oc?: ModifiedStat;
}

type StatKey = keyof ModifiedStats;

// Stats where lower is better (saves)
const LOWER_IS_BETTER: StatKey[] = ["sv", "invSv"];

/**
 * Applies wargear ability mechanics to model stats and returns modifications.
 * Only returns stats that have been modified.
 *
 * @param model - The base model stats
 * @param wargearAbilities - Resolved wargear abilities with mechanics
 * @returns Object containing only modified stats with base and modified values
 */
export function applyWargearMechanics(model: Model, wargearAbilities: WargearAbility[]): ModifiedStats {
    const modifications: ModifiedStats = {};

    for (const ability of wargearAbilities) {
        for (const mechanic of ability.mechanics || []) {
            if (!mechanic.attribute) continue;

            const attr = mechanic.attribute as StatKey;

            // Only process stats we track in ModifiedStats
            if (!["sv", "invSv", "w", "t", "m", "ld", "oc"].includes(attr)) {
                continue;
            }

            // Get base value from model (handle invSv which can be null)
            const baseValue = model[attr as keyof Model] as number | null;

            if (mechanic.effect === "staticNumber" && typeof mechanic.value === "number") {
                // staticNumber: Replace stat with fixed value (e.g., Storm Shield: invSv 4+)
                if (LOWER_IS_BETTER.includes(attr)) {
                    // For saves, only apply if it's an improvement (lower) or base doesn't exist
                    const currentModified = modifications[attr]?.modified;
                    const effectiveBase = baseValue ?? 7; // Treat null invSv as 7+ (no save)

                    if (currentModified === undefined || mechanic.value < currentModified) {
                        // Only set if this is better than current modification
                        if (baseValue === null || mechanic.value < baseValue) {
                            modifications[attr] = {
                                base: effectiveBase,
                                modified: mechanic.value,
                            };
                        }
                    }
                } else {
                    // For other stats, just apply the value
                    if (baseValue !== null) {
                        modifications[attr] = {
                            base: baseValue,
                            modified: mechanic.value,
                        };
                    }
                }
            }
            // Note: rollBonus affects dice rolls, not displayed stats - handled by CombatEngine
        }
    }

    return modifications;
}

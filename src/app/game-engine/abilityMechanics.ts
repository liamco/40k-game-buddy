/**
 * Ability Mechanics Extractor
 *
 * Extracts combat mechanics from unit abilities (Core, Faction, Datasheet).
 * Pairs mechanics with their source for proper attribution in the UI.
 */

import type { Ability } from "#types/Units";
import type { Mechanic } from "./types/Mechanic";
import type { EffectSource, EffectSourceType } from "./types/EffectSource";
import { createEffectSource } from "./types/EffectSource";
import { resolveCoreAbilityMechanics } from "./coreAbilities";

/**
 * Indicates whether an ability's mechanics affect attacks made by the unit
 * or attacks received by the unit.
 */
export type AbilityApplicationTarget = "attacksMade" | "attacksAgainst";

/**
 * A mechanic paired with its source ability and application target.
 */
export interface SourcedAbilityMechanic {
    mechanic: Mechanic;
    source: EffectSource;
    appliesTo: AbilityApplicationTarget;
}

/**
 * Extract combat mechanics from a unit's abilities.
 *
 * @param abilities - The unit's abilities array
 * @param unitName - Name of the unit (for source attribution)
 * @param sourceType - Type of effect source (unitAbility or leaderAbility)
 * @returns Array of mechanics with source attribution
 */
export function extractAbilityMechanics(
    abilities: Ability[] | undefined,
    unitName: string,
    sourceType: EffectSourceType = "unitAbility"
): SourcedAbilityMechanic[] {
    if (!abilities || abilities.length === 0) {
        return [];
    }

    const results: SourcedAbilityMechanic[] = [];

    for (const ability of abilities) {
        const mechanics = getMechanicsForAbility(ability);

        for (const mechanic of mechanics) {
            // Determine if this mechanic affects attacks made or received
            const appliesTo = getApplicationTarget(mechanic);

            results.push({
                mechanic,
                source: createEffectSource(sourceType, ability.name, {
                    unitName,
                    abilityType: ability.type,
                }),
                appliesTo,
            });
        }
    }

    return results;
}

/**
 * Get mechanics for a single ability.
 * Core abilities are looked up in the registry; others use embedded mechanics.
 */
function getMechanicsForAbility(ability: Ability): Mechanic[] {
    // Core abilities: look up in registry with parameter resolution
    if (ability.type === "Core") {
        return resolveCoreAbilityMechanics(ability.name, ability.parameter);
    }

    // Datasheet/Faction abilities: use embedded mechanics if present
    if (ability.mechanics && ability.mechanics.length > 0) {
        return ability.mechanics;
    }

    // No mechanics available
    return [];
}

/**
 * Determine if a mechanic affects attacks made by the unit or attacks against it.
 * Reads the `appliesTo` property if present, otherwise defaults to "attacksMade".
 */
function getApplicationTarget(mechanic: Mechanic): AbilityApplicationTarget {
    // Check for explicit appliesTo property (added to core-abilities.json)
    const appliesTo = (mechanic as Mechanic & { appliesTo?: AbilityApplicationTarget }).appliesTo;

    if (appliesTo === "attacksAgainst" || appliesTo === "attacksMade") {
        return appliesTo;
    }

    // Default: abilities affect attacks made by the unit
    return "attacksMade";
}

/**
 * Filter mechanics to only those relevant for combat resolution.
 * Combat-relevant effects: rollBonus, rollPenalty, setsFnp, autoSuccess, reroll
 */
export function filterCombatRelevantMechanics(mechanics: SourcedAbilityMechanic[]): SourcedAbilityMechanic[] {
    const combatEffects = new Set(["rollBonus", "rollPenalty", "setsFnp", "autoSuccess", "reroll"]);

    return mechanics.filter(({ mechanic }) => combatEffects.has(mechanic.effect));
}

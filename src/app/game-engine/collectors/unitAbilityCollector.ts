import type { Mechanic, MechanicSource, UnitContext } from "../types";
import type { Datasheet } from "../../types";
import coreAbilitiesData from "../../data/core-abilities.json";

/**
 * Core ability definition from core-abilities.json
 */
interface CoreAbilityDefinition {
    name: string;
    type: "static" | "parameterized";
    description: string;
    mechanics: Mechanic[];
}

/**
 * The core abilities registry, keyed by uppercase ability name.
 */
const CORE_ABILITIES: Record<string, CoreAbilityDefinition> = coreAbilitiesData.abilities as Record<string, CoreAbilityDefinition>;

/**
 * Ability with mechanics (extending the base Ability type).
 */
interface AbilityWithMechanics {
    id?: string;
    name: string;
    type?: string;
    mechanics?: Mechanic[];
    parameter?: number | string;
}

/**
 * Creates a MechanicSource for an ability.
 */
function createAbilitySource(abilityName: string, unitName?: string): MechanicSource {
    return {
        type: "ability",
        name: abilityName,
        unitName,
    };
}

/**
 * Gets mechanics for a core ability, substituting parameters if needed.
 * Returns null if not a core ability.
 */
function getCoreAbilityMechanics(abilityName: string, parameter?: number | string): Mechanic[] | null {
    const normalizedName = abilityName?.toUpperCase()?.trim();
    const coreAbility = CORE_ABILITIES[normalizedName];

    if (!coreAbility || !coreAbility.mechanics || coreAbility.mechanics.length === 0) {
        return null;
    }

    if (coreAbility.type === "static") {
        // Static abilities use mechanics as-is
        return JSON.parse(JSON.stringify(coreAbility.mechanics));
    }

    if (coreAbility.type === "parameterized") {
        if (parameter === undefined || parameter === null || parameter === "none") {
            // Parameterized ability without a parameter - skip
            return null;
        }

        // Deep clone and substitute {parameter} placeholder
        const mechanics: Mechanic[] = JSON.parse(JSON.stringify(coreAbility.mechanics));
        for (const mechanic of mechanics) {
            if (mechanic.value === "{parameter}") {
                mechanic.value = parameter;
            }
        }
        return mechanics;
    }

    return null;
}

/**
 * Extracts mechanics from a single ability.
 * First checks if it's a core ability (runtime lookup), then falls back to embedded mechanics.
 * Attaches source information to each mechanic.
 */
function extractMechanicsFromAbility(ability: AbilityWithMechanics, unitName: string): Mechanic[] {
    // First, try to get mechanics from core abilities registry
    const coreMechanics = getCoreAbilityMechanics(ability.name, ability.parameter);
    if (coreMechanics && coreMechanics.length > 0) {
        return coreMechanics.map((mechanic) => ({
            ...mechanic,
            source: createAbilitySource(ability.name, unitName),
        }));
    }

    // Fall back to embedded mechanics on the ability itself
    if (!ability.mechanics || ability.mechanics.length === 0) {
        return [];
    }

    return ability.mechanics.map((mechanic) => ({
        ...mechanic,
        source: createAbilitySource(ability.name, unitName),
    }));
}

/**
 * Collects all mechanics from a datasheet's abilities.
 */
function collectFromDatasheet(datasheet: Datasheet): Mechanic[] {
    const mechanics: Mechanic[] = [];

    if (!datasheet.abilities) {
        return mechanics;
    }

    for (const ability of datasheet.abilities as AbilityWithMechanics[]) {
        const abilityMechanics = extractMechanicsFromAbility(ability, datasheet.name);
        mechanics.push(...abilityMechanics);
    }

    return mechanics;
}

/**
 * Checks if a mechanic should apply based on its conditions.
 * This is a simple filter for obvious non-applicable mechanics.
 * Full condition evaluation happens in the evaluator.
 */
function filterLeaderMechanics(mechanics: Mechanic[], hasLeader: boolean): Mechanic[] {
    if (hasLeader) {
        // Include all mechanics when leading
        return mechanics;
    }

    // Filter out mechanics that require leading when not leading
    return mechanics.filter((mechanic) => {
        const requiresLeading = mechanic.conditions?.some((condition) => condition.state === "isLeadingUnit" || condition.state === "leading" || (Array.isArray(condition.state) && (condition.state.includes("isLeadingUnit") || condition.state.includes("leading"))));
        return !requiresLeading;
    });
}

/**
 * Gets all attached leaders from a unit context.
 * Handles both the new attachedLeaders array and deprecated attachedLeader property.
 */
function getAttachedLeaders(unit: UnitContext): Datasheet[] {
    // Prefer new attachedLeaders array
    if (unit.attachedLeaders && unit.attachedLeaders.length > 0) {
        return unit.attachedLeaders;
    }
    // Fall back to deprecated attachedLeader for backwards compatibility
    if (unit.attachedLeader) {
        return [unit.attachedLeader];
    }
    return [];
}

/**
 * Collects all mechanics from a unit, including attached leader abilities.
 * Supports multiple attached leaders.
 *
 * @param unit - The unit context
 * @param role - Whether this unit is the "attacker" or "defender"
 * @returns Array of mechanics from the unit and all attached leaders
 */
export function collectUnitAbilities(unit: UnitContext, role: "attacker" | "defender"): Mechanic[] {
    const mechanics: Mechanic[] = [];

    // Collect from main unit
    const unitMechanics = collectFromDatasheet(unit.datasheet);
    mechanics.push(...unitMechanics);

    // Collect from ALL attached leaders
    const attachedLeaders = getAttachedLeaders(unit);
    for (const leader of attachedLeaders) {
        const leaderMechanics = collectFromDatasheet(leader);

        // Filter leader mechanics based on whether they require leading
        const applicableLeaderMechanics = filterLeaderMechanics(
            leaderMechanics,
            true // Leader is attached, so "leading" conditions can apply
        );

        mechanics.push(...applicableLeaderMechanics);
    }

    return mechanics;
}

/**
 * Collects mechanics specifically for combat (filtering out non-combat abilities).
 * Combat-relevant mechanics typically affect hit/wound/save rolls or add combat keywords.
 */
export function collectCombatAbilities(unit: UnitContext, role: "attacker" | "defender"): Mechanic[] {
    const allMechanics = collectUnitAbilities(unit, role);

    // Filter to only combat-relevant mechanics
    return allMechanics.filter((mechanic) => {
        const effect = mechanic.effect;
        const attribute = mechanic.attribute;

        // Roll modifiers are always combat-relevant
        if (effect === "rollBonus" || effect === "rollPenalty" || effect === "reroll" || effect === "autoSuccess") {
            return true;
        }

        // Abilities that affect combat
        if (effect === "addsAbility") {
            const combatAbilities = ["FEEL NO PAIN", "STEALTH", "LONE OPERATIVE", "PRECISION", "SUSTAINED HITS", "LETHAL HITS", "DEVASTATING WOUNDS"];
            return mechanic.abilities?.some((a) => combatAbilities.some((ca) => a.toUpperCase().includes(ca)));
        }

        // Keywords that affect combat
        if (effect === "addsKeyword") {
            const combatKeywords = ["IGNORES COVER", "OATH OF MOMENT"];
            return mechanic.keywords?.some((k) => combatKeywords.some((ck) => k.toUpperCase().includes(ck)));
        }

        // Static number changes to combat stats
        if (effect === "staticNumber") {
            const combatAttributes = ["t", "sv", "invSv", "w", "s", "ap", "d", "a"];
            return attribute && combatAttributes.includes(attribute);
        }

        return false;
    });
}

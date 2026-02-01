/**
 * Core Abilities Lookup Service
 *
 * Resolves core abilities (STEALTH, FEEL NO PAIN, etc.) to their combat mechanics.
 * Handles parameter substitution for parameterized abilities.
 */

import coreAbilitiesData from "#data/output/core-abilities.json";
import type { Mechanic } from "./types/Mechanic";

interface CoreAbilityDefinition {
    type: "static" | "parameterized";
    mechanics: Mechanic[];
}

interface CoreAbilitiesRegistry {
    abilities: Record<string, CoreAbilityDefinition>;
}

const registry = coreAbilitiesData as CoreAbilitiesRegistry;

/**
 * Look up a core ability by name and resolve parameter placeholders.
 * Returns an array of mechanics with {parameter} replaced by actual values.
 */
export function resolveCoreAbilityMechanics(abilityName: string, parameter?: string | number): Mechanic[] {
    const key = abilityName.toUpperCase().trim();
    const definition = registry.abilities[key];

    if (!definition || !definition.mechanics || definition.mechanics.length === 0) {
        return [];
    }

    // Clone mechanics and resolve {parameter} placeholders
    return definition.mechanics.map((mechanic) => resolveParameterPlaceholder(mechanic, parameter));
}

/**
 * Replace {parameter} placeholder in a mechanic's value field.
 * Returns a new mechanic object (does not mutate original).
 */
function resolveParameterPlaceholder(mechanic: Mechanic, parameter?: string | number): Mechanic {
    const resolved = { ...mechanic };

    // Handle value field
    if (resolved.value === "{parameter}" && parameter !== undefined) {
        resolved.value = parseParameterValue(parameter);
    }

    // Deep clone conditions if present
    if (resolved.conditions) {
        resolved.conditions = resolved.conditions.map((c) => ({ ...c }));
    }

    return resolved;
}

/**
 * Parse a parameter value, converting numeric strings to numbers.
 * Handles formats like "5", "5+", "D3", etc.
 */
function parseParameterValue(parameter: string | number): number | string {
    if (typeof parameter === "number") {
        return parameter;
    }

    // Try to parse as number (handles "5" -> 5)
    const numericMatch = parameter.match(/^(\d+)\+?$/);
    if (numericMatch) {
        return parseInt(numericMatch[1], 10);
    }

    // Return as-is for complex values like "D3", "D6", etc.
    return parameter;
}

/**
 * Check if an ability name corresponds to a known core ability.
 */
export function isCoreAbility(abilityName: string): boolean {
    const key = abilityName.toUpperCase().trim();
    return key in registry.abilities;
}

/**
 * Get the type of a core ability (static or parameterized).
 */
export function getCoreAbilityType(abilityName: string): "static" | "parameterized" | null {
    const key = abilityName.toUpperCase().trim();
    const definition = registry.abilities[key];
    return definition?.type ?? null;
}

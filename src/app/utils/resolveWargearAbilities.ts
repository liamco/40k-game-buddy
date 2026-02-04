import { WargearAbility } from "../types/Units";

/**
 * Resolves wargear ability virtual IDs from model loadouts to full WargearAbility objects.
 *
 * @param loadouts - Array of model loadouts, each containing weapon and ability IDs
 * @param wargearAbilities - Available wargear abilities from the unit's wargear data
 * @returns Array of resolved WargearAbility objects with their mechanics
 */
export function resolveWargearAbilities(
    loadouts: string[][],
    wargearAbilities: WargearAbility[] | undefined
): WargearAbility[] {
    if (!wargearAbilities || wargearAbilities.length === 0) {
        return [];
    }

    // Collect all wargear ability IDs from loadouts
    const abilityIds = new Set<string>();
    for (const loadout of loadouts) {
        for (const id of loadout) {
            if (id.startsWith("wargear-ability:")) {
                abilityIds.add(id);
            }
        }
    }

    if (abilityIds.size === 0) {
        return [];
    }

    // Resolve IDs to actual ability objects
    const resolved: WargearAbility[] = [];
    for (const id of abilityIds) {
        const abilitySlug = id.replace("wargear-ability:", "");
        const ability = wargearAbilities.find(
            (a) =>
                a.id.endsWith(`:${abilitySlug}`) ||
                a.name.toLowerCase().replace(/\s+/g, "-") === abilitySlug
        );
        if (ability) {
            resolved.push(ability);
        }
    }

    return resolved;
}

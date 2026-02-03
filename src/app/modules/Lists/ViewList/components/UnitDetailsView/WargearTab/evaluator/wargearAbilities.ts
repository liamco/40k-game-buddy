/**
 * Wargear Abilities Tracking
 *
 * Determines which wargear abilities are active based on equipped weapons.
 * Wargear abilities have type: "Wargear" in the datasheet.
 */

import { Weapon } from "#types/Weapons.tsx";

interface Ability {
    name: string;
    type: string;
    description?: string;
}

/**
 * Mapping between wargear abilities and their trigger weapons.
 */
export interface WargearAbilityMapping {
    abilityName: string;
    triggerWeaponNames: string[];
}

/**
 * Get all wargear abilities from a datasheet's abilities list.
 */
export function getWargearAbilities(abilities: Ability[]): Ability[] {
    return abilities.filter((a) => a.type === "Wargear");
}

/**
 * Build ability-to-weapon mappings for a unit.
 *
 * Strategy:
 * 1. If precomputedLoadouts has wargearAbilities mapping, use that
 * 2. Otherwise, infer from ability name matching weapon name
 * 3. Common wargear items (icons, instruments, banners) are equipment-based
 */
export function buildAbilityMappings(
    wargearAbilities: Ability[],
    availableWargear: Weapon[],
    precomputedMappings?: WargearAbilityMapping[]
): WargearAbilityMapping[] {
    // Use precomputed if available
    if (precomputedMappings && precomputedMappings.length > 0) {
        return precomputedMappings;
    }

    // Build inferred mappings
    const mappings: WargearAbilityMapping[] = [];
    const weaponNames = availableWargear.map((w) => w.name.toLowerCase());

    for (const ability of wargearAbilities) {
        const abilityNameLower = ability.name.toLowerCase();
        const triggerWeapons: string[] = [];

        // Check for exact match
        const exactMatch = availableWargear.find(
            (w) => w.name.toLowerCase() === abilityNameLower
        );
        if (exactMatch) {
            triggerWeapons.push(exactMatch.name);
        }

        // Check for partial match (e.g., "Storm Shield" ability matches "storm shield" weapon)
        if (triggerWeapons.length === 0) {
            const partialMatches = availableWargear.filter(
                (w) =>
                    w.name.toLowerCase().includes(abilityNameLower) ||
                    abilityNameLower.includes(w.name.toLowerCase())
            );
            for (const match of partialMatches) {
                triggerWeapons.push(match.name);
            }
        }

        // Common wargear patterns
        if (triggerWeapons.length === 0) {
            // Icons, Instruments, Banners, Standards
            if (abilityNameLower.includes("icon")) {
                const iconWeapons = availableWargear.filter((w) =>
                    w.name.toLowerCase().includes("icon")
                );
                triggerWeapons.push(...iconWeapons.map((w) => w.name));
            } else if (abilityNameLower.includes("instrument")) {
                const instrumentWeapons = availableWargear.filter((w) =>
                    w.name.toLowerCase().includes("instrument")
                );
                triggerWeapons.push(...instrumentWeapons.map((w) => w.name));
            } else if (
                abilityNameLower.includes("banner") ||
                abilityNameLower.includes("standard")
            ) {
                const bannerWeapons = availableWargear.filter(
                    (w) =>
                        w.name.toLowerCase().includes("banner") ||
                        w.name.toLowerCase().includes("standard")
                );
                triggerWeapons.push(...bannerWeapons.map((w) => w.name));
            }
        }

        mappings.push({
            abilityName: ability.name,
            triggerWeaponNames: triggerWeapons,
        });
    }

    return mappings;
}

/**
 * Compute which wargear abilities are currently active based on loadout.
 */
export function computeActiveAbilities(
    loadout: string[],
    mappings: WargearAbilityMapping[],
    availableWargear: Weapon[]
): string[] {
    const activeAbilities: string[] = [];
    const loadoutLower = loadout.map((id) => {
        // Convert weapon ID to name for matching
        const weapon = availableWargear.find((w) => w.id === id);
        return weapon ? weapon.name.toLowerCase() : id.toLowerCase();
    });

    for (const mapping of mappings) {
        // Check if any trigger weapon is in the loadout
        const isActive = mapping.triggerWeaponNames.some((triggerName) =>
            loadoutLower.some(
                (loadoutName) =>
                    loadoutName.includes(triggerName.toLowerCase()) ||
                    triggerName.toLowerCase().includes(loadoutName)
            )
        );

        if (isActive) {
            activeAbilities.push(mapping.abilityName);
        }
    }

    return activeAbilities;
}

/**
 * Compute active wargear abilities for an entire unit.
 * Checks all model loadouts to see which abilities are active.
 */
export function computeUnitActiveAbilities(
    modelLoadouts: string[][],
    mappings: WargearAbilityMapping[],
    availableWargear: Weapon[]
): string[] {
    const allActive = new Set<string>();

    for (const loadout of modelLoadouts) {
        const active = computeActiveAbilities(loadout, mappings, availableWargear);
        for (const abilityName of active) {
            allActive.add(abilityName);
        }
    }

    return Array.from(allActive);
}

/**
 * Result of wargear ability evaluation.
 */
export interface WargearAbilityEvaluation {
    /** Ability name */
    name: string;
    /** Ability description */
    description?: string;
    /** Whether the ability is currently active */
    isActive: boolean;
    /** Weapon(s) that would activate this ability */
    triggerWeapons: string[];
}

/**
 * Evaluate all wargear abilities for display.
 */
export function evaluateWargearAbilities(
    abilities: Ability[],
    modelLoadouts: string[][],
    availableWargear: Weapon[],
    precomputedMappings?: WargearAbilityMapping[]
): WargearAbilityEvaluation[] {
    const wargearAbilities = getWargearAbilities(abilities);
    if (wargearAbilities.length === 0) return [];

    const mappings = buildAbilityMappings(
        wargearAbilities,
        availableWargear,
        precomputedMappings
    );

    const activeAbilities = computeUnitActiveAbilities(
        modelLoadouts,
        mappings,
        availableWargear
    );

    return wargearAbilities.map((ability) => {
        const mapping = mappings.find((m) => m.abilityName === ability.name);
        return {
            name: ability.name,
            description: ability.description,
            isActive: activeAbilities.includes(ability.name),
            triggerWeapons: mapping?.triggerWeaponNames || [],
        };
    });
}

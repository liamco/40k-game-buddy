import type { EngagementForce, EngagementForceItem, EngagementForceItemCombatState, EngagementModelInstance, EngagementWargear } from "#types/Engagements";
import type { WeaponProfile, Model, Weapon } from "#types/index";
import type { SpecialEffect, CriticalEffect } from "#game-engine/types/ModifierResult";

/**
 * Wrapper for an EngagementForceItem for UI selection purposes.
 * Since units are now pre-merged at engagement creation, this is a simple wrapper.
 */
export interface UnitSelectItem {
    item: EngagementForceItem;
    displayName: string;
}

/**
 * Selected weapon with reference to parent wargear.
 * Used to correctly identify which wargear entry the profile belongs to,
 * especially in combined units where multiple sources may have the same weapon name.
 */
export interface SelectedWeapon {
    profile: WeaponProfile;
    wargearId: string;
}

/**
 * Build a list of selectable unit items from an engagement force.
 * Units are already merged (leader + bodyguard) at engagement creation time.
 */
export function buildUnitSelectItems(force: EngagementForce | null): UnitSelectItem[] {
    if (!force) return [];

    const items = force.items.map((item) => ({
        item,
        displayName: item.name,
    }));

    // Sort alphabetically by display name
    items.sort((a, b) => a.displayName.localeCompare(b.displayName));

    return items;
}

/**
 * Find a UnitSelectItem by its listItemId
 */
export function findUnitByItemId(items: UnitSelectItem[], listItemId: string | undefined): UnitSelectItem | undefined {
    if (!listItemId) return undefined;
    return items.find((u) => u.item.listItemId === listItemId);
}

/**
 * Get the first weapon profile matching the current game phase.
 */
export function getFirstWeaponProfileForPhase(wargear: EngagementWargear[], phase: "shooting" | "fight"): WeaponProfile | null {
    const weaponType = phase === "shooting" ? "Ranged" : "Melee";
    const weapon = wargear.find((w) => w.type === weaponType);
    if (weapon && weapon.profiles.length > 0) {
        return weapon.profiles[0];
    }
    return null;
}

/**
 * Get the critical effect that applies to a specific attack step.
 *
 * Critical effects by step:
 * - hitRoll: LETHAL HITS, SUSTAINED HITS, or both combined
 * - woundRoll: DEVASTATING WOUNDS
 *
 * @param weaponEffects Array of special effects from the weapon
 * @param step The attack step to check
 */
export function getCriticalEffectForStep(weaponEffects: SpecialEffect[], step: "hitRoll" | "woundRoll"): CriticalEffect | null {
    if (!weaponEffects || weaponEffects.length === 0) return null;

    // Hit roll: LETHAL HITS, SUSTAINED HITS, or both
    if (step === "hitRoll") {
        const lethal = weaponEffects.find((e) => e.type === "lethalHits");
        const sustained = weaponEffects.find((e) => e.type === "sustainedHits");

        // Both present: combine them
        if (lethal && sustained) {
            const value = typeof sustained.value === "number" ? sustained.value : 1;
            return { name: `LETHAL, SUSTAINED HITS ${value}`, type: "lethalHits", value };
        }

        // Only lethal
        if (lethal) {
            return { name: "LETHAL HITS", type: "lethalHits" };
        }

        // Only sustained
        if (sustained) {
            const value = typeof sustained.value === "number" ? sustained.value : 1;
            return { name: `SUSTAINED HITS ${value}`, type: "sustainedHits", value };
        }
    }

    // Wound roll: DEVASTATING WOUNDS
    if (step === "woundRoll") {
        const devastating = weaponEffects.find((e) => e.type === "devastatingWounds");
        if (devastating) {
            return { name: "DEVASTATING WOUNDS", type: "devastatingWounds" };
        }
    }

    return null;
}

/**
 * Get the first weapon (with wargearId) matching the current game phase.
 * Returns a SelectedWeapon with both the profile and wargearId for proper tracking.
 */
export function getFirstWeaponForPhase(wargear: EngagementWargear[], phase: "shooting" | "fight"): SelectedWeapon | null {
    const weaponType = phase === "shooting" ? "Ranged" : "Melee";
    const weapon = wargear.find((w) => w.type === weaponType);
    if (weapon && weapon.profiles.length > 0) {
        return { profile: weapon.profiles[0], wargearId: weapon.id };
    }
    return null;
}

/**
 * Check if a weapon profile has the PRECISION attribute.
 * Accepts either a WeaponProfile directly or a SelectedWeapon.
 */
export function hasPrecisionAttribute(weapon: WeaponProfile | SelectedWeapon | null): boolean {
    if (!weapon) return false;
    const profile = "profile" in weapon ? weapon.profile : weapon;
    if (!profile.attributes) return false;
    return profile.attributes.includes("PRECISION");
}

/**
 * Get the first valid model for the defender, respecting precision rules.
 * For combined units (with sourceUnits), prefer non-leader models unless weapon has PRECISION.
 * Accepts either a WeaponProfile directly or a SelectedWeapon.
 */
export function getFirstValidDefenderModel(unit: EngagementForceItem | undefined, weapon: WeaponProfile | SelectedWeapon | null): Model | null {
    if (!unit || !unit.models || unit.models.length === 0) return null;

    const hasPrecision = hasPrecisionAttribute(weapon);

    // If this is a combined unit (has sourceUnits), handle precision targeting
    if (unit.sourceUnits && unit.sourceUnits.length > 1) {
        // Find first non-leader model (unless weapon has PRECISION)
        if (!hasPrecision) {
            // Find index of first non-leader source unit
            const bodyguardSource = unit.sourceUnits.find((s) => !s.isLeader);
            if (bodyguardSource && unit.modelInstances) {
                // Find first model from bodyguard unit
                const bodyguardModel = unit.modelInstances.find((m) => m.sourceUnitName === bodyguardSource.name);
                if (bodyguardModel) {
                    return unit.models[bodyguardModel.modelTypeLine] || unit.models[0];
                }
            }
        }
    }

    // Default: return first model
    return unit.models[0];
}

/**
 * Filter weapons to only those carried by alive models.
 * Works with the single merged unit structure.
 */
export function filterWargearByAliveModels(unit: EngagementForceItem | undefined): EngagementWargear[] {
    if (!unit) return [];

    const deadModelIds = unit.combatState?.deadModelIds || [];
    const instances = unit.modelInstances || [];

    if (instances.length === 0) {
        // No model instances - return all weapons as fallback
        return unit.wargear || [];
    }

    // Collect weapon IDs from alive models
    const aliveWeaponIds = new Set<string>();
    instances
        .filter((m: EngagementModelInstance) => !deadModelIds.includes(m.instanceId))
        .forEach((m: EngagementModelInstance) => {
            m.loadout.forEach((weaponId) => aliveWeaponIds.add(weaponId));
        });

    // Filter wargear to only weapons carried by alive models
    return (unit.wargear || []).filter((w) => aliveWeaponIds.has(w.id));
}

/**
 * Count alive models that have a specific weapon in their loadout.
 * Used to calculate the number of attacks for a weapon profile.
 *
 * @param unit The unit to check
 * @param selectedWeapon The selected weapon with wargearId for precise matching
 */
export function countAliveModelsWithWeapon(unit: EngagementForceItem | undefined, selectedWeapon: SelectedWeapon | null): number {
    if (!unit || !selectedWeapon) return 0;

    const deadModelIds = unit.combatState?.deadModelIds || [];
    const instances = unit.modelInstances || [];

    if (instances.length === 0) {
        // No model instances - fall back to total alive model count
        return (unit.combatState?.modelCount || 0) - deadModelIds.length;
    }

    // Use the wargearId directly to find matching models
    // This correctly handles combined units where multiple sources have the same weapon name
    return instances.filter((m: EngagementModelInstance) => !deadModelIds.includes(m.instanceId) && m.loadout.includes(selectedWeapon.wargearId)).length;
}

/**
 * Group wargear by source unit name for display purposes.
 */
export function groupWargearBySource(wargear: EngagementWargear[]): Record<string, EngagementWargear[]> {
    const groups: Record<string, EngagementWargear[]> = {};
    wargear.forEach((w) => {
        const source = w.sourceUnitName || "default";
        if (!groups[source]) {
            groups[source] = [];
        }
        groups[source].push(w);
    });
    return groups;
}

/**
 * Check if a weapon has the ASSAULT attribute.
 * Works with Weapon (has profiles array) or WeaponProfile (has attributes directly).
 */
export function hasAssaultAttribute(weapon: Weapon | WeaponProfile | null): boolean {
    if (!weapon) return false;

    // If it's a Weapon with profiles, check first profile
    if ("profiles" in weapon && weapon.profiles) {
        const attributes = weapon.profiles[0]?.attributes;
        if (!attributes) return false;
        return attributes.some((attr) => attr.toUpperCase() === "ASSAULT");
    }

    // If it's a WeaponProfile with attributes directly
    if ("attributes" in weapon && weapon.attributes) {
        return weapon.attributes.some((attr) => attr.toUpperCase() === "ASSAULT");
    }

    return false;
}

/**
 * Result of checking if a weapon can be fired
 */
export interface CanFireResult {
    canFire: boolean;
    reason?: string;
}

/**
 * Determine if a weapon can be fired based on unit's movement behaviour.
 *
 * Rules:
 * - Fall back: Cannot shoot any weapons
 * - Advance: Can only shoot ASSAULT weapons (unless override)
 * - Hold/Move: Can shoot any weapon
 *
 * @param weapon The weapon to check
 * @param movementBehaviour The unit's movement behaviour
 * @param canAdvanceAndShoot Override for detachment rules (e.g., Gladius Task Force)
 */
export function canFireWeapon(weapon: Weapon | WeaponProfile, movementBehaviour: EngagementForceItemCombatState["movementBehaviour"], canAdvanceAndShoot: boolean = false): CanFireResult {
    // Units that fell back cannot shoot at all (core rule)
    if (movementBehaviour === "fallBack") {
        return { canFire: false, reason: "Fell back" };
    }

    // Units that advanced can only fire ASSAULT weapons (unless override)
    if (movementBehaviour === "advance") {
        if (canAdvanceAndShoot) {
            return { canFire: true };
        }
        if (!hasAssaultAttribute(weapon)) {
            return { canFire: false, reason: "Requires ASSAULT" };
        }
    }

    return { canFire: true };
}

/**
 * Get the first valid weapon for the current phase and movement behaviour.
 * Respects ASSAULT restrictions when unit has advanced.
 */
export function getFirstValidWeaponForMovement(wargear: EngagementWargear[] | undefined, phase: "shooting" | "fight", movementBehaviour: EngagementForceItemCombatState["movementBehaviour"], canAdvanceAndShoot: boolean = false): SelectedWeapon | null {
    if (!wargear) return null;

    const weaponType = phase === "shooting" ? "Ranged" : "Melee";

    for (const weapon of wargear) {
        if (weapon.type !== weaponType) continue;

        // For melee, movement restrictions don't apply
        if (phase === "fight") {
            if (weapon.profiles.length > 0) {
                return { profile: weapon.profiles[0], wargearId: weapon.id };
            }
            continue;
        }

        // For shooting, check if weapon can be fired
        const { canFire } = canFireWeapon(weapon, movementBehaviour, canAdvanceAndShoot);
        if (canFire && weapon.profiles.length > 0) {
            return { profile: weapon.profiles[0], wargearId: weapon.id };
        }
    }

    return null;
}

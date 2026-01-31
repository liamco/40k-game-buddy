import type { EngagementForce, EngagementForceItem, EngagementModelInstance, EngagementWargear } from "#types/Engagements";
import type { WeaponProfile, Model } from "#types/index";

/**
 * Wrapper for an EngagementForceItem for UI selection purposes.
 * Since units are now pre-merged at engagement creation, this is a simple wrapper.
 */
export interface UnitSelectItem {
    item: EngagementForceItem;
    displayName: string;
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
 * Check if a weapon profile has the PRECISION attribute.
 */
export function hasPrecisionAttribute(profile: WeaponProfile | null): boolean {
    if (!profile || !profile.attributes) return false;
    return profile.attributes.includes("PRECISION");
}

/**
 * Get the first valid model for the defender, respecting precision rules.
 * For combined units (with sourceUnits), prefer non-leader models unless weapon has PRECISION.
 */
export function getFirstValidDefenderModel(unit: EngagementForceItem | undefined, weaponProfile: WeaponProfile | null): Model | null {
    if (!unit || !unit.models || unit.models.length === 0) return null;

    const hasPrecision = hasPrecisionAttribute(weaponProfile);

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

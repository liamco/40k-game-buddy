import type { EngagementForce, EngagementForceItem } from "#types/Engagements";
import type { WeaponProfile, Model, Weapon } from "#types/index";

/**
 * Represents a combined unit entry (leader(s) + bodyguard or standalone unit)
 */
export interface CombinedUnitItem {
    item: EngagementForceItem;
    displayName: string;
    isCombined: boolean;
    allLeaders: EngagementForceItem[];
    bodyguardUnit?: EngagementForceItem;
}

/**
 * Combines leaders with their attached bodyguard units into single selectable items.
 * Supports multiple leaders attached to a single bodyguard unit.
 * Returns items sorted alphabetically by display name.
 */
export function buildCombinedUnitItems(force: EngagementForce | null): CombinedUnitItem[] {
    if (!force) return [];

    const items = force.items;
    const processed = new Set<string>();
    const combined: CombinedUnitItem[] = [];

    // First pass: Find bodyguard units with leaders attached
    items.forEach((item) => {
        if (processed.has(item.listItemId)) return;

        // Check if this unit has leaders attached (leadBy array)
        if (item.leadBy && item.leadBy.length > 0) {
            // Find all leaders for this unit
            const leaders = item.leadBy.map((ref) => items.find((l) => l.id === ref.id && l.name === ref.name)).filter((l): l is EngagementForceItem => l !== undefined && !processed.has(l.listItemId));

            if (leaders.length > 0) {
                // Sort leaders alphabetically for consistent display
                leaders.sort((a, b) => a.name.localeCompare(b.name));

                // Build display name with all leaders + bodyguard
                const leaderNames = leaders.map((l) => l.name).join(" + ");
                combined.push({
                    item: leaders[0], // Use first leader as the main item for selection
                    displayName: `${leaderNames} + ${item.name}`,
                    isCombined: true,
                    allLeaders: leaders,
                    bodyguardUnit: item,
                });
                leaders.forEach((l) => processed.add(l.listItemId));
                processed.add(item.listItemId);
            }
        }
    });

    // Second pass: Add leaders without matching bodyguard units
    items.forEach((item) => {
        if (processed.has(item.listItemId)) return;

        if (item.leading) {
            // Leader is attached but bodyguard wasn't found in first pass
            combined.push({
                item: item,
                displayName: item.name,
                isCombined: false,
                allLeaders: [],
            });
            processed.add(item.listItemId);
        }
    });

    // Third pass: Add remaining unprocessed items (regular units)
    items.forEach((item) => {
        if (!processed.has(item.listItemId)) {
            combined.push({
                item: item,
                displayName: item.name,
                isCombined: false,
                allLeaders: [],
            });
            processed.add(item.listItemId);
        }
    });

    // Sort all items alphabetically by display name
    combined.sort((a, b) => a.displayName.localeCompare(b.displayName));

    return combined;
}

/**
 * Find a CombinedUnitItem by its listItemId
 */
export function findCombinedUnitByItemId(combinedItems: CombinedUnitItem[], listItemId: string | undefined): CombinedUnitItem | undefined {
    if (!listItemId) return undefined;
    return combinedItems.find((c) => c.item.listItemId === listItemId);
}

/**
 * Calculate the total model count from an EngagementForceItem's composition.
 * For combined units (leader + attached), sums both.
 */
export function calculateModelCount(item: EngagementForceItem, attachedItem?: EngagementForceItem | null): number {
    let total = 0;

    // Use modelInstances if available
    if (item.modelInstances && item.modelInstances.length > 0) {
        total += item.modelInstances.length;
    } else if (item.unitComposition && item.unitComposition.length > 0) {
        // Fall back to minimum values from unitComposition
        total += item.unitComposition.reduce((sum, comp) => sum + (comp.min ?? 1), 0);
    } else {
        // Last resort: count from models array (assumes 1 of each)
        total += item.models?.length ?? 1;
    }

    // Add attached unit's models if present
    if (attachedItem) {
        if (attachedItem.modelInstances && attachedItem.modelInstances.length > 0) {
            total += attachedItem.modelInstances.length;
        } else if (attachedItem.unitComposition && attachedItem.unitComposition.length > 0) {
            total += attachedItem.unitComposition.reduce((sum, comp) => sum + (comp.min ?? 1), 0);
        } else {
            total += attachedItem.models?.length ?? 1;
        }
    }

    return total;
}

/**
 * Get the first weapon profile matching the current game phase.
 */
export function getFirstWeaponProfileForPhase(wargear: Weapon[], phase: "shooting" | "fight"): WeaponProfile | null {
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
 * For combined units, prefer non-leader models unless weapon has PRECISION.
 */
export function getFirstValidDefenderModel(combinedItem: CombinedUnitItem | undefined, weaponProfile: WeaponProfile | null): Model | null {
    if (!combinedItem) return null;

    const unit = combinedItem.item;
    if (!unit.models || unit.models.length === 0) return null;

    const hasPrecision = hasPrecisionAttribute(weaponProfile);

    // If there's a bodyguard unit (combined unit scenario)
    if (combinedItem.isCombined && combinedItem.bodyguardUnit) {
        const bodyguard = combinedItem.bodyguardUnit;
        if (bodyguard.models && bodyguard.models.length > 0) {
            // If weapon has PRECISION, we can target leader models - return first leader model
            if (hasPrecision) {
                return unit.models[0];
            }
            // Otherwise, return first model from bodyguard unit (non-leader)
            return bodyguard.models[0];
        }
    }

    // Single unit - return first model
    return unit.models[0];
}

/**
 * Get combined wargear from all leaders and attached unit for a combined unit.
 * Wargear is pre-resolved on EngagementForceItem, so we just merge the arrays.
 */
export function getCombinedWargear(combinedItem: CombinedUnitItem | undefined): Array<Weapon & { sourceUnit?: string }> {
    if (!combinedItem) return [];

    const allWargear: Array<Weapon & { sourceUnit?: string }> = [];

    if (combinedItem.isCombined && combinedItem.allLeaders.length > 0 && combinedItem.bodyguardUnit) {
        // Add wargear from all leaders
        for (const leader of combinedItem.allLeaders) {
            allWargear.push(...(leader.wargear || []).map((weapon) => ({ ...weapon, sourceUnit: leader.name })));
        }

        // Add wargear from bodyguard unit
        allWargear.push(...(combinedItem.bodyguardUnit.wargear || []).map((weapon) => ({ ...weapon, sourceUnit: combinedItem.bodyguardUnit!.name })));

        return allWargear;
    }

    // Single unit: return wargear directly
    return combinedItem.item.wargear || [];
}

/**
 * Get combined models from all leaders and bodyguard unit for a combined unit
 */
export function getCombinedModels(combinedItem: CombinedUnitItem | undefined): Array<Model & { sourceUnit?: string; isLeader?: boolean }> {
    if (!combinedItem) return [];

    if (combinedItem.isCombined && combinedItem.bodyguardUnit) {
        const allModels: Array<Model & { sourceUnit: string; isLeader: boolean }> = [];

        // Collect models from all leaders
        for (const leader of combinedItem.allLeaders) {
            const leaderModels = (leader.models || []).map((model) => ({
                ...model,
                sourceUnit: leader.name,
                isLeader: true,
            }));
            allModels.push(...leaderModels);
        }

        // Add bodyguard unit models
        const bodyguardModels = (combinedItem.bodyguardUnit.models || []).map((model) => ({
            ...model,
            sourceUnit: combinedItem.bodyguardUnit!.name,
            isLeader: false,
        }));

        return [...allModels, ...bodyguardModels];
    }

    // Return single unit's models
    return combinedItem.item.models || [];
}

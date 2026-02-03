/**
 * Loadout Computation Utilities
 *
 * These functions compute the actual loadout of a model from:
 * - defaultLoadout (base weapons)
 * - selections (user choices by option line)
 * - parsedOptions (what each option does)
 */

import { ModelInstance } from "#types/Lists.tsx";
import { WargearOptionDef } from "../parser/types";
import { Weapon } from "#types/Weapons.tsx";

/**
 * Compute the actual weapon loadout for a single model instance.
 *
 * The algorithm:
 * 1. Start with the model's defaultLoadout
 * 2. For each selection, apply the action (replace or add)
 * 3. Return the final list of weapon IDs
 *
 * @param instance - The model instance with selections
 * @param parsedOptions - Parsed wargear options for the unit
 * @param unitWideSelections - Selections that apply to all models
 * @returns Array of weapon IDs representing the current loadout
 */
export function computeModelLoadout(instance: ModelInstance, parsedOptions: WargearOptionDef[], unitWideSelections: Record<number, string> = {}): string[] {
    // Start with default loadout (copy to avoid mutation)
    let loadout = [...instance.defaultLoadout];

    // Merge unit-wide selections with model-specific selections
    // Model-specific takes precedence
    const allSelections = {
        ...unitWideSelections,
        ...(instance.optionSelections || {}),
    };

    // Apply each selection
    for (const [lineStr, selectedWeaponId] of Object.entries(allSelections)) {
        const line = parseInt(lineStr, 10);
        const option = parsedOptions.find((o) => o.line === line);

        if (!option || !option.wargearParsed) continue;

        if (option.action.type === "replace") {
            // Remove the weapon(s) being replaced
            for (const removeRef of option.action.removes) {
                const removeIdx = loadout.findIndex((weaponId) => weaponIdMatches(weaponId, removeRef.name));
                if (removeIdx >= 0) {
                    loadout.splice(removeIdx, 1);
                }
            }
            // Add the selected weapon
            loadout.push(selectedWeaponId);
        } else if (option.action.type === "add") {
            // Simply add the weapon
            loadout.push(selectedWeaponId);
        }
    }

    return loadout;
}

/**
 * Check if a model's loadout differs from its default.
 */
export function isLoadoutModified(instance: ModelInstance): boolean {
    const selections = instance.optionSelections || {};
    return Object.keys(selections).length > 0;
}

/**
 * Get all unique weapon IDs across all models in a unit.
 */
export function getUnitWeaponIds(modelInstances: ModelInstance[], parsedOptions: WargearOptionDef[], unitWideSelections: Record<number, string> = {}): string[] {
    const allWeaponIds = new Set<string>();

    for (const instance of modelInstances) {
        const loadout = computeModelLoadout(instance, parsedOptions, unitWideSelections);
        for (const weaponId of loadout) {
            allWeaponIds.add(weaponId);
        }
    }

    return Array.from(allWeaponIds);
}

/**
 * Count how many models have a specific weapon equipped.
 */
export function countModelsWithWeapon(modelInstances: ModelInstance[], weaponId: string, parsedOptions: WargearOptionDef[], unitWideSelections: Record<number, string> = {}): number {
    let count = 0;

    for (const instance of modelInstances) {
        const loadout = computeModelLoadout(instance, parsedOptions, unitWideSelections);
        if (loadout.some((id) => weaponIdMatches(id, weaponId))) {
            count++;
        }
    }

    return count;
}

/**
 * Check if a weapon ID matches a weapon name.
 * Handles ID format like "000000472:impaler-cannon" matching "impaler cannon"
 */
function weaponIdMatches(weaponId: string, weaponName: string): boolean {
    // Direct match
    if (weaponId === weaponName) return true;

    // ID might be in format "datasheetId:weapon-slug"
    const idParts = weaponId.split(":");
    if (idParts.length === 2) {
        const slug = idParts[1];
        const normalizedName = weaponName.toLowerCase().replace(/\s+/g, "-");
        if (slug === normalizedName) return true;
    }

    // Try normalizing both
    const normalizedId = weaponId.toLowerCase().replace(/[-_]/g, " ");
    const normalizedName = weaponName.toLowerCase();
    return normalizedId.includes(normalizedName) || normalizedName.includes(normalizedId);
}

/**
 * Find the weapon object from weapons array by ID or name.
 */
export function findWeaponById(weaponIdOrName: string, weapons: Weapon[]): Weapon | undefined {
    // Try exact ID match first
    let weapon = weapons.find((w) => w.id === weaponIdOrName);
    if (weapon) return weapon;

    // Try name match
    weapon = weapons.find((w) => w.name.toLowerCase() === weaponIdOrName.toLowerCase());
    if (weapon) return weapon;

    // Try slug match from ID format
    const idParts = weaponIdOrName.split(":");
    if (idParts.length === 2) {
        const slug = idParts[1];
        weapon = weapons.find((w) => {
            const wSlug = w.name.toLowerCase().replace(/\s+/g, "-");
            return wSlug === slug;
        });
    }

    return weapon;
}

export { weaponIdMatches };

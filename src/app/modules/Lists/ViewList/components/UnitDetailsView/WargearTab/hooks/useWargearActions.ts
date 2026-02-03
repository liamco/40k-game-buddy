/**
 * useWargearActions Hook
 *
 * Provides action dispatchers for wargear selection changes.
 */

import { useCallback } from "react";
import { ArmyList, ArmyListItem, ModelInstance } from "#types/Lists.tsx";
import { Weapon } from "#types/Weapons.tsx";
import { useListManager } from "#modules/Lists/ListManagerContext.tsx";
import { WargearOptionDef } from "../parser";
import { computeModelLoadout } from "../state";

export interface WargearActions {
    /** Select a weapon for a specific model's option */
    selectForModel: (instanceId: string, optionLine: number, weaponId: string, removedWeaponIds: string[]) => void;

    /** Select a weapon for a unit-wide option (applies to all models, supports packages) */
    selectUnitWide: (optionLine: number, newWeaponIds: string[], oldWeaponIds: string[]) => void;

    /** Toggle an addition (equip/unequip) for a specific model */
    toggleAdditionForModel: (instanceId: string, weaponId: string) => void;

    /** Toggle an addition for all models in the unit */
    toggleAdditionUnitWide: (weaponId: string) => void;

    /** Reset a model's loadout to default */
    resetModelLoadout: (instanceId: string) => void;

    /** Reset all models to default loadout */
    resetAllLoadouts: () => void;
}

/**
 * Hook to get wargear action dispatchers.
 */
export function useWargearActions(list: ArmyList, unit: ArmyListItem, parsedOptions: WargearOptionDef[]): WargearActions {
    const { updateModelLoadout, updateAllModelLoadouts, updateUnitWideSelection } = useListManager();

    const selectForModel = useCallback(
        (instanceId: string, optionLine: number, weaponId: string, removedWeaponIds: string[]) => {
            const instance = unit.modelInstances?.find((m) => m.instanceId === instanceId);
            if (!instance) return;

            // Update option selections
            const newOptionSelections = {
                ...(instance.optionSelections || {}),
                [optionLine]: weaponId,
            };

            // Compute new loadout
            // Remove the old weapons and add the new one
            const removedSet = new Set(removedWeaponIds);
            const newLoadout = instance.loadout.filter((id) => !removedSet.has(id));
            newLoadout.push(weaponId);

            updateModelLoadout(list, unit.listItemId, instanceId, newLoadout, newOptionSelections);
        },
        [list, unit.listItemId, unit.modelInstances, updateModelLoadout]
    );

    const selectUnitWide = useCallback(
        (optionLine: number, newWeaponIds: string[], oldWeaponIds: string[]) => {
            updateUnitWideSelection(list, unit.listItemId, optionLine, newWeaponIds, oldWeaponIds);
        },
        [list, unit.listItemId, updateUnitWideSelection]
    );

    const toggleAdditionForModel = useCallback(
        (instanceId: string, weaponId: string) => {
            const instance = unit.modelInstances?.find((m) => m.instanceId === instanceId);
            if (!instance) return;

            const hasWeapon = instance.loadout.includes(weaponId);
            const newLoadout = hasWeapon ? instance.loadout.filter((id) => id !== weaponId) : [...instance.loadout, weaponId];

            updateModelLoadout(list, unit.listItemId, instanceId, newLoadout);
        },
        [list, unit.listItemId, unit.modelInstances, updateModelLoadout]
    );

    const toggleAdditionUnitWide = useCallback(
        (weaponId: string) => {
            if (!unit.modelInstances) return;

            const allModelsHaveWeapon = unit.modelInstances.every((instance) => instance.loadout.includes(weaponId));

            updateAllModelLoadouts(list, unit.listItemId, (instance) => {
                if (allModelsHaveWeapon) {
                    return instance.loadout.filter((id) => id !== weaponId);
                } else {
                    return instance.loadout.includes(weaponId) ? instance.loadout : [...instance.loadout, weaponId];
                }
            });
        },
        [list, unit.listItemId, unit.modelInstances, updateAllModelLoadouts]
    );

    const resetModelLoadout = useCallback(
        (instanceId: string) => {
            const instance = unit.modelInstances?.find((m) => m.instanceId === instanceId);
            if (!instance) return;

            updateModelLoadout(
                list,
                unit.listItemId,
                instanceId,
                [...instance.defaultLoadout],
                {} // Clear all option selections
            );
        },
        [list, unit.listItemId, unit.modelInstances, updateModelLoadout]
    );

    const resetAllLoadouts = useCallback(() => {
        if (!unit.modelInstances) return;

        updateAllModelLoadouts(list, unit.listItemId, (instance) => [...instance.defaultLoadout]);

        // Also clear unit-wide selections
        // This would need a new context method if we want to clear those too
    }, [list, unit.listItemId, unit.modelInstances, updateAllModelLoadouts]);

    return {
        selectForModel,
        selectUnitWide,
        toggleAdditionForModel,
        toggleAdditionUnitWide,
        resetModelLoadout,
        resetAllLoadouts,
    };
}

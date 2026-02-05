import { useMemo, useCallback, Fragment } from "react";

import { ArmyList, ArmyListItem, ModelInstance } from "#types/Lists.tsx";
import { Weapon, WeaponProfile, EligibilityRule } from "#types/Weapons.tsx";
import { WargearAbility, ValidLoadoutGroup } from "#types/Units.tsx";

import { useListManager } from "#modules/Lists/ListManagerContext.tsx";

import { useLoadoutValidation } from "./hooks";
import { WargearRulesPanel, InvalidLoadoutWarning } from "./components";

import WargearProfileCard from "./WargearProfileCard.tsx";
import WargearAbilityCard from "./WargearAbilityCard.tsx";

interface Props {
    unit: ArmyListItem;
    list: ArmyList;
}

// ============================================================================
// TYPES
// ============================================================================

// Represents a selectable item (weapon or wargear ability)
type SelectableItem = { type: "weapon"; weapon: Weapon } | { type: "ability"; ability: WargearAbility };

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Create virtual weapon ID for a wargear ability
 */
function createAbilityVirtualId(abilityName: string): string {
    return `wargear-ability:${abilityName.toLowerCase().replace(/\s+/g, "-")}`;
}

/**
 * Get ID from a SelectableItem
 */
function getItemId(item: SelectableItem): string {
    return item.type === "weapon" ? item.weapon.id : createAbilityVirtualId(item.ability.name);
}

/**
 * Check if a weapon ID represents a wargear ability
 */
function isWargearAbilityId(id: string): boolean {
    return id.startsWith("wargear-ability:");
}

/**
 * Check if a model type matches a target type (handles plurals)
 */
function modelTypeMatches(modelType: string, targetType: string): boolean {
    const normalizedModel = modelType.toLowerCase().trim();
    const normalizedTarget = targetType.toLowerCase().trim();

    if (normalizedModel === normalizedTarget) return true;
    if (normalizedModel === normalizedTarget + "s") return true;
    if (normalizedTarget === normalizedModel + "s") return true;

    return false;
}

/**
 * Check if a model type matches any of the target types in an array
 */
function modelTypeMatchesAny(modelType: string, targetTypes: string[]): boolean {
    return targetTypes.some((target) => modelTypeMatches(modelType, target));
}

// ============================================================================
// ELIGIBILITY CHECKING (for weapon display)
// ============================================================================

/**
 * Context for evaluating eligibility rules
 */
interface EligibilityContext {
    modelType: string;
    modelIndex: number; // Index of this model in the unit
    slotBasedWeaponEligibleModels: Map<string, Set<number>>; // weaponId -> set of eligible model indices (for ratio and count rules)
}

/**
 * Check if a weapon is eligible for display to a model based on eligibility rules.
 * Returns true if any rule matches (OR logic).
 */
function isWeaponEligibleForModel(weapon: Weapon, context: EligibilityContext): boolean {
    const rules = weapon.eligibility;

    // If no eligibility rules, default to showing the weapon
    if (!rules || rules.length === 0) {
        return true;
    }

    // OR logic - any matching rule makes the weapon eligible
    for (const rule of rules) {
        if (checkEligibilityRule(rule, weapon.id, context)) {
            return true;
        }
    }

    return false;
}

/**
 * Check a single eligibility rule
 */
function checkEligibilityRule(rule: EligibilityRule, weaponId: string, context: EligibilityContext): boolean {
    switch (rule.type) {
        case "any":
            return true;

        case "modelType":
            return modelTypeMatchesAny(context.modelType, rule.modelType);

        case "ratio":
        case "count": {
            // Check if this model is in the pre-computed eligible indices for this weapon
            const eligibleIndices = context.slotBasedWeaponEligibleModels.get(weaponId);
            return eligibleIndices?.has(context.modelIndex) ?? false;
        }

        default:
            return true;
    }
}

// ============================================================================
// VALIDATION HELPERS (for loadout validation)
// ============================================================================

/**
 * Get valid loadouts for a specific model type from validLoadouts groups.
 * Combines model-specific loadouts with "any" loadouts (which apply to all models).
 */
function getValidLoadoutsForModelType(modelType: string, validLoadoutGroups: ValidLoadoutGroup[] | undefined): string[][] {
    if (!validLoadoutGroups || validLoadoutGroups.length === 0) {
        return [];
    }

    const result: string[][] = [];

    // Always include "any" group loadouts (they apply to all models)
    const anyGroup = validLoadoutGroups.find((g) => g.modelType === "any");
    if (anyGroup) {
        result.push(...anyGroup.items);
    }

    // Also include model-specific loadouts if they exist
    for (const group of validLoadoutGroups) {
        if (group.modelType !== "any" && group.modelType !== "all" && modelTypeMatches(modelType, group.modelType)) {
            result.push(...group.items);
        }
    }

    return result;
}

/**
 * Check if two weapons are the same base weapon with different profiles/modes
 * e.g., "Plasma pistol - standard" and "Plasma pistol - supercharge"
 */
function areMultiModeWeapons(weapon1: Weapon, weapon2: Weapon): boolean {
    // Same weapon ID means same weapon with multiple profiles
    return weapon1.id === weapon2.id;
}

/**
 * Group weapons by their base ID (for multi-mode weapons like plasma)
 */
function groupWeaponsByBase(weapons: Weapon[]): Map<string, Weapon[]> {
    const groups = new Map<string, Weapon[]>();

    for (const weapon of weapons) {
        const existing = groups.get(weapon.id);
        if (existing) {
            existing.push(weapon);
        } else {
            groups.set(weapon.id, [weapon]);
        }
    }

    return groups;
}

// ============================================================================
// COMPONENT
// ============================================================================

const WargearTab = ({ unit, list }: Props) => {
    const { updateModelLoadout, updateAllModelLoadouts } = useListManager();

    // Get all weapons and abilities for this unit
    const weapons = unit.wargear?.weapons || [];
    const abilities = unit.wargear?.abilities || [];
    const validLoadoutGroups = unit.wargear?.validLoadouts as ValidLoadoutGroup[] | undefined;

    // Validate current loadouts
    const loadoutValidation = useLoadoutValidation(unit.modelInstances, validLoadoutGroups);

    // Count total models in the unit
    const totalModels = unit.modelInstances?.length || 0;

    // Pre-compute which model indices are eligible for each slot-based item (ratio or count)
    // For ratio 1:5, only the first N eligible models (by index) see the weapon
    // For count 2, only the first 2 eligible models see the weapon/ability
    const slotBasedItemEligibleModels = useMemo(() => {
        const assignments = new Map<string, Set<number>>(); // itemId -> set of eligible model indices

        if (!unit.modelInstances) return assignments;

        // Process weapons
        for (const weapon of weapons) {
            // Find ratio or count rule
            const slotRule = weapon.eligibility?.find((r): r is EligibilityRule & { type: "ratio" | "count" } => r.type === "ratio" || r.type === "count");
            if (!slotRule) continue;

            // Calculate number of slots based on rule type
            let slots: number;
            if (slotRule.type === "ratio") {
                slots = Math.floor(totalModels / slotRule.ratio) * slotRule.count;
            } else {
                // count type - fixed number
                slots = slotRule.count;
            }

            const eligibleIndices = new Set<number>();
            let assigned = 0;

            // Find first N eligible models by index
            unit.modelInstances.forEach((instance, idx) => {
                if (assigned >= slots) return;

                // Check model type restriction if specified
                if (slotRule.modelType && !modelTypeMatchesAny(instance.modelType, slotRule.modelType)) {
                    return;
                }

                eligibleIndices.add(idx);
                assigned++;
            });

            assignments.set(weapon.id, eligibleIndices);
        }

        // Process abilities
        for (const ability of abilities) {
            const slotRule = ability.eligibility?.find((r): r is EligibilityRule & { type: "count" } => r.type === "count");
            if (!slotRule) continue;

            const slots = slotRule.count;
            const eligibleIndices = new Set<number>();
            let assigned = 0;

            unit.modelInstances.forEach((instance, idx) => {
                if (assigned >= slots) return;

                // Check model type restriction if specified
                if (slotRule.modelType && !modelTypeMatchesAny(instance.modelType, slotRule.modelType)) {
                    return;
                }

                eligibleIndices.add(idx);
                assigned++;
            });

            assignments.set(createAbilityVirtualId(ability.name), eligibleIndices);
        }

        return assignments;
    }, [weapons, abilities, totalModels, unit.modelInstances]);

    // Build list of all selectable items (weapons + abilities)
    const allSelectableItems = useMemo((): SelectableItem[] => {
        const items: SelectableItem[] = [];

        // Add weapons
        for (const weapon of weapons) {
            items.push({ type: "weapon", weapon });
        }

        // Add wargear abilities
        for (const ability of abilities) {
            items.push({ type: "ability", ability });
        }

        return items;
    }, [weapons, abilities]);

    // Get items available to a specific model instance based on eligibility
    const getItemsForModelInstance = useCallback(
        (instance: ModelInstance, modelIndex: number): SelectableItem[] => {
            const context: EligibilityContext = {
                modelType: instance.modelType,
                modelIndex,
                slotBasedWeaponEligibleModels: slotBasedItemEligibleModels,
            };

            return allSelectableItems.filter((item) => {
                if (item.type === "weapon") {
                    return isWeaponEligibleForModel(item.weapon, context);
                }
                // Check ability eligibility
                const ability = item.ability;
                const rules = ability.eligibility;

                if (!rules || rules.length === 0) {
                    return true; // No rules means available to all
                }

                for (const rule of rules) {
                    if (rule.type === "any") {
                        return true;
                    }
                    if (rule.type === "count") {
                        // Check if this model is in the pre-computed eligible indices
                        const abilityId = createAbilityVirtualId(ability.name);
                        const eligibleIndices = slotBasedItemEligibleModels.get(abilityId);
                        if (eligibleIndices?.has(modelIndex)) {
                            return true;
                        }
                    }
                }
                return false;
            });
        },
        [allSelectableItems, slotBasedItemEligibleModels]
    );

    // Check if model has any options (more than just default weapons)
    const modelHasOptions = useCallback(
        (instance: ModelInstance, modelIndex: number): boolean => {
            const items = getItemsForModelInstance(instance, modelIndex);
            const defaultLoadout = unit.wargear?.defaultLoadout?.parsed || [];

            // Has options if there are items beyond the default loadout
            return items.some((item) => {
                const id = getItemId(item);
                return !defaultLoadout.includes(id);
            });
        },
        [getItemsForModelInstance, unit.wargear?.defaultLoadout?.parsed]
    );

    // Toggle a weapon/ability selection for a model
    const handleToggleItem = useCallback(
        (instance: ModelInstance, itemId: string) => {
            const hasItem = instance.loadout.includes(itemId);
            const newLoadout = hasItem ? instance.loadout.filter((id) => id !== itemId) : [...instance.loadout, itemId];

            updateModelLoadout(list, unit.listItemId, instance.instanceId, newLoadout);
        },
        [list, unit.listItemId, updateModelLoadout]
    );

    // Toggle a weapon/ability for all models (unit-wide)
    const handleToggleItemUnitWide = useCallback(
        (itemId: string) => {
            if (!unit.modelInstances) return;

            const allHaveItem = unit.modelInstances.every((instance) => instance.loadout.includes(itemId));

            updateAllModelLoadouts(list, unit.listItemId, (instance) => {
                if (allHaveItem) {
                    return instance.loadout.filter((id) => id !== itemId);
                } else {
                    return instance.loadout.includes(itemId) ? instance.loadout : [...instance.loadout, itemId];
                }
            });
        },
        [list, unit.listItemId, unit.modelInstances, updateAllModelLoadouts]
    );

    // Group models by type for display
    const modelGroups = useMemo(() => {
        if (!unit.modelInstances) return [];

        const groups: {
            modelType: string;
            instances: ModelInstance[];
            hasOptions: boolean;
            startIndex: number;
            endIndex: number;
        }[] = [];

        let currentGroup: (typeof groups)[0] | null = null;

        unit.modelInstances.forEach((instance, idx) => {
            const hasOpts = modelHasOptions(instance, idx);

            if (hasOpts) {
                // Model has options - show individually
                if (currentGroup) {
                    groups.push(currentGroup);
                    currentGroup = null;
                }
                groups.push({
                    modelType: instance.modelType,
                    instances: [instance],
                    hasOptions: true,
                    startIndex: idx + 1,
                    endIndex: idx + 1,
                });
            } else {
                // Model has no options - try to group with same type
                if (currentGroup && currentGroup.modelType === instance.modelType) {
                    currentGroup.endIndex = idx + 1;
                    currentGroup.instances.push(instance);
                } else {
                    if (currentGroup) groups.push(currentGroup);
                    currentGroup = {
                        modelType: instance.modelType,
                        instances: [instance],
                        hasOptions: false,
                        startIndex: idx + 1,
                        endIndex: idx + 1,
                    };
                }
            }
        });

        if (currentGroup) groups.push(currentGroup);
        return groups;
    }, [unit.modelInstances, modelHasOptions]);

    // Render a weapon profile card
    const renderWeaponProfile = (profile: WeaponProfile, isSelected: boolean, onClick?: () => void, isStacked?: boolean) => <WargearProfileCard key={profile.name} profile={profile} isSelected={isSelected} isDisabled={false} isStacked={isStacked} onCardClick={onClick} />;

    // Render an ability card
    const renderAbility = (ability: WargearAbility, isSelected: boolean, onClick?: () => void, isStacked?: boolean) => <WargearAbilityCard key={ability.id || ability.name} ability={ability} isSelected={isSelected} isDisabled={false} isStacked={isStacked} onCardClick={onClick} />;

    // Render a selectable item
    const renderSelectableItem = (item: SelectableItem, isSelected: boolean, onClick: () => void, isStacked?: boolean) => {
        if (item.type === "weapon") {
            const weapon = item.weapon;
            const profiles = weapon.profiles || [];
            const hasMultipleProfiles = profiles.length > 1;

            return (
                <div key={weapon.id} className="space-y-0">
                    {profiles.map((profile, idx) => (
                        <div key={`${weapon.id}-${idx}`} className="relative">
                            {idx > 0 && <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-fireDragonBright/30" />}
                            {renderWeaponProfile(profile, isSelected, onClick, hasMultipleProfiles)}
                        </div>
                    ))}
                </div>
            );
        } else {
            return renderAbility(item.ability, isSelected, onClick, isStacked);
        }
    };

    // Render weapons list for a model instance
    const renderModelWeapons = (instance: ModelInstance, items: SelectableItem[]) => {
        const rangedItems = items.filter((item) => item.type === "weapon" && item.weapon.type === "Ranged");
        const meleeItems = items.filter(
            (item) => (item.type === "weapon" ? item.weapon.type === "Melee" : true) // Abilities go with melee
        );

        return (
            <div className="space-y-2">
                {rangedItems.length > 0 && (
                    <div className="space-y-2">
                        {rangedItems.map((item) => {
                            const itemId = getItemId(item);
                            const isSelected = instance.loadout.includes(itemId);
                            return renderSelectableItem(item, isSelected, () => handleToggleItem(instance, itemId));
                        })}
                    </div>
                )}

                {meleeItems.length > 0 && (
                    <div className="space-y-2">
                        {meleeItems.map((item) => {
                            const itemId = getItemId(item);
                            const isSelected = instance.loadout.includes(itemId);
                            return renderSelectableItem(item, isSelected, () => handleToggleItem(instance, itemId));
                        })}
                    </div>
                )}
            </div>
        );
    };

    // Render a single model with options
    const renderModelWithOptions = (instance: ModelInstance, displayIndex: number, modelIndex: number) => {
        const items = getItemsForModelInstance(instance, modelIndex);
        const validation = loadoutValidation.modelValidations.get(instance.instanceId);

        return (
            <div key={instance.instanceId} className="mb-6">
                <div className="flex justify-between text-fireDragonBright">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-metadata-l font-medium">{instance.modelType}</span>
                        <span className="text-fireDragonBright/60 text-body-s">#{displayIndex}</span>
                        {validation && !validation.isValid && <span className="text-red-400 text-body-s">(invalid loadout)</span>}
                    </div>

                    <div className="grid grid-cols-6 gap-1 text-center w-[300px] mr-3">
                        <span className="text-profile-attribute">Range</span>
                        <span className="text-profile-attribute">A</span>
                        <span className="text-profile-attribute">BS/WS</span>
                        <span className="text-profile-attribute">S</span>
                        <span className="text-profile-attribute">AP</span>
                        <span className="text-profile-attribute">D</span>
                    </div>
                </div>

                {renderModelWeapons(instance, items)}
            </div>
        );
    };

    // Render a collapsed group (models with no options)
    const renderCollapsedGroup = (group: (typeof modelGroups)[0]) => {
        const label = group.startIndex === group.endIndex ? `#${group.startIndex}` : `#${group.startIndex}-${group.endIndex}`;

        // Get weapons from first instance (all should be same)
        const instance = group.instances[0];
        const modelIndex = group.startIndex - 1; // Convert 1-indexed display to 0-indexed
        const items = getItemsForModelInstance(instance, modelIndex);

        // Filter to only show items in the loadout
        const equippedItems = items.filter((item) => {
            const itemId = getItemId(item);
            return instance.loadout.includes(itemId);
        });

        return (
            <div key={`collapsed-${group.startIndex}-${group.endIndex}`} className="mb-6">
                <div className="flex justify-between text-fireDragonBright">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-metadata-l font-medium">{group.modelType}</span>
                        <span className="text-fireDragonBright/60 text-body-s">{label}</span>
                    </div>

                    <div className="grid grid-cols-6 gap-1 text-center w-[300px] mr-3">
                        <span className="text-profile-attribute">Range</span>
                        <span className="text-profile-attribute">A</span>
                        <span className="text-profile-attribute">BS/WS</span>
                        <span className="text-profile-attribute">S</span>
                        <span className="text-profile-attribute">AP</span>
                        <span className="text-profile-attribute">D</span>
                    </div>
                </div>

                <div className="space-y-2">
                    {equippedItems.map((item) => {
                        const itemId = getItemId(item);
                        return renderSelectableItem(item, true, () => {});
                    })}
                </div>
            </div>
        );
    };

    // Check if there are unit-wide items (items that appear in "all" modelType group)
    const unitWideItems = useMemo((): SelectableItem[] => {
        if (!validLoadoutGroups) return [];

        const allGroup = validLoadoutGroups.find((g) => g.modelType === "all");
        if (!allGroup) return [];

        const allItemIds = new Set<string>();
        for (const loadout of allGroup.items) {
            for (const id of loadout) {
                allItemIds.add(id);
            }
        }

        return allSelectableItems.filter((item) => allItemIds.has(getItemId(item)));
    }, [validLoadoutGroups, allSelectableItems]);

    // Render unit-wide options section
    const renderUnitWideSection = () => {
        if (unitWideItems.length === 0) return null;

        // Check if all models have an item
        const allModelsHaveItem = (itemId: string): boolean => {
            if (!unit.modelInstances) return false;
            return unit.modelInstances.every((instance) => instance.loadout.includes(itemId));
        };

        return (
            <div className="mb-6">
                <div className="flex justify-between text-fireDragonBright">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-metadata-l font-medium">Unit-wide Options</span>
                    </div>

                    <div className="grid grid-cols-6 gap-1 text-center w-[300px] mr-3">
                        <span className="text-profile-attribute">Range</span>
                        <span className="text-profile-attribute">A</span>
                        <span className="text-profile-attribute">BS/WS</span>
                        <span className="text-profile-attribute">S</span>
                        <span className="text-profile-attribute">AP</span>
                        <span className="text-profile-attribute">D</span>
                    </div>
                </div>

                <div className="space-y-2">
                    {unitWideItems.map((item) => {
                        const itemId = getItemId(item);
                        const isSelected = allModelsHaveItem(itemId);
                        return renderSelectableItem(item, isSelected, () => handleToggleItemUnitWide(itemId));
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-3 p-6 gap-4">
            <div className="space-y-6 col-span-2">
                {renderUnitWideSection()}

                {modelGroups.map((group) => {
                    if (!group.hasOptions) {
                        return renderCollapsedGroup(group);
                    }

                    return group.instances.map((instance, idx) => {
                        const displayIndex = group.startIndex + idx;
                        const modelIndex = displayIndex - 1; // Convert 1-indexed display to 0-indexed
                        return renderModelWithOptions(instance, displayIndex, modelIndex);
                    });
                })}
            </div>
            <div className="relative">
                <div className="space-y-6 sticky top-6">
                    {loadoutValidation.hasAnyInvalid && <InvalidLoadoutWarning validation={loadoutValidation} weapons={weapons} abilities={abilities} />}
                    <WargearRulesPanel defaultLoadout={unit.wargear?.defaultLoadout?.raw} options={unit.wargear?.options?.raw} />
                </div>
            </div>
        </div>
    );
};

export default WargearTab;

import { useMemo, useState, useCallback, Fragment } from "react";
import { Plus } from "lucide-react";

import { ArmyList, ArmyListItem, ModelInstance } from "#types/Lists.tsx";
import { Weapon, WeaponProfile } from "#types/Weapons.tsx";

import { useListManager } from "#modules/Lists/ListManagerContext.tsx";

// New pipeline modules
import { useParsedOptions, useCategorizedOptions } from "./hooks";
import { WargearOptionDef } from "./parser";
import { WargearRulesPanel, UnparsedOptionsWarning, WargearAbilitiesPanel } from "./components";
import { evaluateWargearAbilities } from "./evaluator";

import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";

import WargearProfileCard from "./WargearProfileCard.tsx";

import styles from "./WargearProfileCard.module.css";

interface Props {
    unit: ArmyListItem;
    list: ArmyList;
}

// Types for organizing weapons into swap groups and additions
interface SwapOption {
    weapon: Weapon;
    packageWeapons?: Weapon[];
    isDefault: boolean;
    isSelected: boolean;
}

interface WeaponSwapGroup {
    type: "swap";
    replacesWeaponId: string;
    replacesWeaponName: string;
    replacesWeaponIds?: string[];
    optionLine: number;
    options: SwapOption[];
    parsedOption: WargearOptionDef;
}

interface WeaponAddition {
    type: "add";
    weapon: Weapon;
    isSelected: boolean;
    parsedOption: WargearOptionDef;
}

type WeaponGroup = WeaponSwapGroup | WeaponAddition;

// Helper to find weapon by name (case-insensitive)
function findWeaponByName(wargear: Weapon[], name: string): Weapon | undefined {
    const normalizedName = name.toLowerCase().trim();
    return wargear.find((w) => w.name.toLowerCase() === normalizedName);
}

// Ability type from datasheet
interface DatasheetAbility {
    name: string;
    type: string;
    description?: string;
}

// Helper to find a wargear ability by name (case-insensitive)
function findWargearAbilityByName(abilities: DatasheetAbility[] | undefined, name: string): DatasheetAbility | undefined {
    if (!abilities) return undefined;
    const normalizedName = name.toLowerCase().trim();
    return abilities.find((a) => a.type === "Wargear" && a.name.toLowerCase() === normalizedName);
}

// Create a virtual weapon representation for a wargear ability
// This allows wargear abilities to flow through the swap group UI
function createVirtualWeaponForAbility(ability: DatasheetAbility, datasheetId: string): Weapon {
    return {
        id: `wargear-ability:${ability.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: ability.name,
        datasheetId,
        type: "Melee", // Wargear abilities are typically equipment, we use Melee as a fallback
        profiles: [], // No attack profiles - this is defensive/utility equipment
    };
}

// Find weapon OR wargear ability by name, returning a Weapon (or virtual weapon)
function findWeaponOrAbility(wargear: Weapon[], abilities: DatasheetAbility[] | undefined, name: string, datasheetId: string): Weapon | undefined {
    // First try to find a real weapon
    const weapon = findWeaponByName(wargear, name);
    if (weapon) return weapon;

    // If not found, check if it's a wargear ability
    const ability = findWargearAbilityByName(abilities, name);
    if (ability) return createVirtualWeaponForAbility(ability, datasheetId);

    return undefined;
}

// Check if a weapon ID represents a wargear ability (virtual weapon)
function isWargearAbilityId(weaponId: string): boolean {
    return weaponId.startsWith("wargear-ability:");
}

// Extract ability name from a wargear ability weapon ID
function getAbilityNameFromId(weaponId: string): string | undefined {
    if (!isWargearAbilityId(weaponId)) return undefined;
    // Convert "wargear-ability:storm-shield" back to "Storm Shield"
    const slug = weaponId.replace("wargear-ability:", "");
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Helper to check if this is a generic weapon reference
function isGenericWeaponReference(name: string): boolean {
    const normalized = name.toLowerCase().trim();
    return normalized === "ranged weapon" || normalized === "melee weapon" || normalized === "pistol" || normalized === "ranged weapons" || normalized === "melee weapons" || normalized === "pistols";
}

// Helper to check if a model type matches a target type
// This is strict matching - "Terminator" should NOT match "Terminator Sergeant"
// but "Terminator Sergeant" should match "Terminator Sergeant"
function modelTypeMatches(modelType: string, targetType: string): boolean {
    const normalizedModel = modelType.toLowerCase().trim();
    const normalizedTarget = targetType.toLowerCase().trim();

    // Exact match
    if (normalizedModel === normalizedTarget) return true;

    // Handle plural forms (e.g., "Terminators" matching "Terminator")
    if (normalizedModel === normalizedTarget + "s" || normalizedTarget === normalizedModel + "s") return true;

    // For specific-model targeting (like "Terminator Sergeant"),
    // the target should match as a prefix or suffix
    // e.g., "Terminator Sergeant" matches target "Terminator Sergeant"
    // but "Terminator" does NOT match model "Terminator Sergeant"

    // Only allow model to match if target is a complete word match within model
    // "Terminator Sergeant" should match target "Terminator Sergeant"
    // "Terminator" should NOT match model "Terminator Sergeant" (target is less specific than model)

    // If the target is shorter than the model, it means target is less specific
    // We should NOT match in that case for targeting purposes
    // e.g., targeting "Terminator" should not affect "Terminator Sergeant"

    return false;
}

// Helper to resolve generic weapon references to actual weapons
function resolveGenericWeaponReference(genericName: string, loadout: string[], wargear: Weapon[]): Weapon[] {
    const normalized = genericName.toLowerCase().trim();
    const isRanged = normalized.includes("ranged") || normalized.includes("pistol");

    return loadout.map((id) => wargear.find((w) => w.id === id)).filter((w): w is Weapon => w !== undefined && (isRanged ? w.type === "Ranged" : w.type === "Melee"));
}

// Get the current unit-wide weapon ID from unitWideSelections or first model's loadout
function getUnitWideWeaponId(unit: ArmyListItem, unitWideOptions: WargearOptionDef[]): string | null {
    if (unitWideOptions.length === 0) return null;

    // Check unitWideSelections first
    for (const opt of unitWideOptions) {
        const selection = unit.unitWideSelections?.[opt.line];
        if (selection) return selection;
    }

    // Fallback: check first model's loadout for any weapon from unit-wide options
    const firstModel = unit.modelInstances?.[0];
    if (!firstModel) return null;

    for (const opt of unitWideOptions) {
        // Check if any added weapon is in the loadout
        for (const choice of opt.action.adds) {
            for (const weaponRef of choice.weapons) {
                const weapon = findWeaponByName(unit.wargear?.weapons || [], weaponRef.name);
                if (weapon && firstModel.loadout.includes(weapon.id)) {
                    return weapon.id;
                }
            }
        }
        // Check if default (replaced) weapon is in the loadout
        for (const removed of opt.action.removes) {
            const weapon = findWeaponByName(unit.wargear?.weapons || [], removed.name);
            if (weapon && firstModel.loadout.includes(weapon.id)) {
                return weapon.id;
            }
        }
    }

    return null;
}

// Info about a model's options
interface ModelOptionsInfo {
    instance: ModelInstance;
    instanceIndex: number;
    modelType: string;
    currentWeapons: Weapon[];
    availableOptions: {
        parsedOption: WargearOptionDef;
        isEligible: boolean;
        isDisabled: boolean;
        disabledReason?: string;
    }[];
}

// Get option info for each model
function getModelOptionsInfo(unit: ArmyListItem, parsedOptions: WargearOptionDef[]): ModelOptionsInfo[] {
    if (!unit.modelInstances) return [];

    const totalModels = unit.modelInstances.length;

    return unit.modelInstances.map((instance, index) => {
        const currentWeapons = instance.loadout.map((id) => (unit.wargear?.weapons || []).find((w) => w.id === id)).filter((w): w is Weapon => w !== undefined);

        const availableOptions = parsedOptions
            .filter((opt) => opt.wargearParsed)
            .map((opt) => {
                const eligibility = checkOptionEligibility(opt, instance, index, totalModels, unit);
                return {
                    parsedOption: opt,
                    isEligible: eligibility.isEligible,
                    isDisabled: eligibility.isDisabled,
                    disabledReason: eligibility.disabledReason,
                };
            });

        return {
            instance,
            instanceIndex: index,
            modelType: instance.modelType,
            currentWeapons,
            availableOptions,
        };
    });
}

// Check if a model is eligible for an option
function checkOptionEligibility(opt: WargearOptionDef, instance: ModelInstance, instanceIndex: number, totalModels: number, unit: ArmyListItem): { isEligible: boolean; isDisabled: boolean; disabledReason?: string } {
    const { targeting } = opt;

    switch (targeting.type) {
        case "this-model":
        case "all-models":
        case "any-number":
        case "this-unit":
            return { isEligible: true, isDisabled: false };

        case "specific-model":
        case "each-model-type":
            if (targeting.modelType) {
                const matches = modelTypeMatches(instance.modelType, targeting.modelType);
                return { isEligible: matches, isDisabled: false };
            }
            return { isEligible: false, isDisabled: false };

        case "n-model-specific":
            if (targeting.modelType && targeting.count !== undefined) {
                const matches = modelTypeMatches(instance.modelType, targeting.modelType);
                if (!matches) return { isEligible: false, isDisabled: false };

                const usageCount = countOptionUsage(opt.line, unit.modelInstances || [], unit.unitWideSelections || {});
                const isDisabled = usageCount >= targeting.count;
                return {
                    isEligible: true,
                    isDisabled,
                    disabledReason: isDisabled ? `${targeting.count} per unit` : undefined,
                };
            }
            return { isEligible: false, isDisabled: false };

        case "ratio":
        case "ratio-capped": {
            const ratio = targeting.ratio || 5;
            const maxAllowed = Math.floor(totalModels / ratio);
            const cap = targeting.maxPerRatio ?? Infinity;
            const effectiveMax = Math.min(maxAllowed, cap);
            const disabledReason = `${effectiveMax} per ${totalModels} models`;

            if (targeting.modelType) {
                const matchesType = modelTypeMatches(instance.modelType, targeting.modelType);
                if (!matchesType) {
                    return { isEligible: false, isDisabled: false };
                }

                const matchingIndices = (unit.modelInstances || [])
                    .map((m, idx) => ({ modelType: m.modelType, idx }))
                    .filter((m) => modelTypeMatches(m.modelType, targeting.modelType!))
                    .map((m) => m.idx);

                const positionInPool = matchingIndices.indexOf(instanceIndex);
                const isEligible = positionInPool >= 0 && positionInPool < effectiveMax;
                const usageCount = countOptionUsage(opt.line, unit.modelInstances || [], unit.unitWideSelections || {});
                const isDisabled = usageCount >= effectiveMax;

                return { isEligible, isDisabled, disabledReason: isDisabled ? disabledReason : undefined };
            }

            const usageCount = countOptionUsage(opt.line, unit.modelInstances || [], unit.unitWideSelections || {});
            const isEligible = instanceIndex < effectiveMax;
            const isDisabled = usageCount >= effectiveMax;

            return { isEligible, isDisabled, disabledReason: isDisabled ? disabledReason : undefined };
        }

        case "up-to-n": {
            const maxAllowed = targeting.maxTotal || 1;
            const usageCount = countOptionUsage(opt.line, unit.modelInstances || [], unit.unitWideSelections || {});
            const isDisabled = usageCount >= maxAllowed;
            return {
                isEligible: true,
                isDisabled,
                disabledReason: isDisabled ? `${maxAllowed} per unit` : undefined,
            };
        }

        case "conditional":
            if (targeting.condition?.weaponName) {
                const conditionWeapon = findWeaponByName(unit.wargear?.weapons || [], targeting.condition.weaponName);
                const hasWeapon = conditionWeapon && instance.loadout.includes(conditionWeapon.id);
                return { isEligible: !!hasWeapon, isDisabled: false };
            }
            return { isEligible: false, isDisabled: false };

        default:
            return { isEligible: false, isDisabled: false };
    }
}

// Count how many times an option has been used
function countOptionUsage(optionLine: number, modelInstances: ModelInstance[], unitWideSelections: Record<number, string>): number {
    let count = 0;

    // Check unit-wide selections
    if (unitWideSelections[optionLine]) {
        count++;
    }

    // Check per-model selections
    for (const instance of modelInstances) {
        if (instance.optionSelections?.[optionLine]) {
            count++;
        }
    }

    return count;
}

// Get indices of models eligible for ratio options (model-type aware)
function getModelsEligibleForRatioOptions(modelInstances: ModelInstance[] | undefined, ratioOptions: WargearOptionDef[]): Set<number> {
    const eligibleIndices = new Set<number>();

    if (!modelInstances || modelInstances.length === 0) return eligibleIndices;

    const totalModels = modelInstances.length;

    for (const opt of ratioOptions) {
        const ratio = opt.targeting.ratio || 5;
        const maxAllowed = Math.floor(totalModels / ratio);
        const cap = opt.targeting.maxPerRatio ?? Infinity;
        const effectiveMax = Math.min(maxAllowed, cap);

        if (opt.targeting.modelType) {
            const matchingIndices = modelInstances
                .map((m, idx) => ({ modelType: m.modelType, idx }))
                .filter((m) => modelTypeMatches(m.modelType, opt.targeting.modelType!))
                .map((m) => m.idx);

            for (let i = 0; i < effectiveMax && i < matchingIndices.length; i++) {
                eligibleIndices.add(matchingIndices[i]);
            }
        } else {
            for (let i = 0; i < effectiveMax && i < totalModels; i++) {
                eligibleIndices.add(i);
            }
        }
    }

    return eligibleIndices;
}

const WargearTab = ({ unit, list }: Props) => {
    const { updateModelLoadout, updateAllModelLoadouts, updateUnitWideSelection } = useListManager();
    const [expandedModels, setExpandedModels] = useState<Set<number>>(new Set());

    // Check if unit has any wargear options (not just notes)
    const hasOptions = useMemo(() => {
        const rawOptions = unit.wargear?.options?.raw;
        if (!rawOptions || rawOptions.length === 0) return false;
        return rawOptions.some((opt) => opt.button !== "*");
    }, [unit.wargear?.options?.raw]);

    // Parse all options using new pipeline
    // Use pre-parsed options from consolidated wargear.options.parsed (generated at build time)
    const parsedOptions = useParsedOptions(unit.wargear?.options?.parsed);

    // Categorize options into unit-wide, ratio, and other
    const categorizedOptions = useCategorizedOptions(parsedOptions);

    // Get total model count
    const totalModels = unit.modelInstances?.length || 1;

    // Get indices of models eligible for ratio options (model-type aware)
    const ratioEligibleIndices = useMemo(() => getModelsEligibleForRatioOptions(unit.modelInstances, categorizedOptions.ratio), [unit.modelInstances, categorizedOptions.ratio]);

    // Get current unit-wide weapon ID
    const unitWideWeaponId = useMemo(() => {
        if (categorizedOptions.unitWide.length === 0) return null;
        return getUnitWideWeaponId(unit, categorizedOptions.unitWide);
    }, [unit, categorizedOptions.unitWide]);

    // Evaluate wargear abilities (abilities with type: "Wargear")
    const wargearAbilityEvaluations = useMemo(() => {
        if (!unit.abilities || !unit.modelInstances) return [];
        const modelLoadouts = unit.modelInstances.map((m) => m.loadout);
        return evaluateWargearAbilities(unit.abilities, modelLoadouts, unit.wargear?.weapons || []);
    }, [unit.abilities, unit.modelInstances, unit.wargear?.weapons]);

    // Get options info for each model
    const modelOptionsInfos = useMemo(() => getModelOptionsInfo(unit, parsedOptions), [unit, parsedOptions]);

    // Group models for display (collapse models with no options)
    const displayGroups = useMemo(() => {
        if (!unit.modelInstances) return [];

        const groups: { modelType: string; startIndex: number; endIndex: number; instances: ModelInstance[]; hasOptions: boolean; sharedWeapons: Weapon[] }[] = [];

        let currentGroup: (typeof groups)[0] | null = null;

        modelOptionsInfos.forEach((info, idx) => {
            const hasOpts = info.availableOptions.some((o) => o.isEligible);

            if (hasOpts) {
                // Model has options - show individually
                if (currentGroup) {
                    groups.push(currentGroup);
                    currentGroup = null;
                }
                groups.push({
                    modelType: info.modelType,
                    startIndex: idx + 1,
                    endIndex: idx + 1,
                    instances: [info.instance],
                    hasOptions: true,
                    sharedWeapons: info.currentWeapons,
                });
            } else {
                // Model has no options - try to group
                if (currentGroup && currentGroup.modelType === info.modelType && !currentGroup.hasOptions) {
                    currentGroup.endIndex = idx + 1;
                    currentGroup.instances.push(info.instance);
                } else {
                    if (currentGroup) groups.push(currentGroup);
                    currentGroup = {
                        modelType: info.modelType,
                        startIndex: idx + 1,
                        endIndex: idx + 1,
                        instances: [info.instance],
                        hasOptions: false,
                        sharedWeapons: info.currentWeapons,
                    };
                }
            }
        });

        if (currentGroup) groups.push(currentGroup);
        return groups;
    }, [modelOptionsInfos, unit.modelInstances]);

    // Build weapon groups for a specific model instance
    const buildWeaponGroups = useCallback(
        (modelInfo: ModelOptionsInfo): WeaponGroup[] => {
            const groups: WeaponGroup[] = [];
            const processedOptionLines = new Set<number>();
            const swapGroupsByReplacedWeapon = new Map<string, WeaponSwapGroup>();

            // Helper to find weapon or wargear ability
            const findWeaponOrAbilityLocal = (name: string): Weapon | undefined => {
                return findWeaponOrAbility(unit.wargear?.weapons || [], unit.abilities as DatasheetAbility[] | undefined, name, unit.datasheetId);
            };

            const isSelectedForOption = (weaponId: string, optionLine: number, isDefault: boolean): boolean => {
                const selections = modelInfo.instance.optionSelections;
                if (selections && selections[optionLine] !== undefined) {
                    return selections[optionLine] === weaponId;
                }
                return modelInfo.instance.loadout.includes(weaponId);
            };

            const hasWeaponOption = (swapGroup: WeaponSwapGroup, weaponId: string): boolean => {
                return swapGroup.options.some((opt) => opt.weapon.id === weaponId);
            };

            modelInfo.availableOptions.forEach((availOpt) => {
                if (!availOpt.isEligible) return;

                const opt = availOpt.parsedOption;

                if (processedOptionLines.has(opt.line)) return;

                if (opt.action.type === "replace" && opt.action.removes.length > 0) {
                    const replacedWeaponName = opt.action.removes[0].name;

                    if (isGenericWeaponReference(replacedWeaponName)) {
                        const resolvedWeapons = resolveGenericWeaponReference(replacedWeaponName, modelInfo.instance.loadout, unit.wargear?.weapons || []);

                        const replacementWeapons = opt.action.adds
                            .flatMap((choice) => choice.weapons)
                            .map((ref) => findWeaponOrAbilityLocal(ref.name))
                            .filter((w): w is Weapon => w !== undefined);

                        resolvedWeapons.forEach((replacedWeapon) => {
                            const existingGroup = swapGroupsByReplacedWeapon.get(replacedWeapon.id);
                            if (existingGroup) {
                                replacementWeapons.forEach((w) => {
                                    if (!hasWeaponOption(existingGroup, w.id)) {
                                        existingGroup.options.push({
                                            weapon: w,
                                            isDefault: false,
                                            isSelected: isSelectedForOption(w.id, opt.line, false),
                                        });
                                    }
                                });
                            } else {
                                const swapGroup: WeaponSwapGroup = {
                                    type: "swap",
                                    replacesWeaponId: replacedWeapon.id,
                                    replacesWeaponName: replacedWeapon.name,
                                    optionLine: opt.line,
                                    parsedOption: opt,
                                    options: [
                                        {
                                            weapon: replacedWeapon,
                                            isDefault: true,
                                            isSelected: isSelectedForOption(replacedWeapon.id, opt.line, true),
                                        },
                                        ...replacementWeapons.map((w) => ({
                                            weapon: w,
                                            isDefault: false,
                                            isSelected: isSelectedForOption(w.id, opt.line, false),
                                        })),
                                    ],
                                };
                                swapGroupsByReplacedWeapon.set(replacedWeapon.id, swapGroup);
                                groups.push(swapGroup);
                            }
                        });
                    } else {
                        const replacedWeapon = findWeaponByName(unit.wargear?.weapons || [], replacedWeaponName);

                        if (!replacedWeapon) return;

                        // Get single replacement options (use findWeaponOrAbilityLocal to support wargear abilities)
                        const singleWeaponOptions: SwapOption[] = opt.action.adds
                            .filter((choice) => !choice.isPackage)
                            .flatMap((choice) => choice.weapons)
                            .map((ref) => findWeaponOrAbilityLocal(ref.name))
                            .filter((w): w is Weapon => w !== undefined)
                            .map((w) => ({
                                weapon: w,
                                isDefault: false,
                                isSelected: isSelectedForOption(w.id, opt.line, false),
                            }));

                        // Get package options (use findWeaponOrAbilityLocal to support wargear abilities)
                        const packageOptions: SwapOption[] = opt.action.adds
                            .filter((choice) => choice.isPackage)
                            .map((choice) => {
                                const packageWeapons = choice.weapons.map((ref) => findWeaponOrAbilityLocal(ref.name)).filter((w): w is Weapon => w !== undefined);

                                if (packageWeapons.length === 0) return null;

                                return {
                                    weapon: packageWeapons[0],
                                    packageWeapons,
                                    isDefault: false,
                                    isSelected: isSelectedForOption(packageWeapons[0].id, opt.line, false),
                                };
                            })
                            .filter((opt): opt is SwapOption => opt !== null);

                        const allReplacementOptions = [...singleWeaponOptions, ...packageOptions];

                        const existingGroup = swapGroupsByReplacedWeapon.get(replacedWeapon.id);
                        if (existingGroup) {
                            allReplacementOptions.forEach((replOpt) => {
                                if (!hasWeaponOption(existingGroup, replOpt.weapon.id)) {
                                    existingGroup.options.push(replOpt);
                                }
                            });
                        } else {
                            const swapGroup: WeaponSwapGroup = {
                                type: "swap",
                                replacesWeaponId: replacedWeapon.id,
                                replacesWeaponName: replacedWeapon.name,
                                optionLine: opt.line,
                                parsedOption: opt,
                                options: [
                                    {
                                        weapon: replacedWeapon,
                                        isDefault: true,
                                        isSelected: isSelectedForOption(replacedWeapon.id, opt.line, true),
                                    },
                                    ...allReplacementOptions,
                                ],
                            };

                            if (opt.action.removes.length > 1) {
                                const additionalReplacedIds = opt.action.removes
                                    .slice(1)
                                    .map((ref) => findWeaponByName(unit.wargear?.weapons || [], ref.name)?.id)
                                    .filter((id): id is string => id !== undefined);
                                if (additionalReplacedIds.length > 0) {
                                    swapGroup.replacesWeaponIds = [replacedWeapon.id, ...additionalReplacedIds];
                                }
                            }

                            swapGroupsByReplacedWeapon.set(replacedWeapon.id, swapGroup);
                            groups.push(swapGroup);
                        }
                    }

                    processedOptionLines.add(opt.line);
                } else if (opt.action.type === "add") {
                    opt.action.adds
                        .flatMap((choice) => choice.weapons)
                        .forEach((ref) => {
                            const weapon = findWeaponOrAbilityLocal(ref.name);
                            if (!weapon) return;

                            const addition: WeaponAddition = {
                                type: "add",
                                weapon,
                                isSelected: modelInfo.instance.loadout.includes(weapon.id),
                                parsedOption: opt,
                            };
                            groups.push(addition);
                        });
                }
            });

            return groups;
        },
        [unit.wargear?.weapons, unit.abilities, unit.datasheetId]
    );

    // Handle weapon selection in a swap group
    const handleSwapSelection = useCallback(
        (instance: ModelInstance, swapGroup: WeaponSwapGroup, selectedOption: SwapOption) => {
            const newOptionSelections = { ...(instance.optionSelections || {}) };

            // If selecting the default weapon, clear the option selection (don't count as using the option)
            // Otherwise, record the selection
            if (selectedOption.isDefault) {
                delete newOptionSelections[swapGroup.optionLine];
            } else {
                newOptionSelections[swapGroup.optionLine] = selectedOption.weapon.id;
            }

            const allSwapWeaponIds = new Set<string>();
            swapGroup.options.forEach((opt) => {
                allSwapWeaponIds.add(opt.weapon.id);
                if (opt.packageWeapons) {
                    opt.packageWeapons.forEach((w) => allSwapWeaponIds.add(w.id));
                }
            });

            if (swapGroup.replacesWeaponIds) {
                swapGroup.replacesWeaponIds.forEach((id) => allSwapWeaponIds.add(id));
            }

            const newLoadout = instance.loadout.filter((id) => !allSwapWeaponIds.has(id));

            if (selectedOption.packageWeapons) {
                selectedOption.packageWeapons.forEach((w) => newLoadout.push(w.id));
            } else {
                newLoadout.push(selectedOption.weapon.id);
            }

            updateModelLoadout(list, unit.listItemId, instance.instanceId, newLoadout, newOptionSelections);
        },
        [list, unit.listItemId, updateModelLoadout]
    );

    // Handle addition toggle
    const handleAdditionToggle = useCallback(
        (instance: ModelInstance, weapon: Weapon) => {
            const hasWeapon = instance.loadout.includes(weapon.id);
            const newLoadout = hasWeapon ? instance.loadout.filter((id) => id !== weapon.id) : [...instance.loadout, weapon.id];

            updateModelLoadout(list, unit.listItemId, instance.instanceId, newLoadout);
        },
        [list, unit.listItemId, updateModelLoadout]
    );

    // Handle unit-wide selection change (supports packages with multiple weapons)
    const handleUnitWideSelectionChange = useCallback(
        (optionLine: number, newWeaponIds: string[], oldWeaponIds: string[]) => {
            updateUnitWideSelection(list, unit.listItemId, optionLine, newWeaponIds, oldWeaponIds);
        },
        [list, unit.listItemId, updateUnitWideSelection]
    );

    // Build unit-wide swap groups
    const buildUnitWideSwapGroups = useCallback((): WeaponSwapGroup[] => {
        const groups: WeaponSwapGroup[] = [];
        const swapGroupsByReplacedWeapon = new Map<string, WeaponSwapGroup>();

        // Helper to find weapon or wargear ability
        const findWeaponOrAbilityLocal = (name: string): Weapon | undefined => {
            return findWeaponOrAbility(unit.wargear?.weapons || [], unit.abilities as DatasheetAbility[] | undefined, name, unit.datasheetId);
        };

        const currentWeaponId = unitWideWeaponId;

        categorizedOptions.unitWide.forEach((opt) => {
            if (opt.action.type !== "replace" || opt.action.removes.length === 0) return;

            const replacedWeaponName = opt.action.removes[0].name;
            const replacedWeapon = findWeaponByName(unit.wargear?.weapons || [], replacedWeaponName);
            if (!replacedWeapon) return;

            // Build replacement options, respecting isPackage
            const replacementOptions: SwapOption[] = opt.action.adds
                .map((choice) => {
                    const weapons = choice.weapons.map((ref) => findWeaponOrAbilityLocal(ref.name)).filter((w): w is Weapon => w !== undefined);

                    if (weapons.length === 0) return null;

                    if (choice.isPackage && weapons.length > 1) {
                        // Package: multiple weapons selected together
                        return {
                            weapon: weapons[0],
                            packageWeapons: weapons,
                            isDefault: false,
                            isSelected: currentWeaponId === weapons[0].id,
                        };
                    } else {
                        // Single weapon option
                        return {
                            weapon: weapons[0],
                            isDefault: false,
                            isSelected: currentWeaponId === weapons[0].id,
                        };
                    }
                })
                .filter((opt): opt is SwapOption => opt !== null);

            const existingGroup = swapGroupsByReplacedWeapon.get(replacedWeapon.id);
            if (existingGroup) {
                replacementOptions.forEach((replOpt) => {
                    if (!existingGroup.options.some((o) => o.weapon.id === replOpt.weapon.id)) {
                        existingGroup.options.push(replOpt);
                    }
                });
            } else {
                const isDefaultSelected = !currentWeaponId || currentWeaponId === replacedWeapon.id;

                const swapGroup: WeaponSwapGroup = {
                    type: "swap",
                    replacesWeaponId: replacedWeapon.id,
                    replacesWeaponName: replacedWeapon.name,
                    optionLine: opt.line,
                    parsedOption: opt,
                    options: [
                        {
                            weapon: replacedWeapon,
                            isDefault: true,
                            isSelected: isDefaultSelected,
                        },
                        ...replacementOptions,
                    ],
                };
                swapGroupsByReplacedWeapon.set(replacedWeapon.id, swapGroup);
                groups.push(swapGroup);
            }
        });

        return groups;
    }, [categorizedOptions.unitWide, unit.wargear?.weapons, unit.abilities, unit.datasheetId, unitWideWeaponId]);

    // Build unit-wide additions
    const unitWideAdditions = useMemo((): WeaponAddition[] => {
        const additions: WeaponAddition[] = [];

        // Helper to find weapon or wargear ability
        const findWeaponOrAbilityLocal = (name: string): Weapon | undefined => {
            return findWeaponOrAbility(unit.wargear?.weapons || [], unit.abilities as DatasheetAbility[] | undefined, name, unit.datasheetId);
        };

        categorizedOptions.unitWide.forEach((opt) => {
            if (opt.action.type !== "add" || opt.action.adds.length === 0) return;

            opt.action.adds
                .flatMap((choice) => choice.weapons)
                .forEach((ref) => {
                    const weapon = findWeaponOrAbilityLocal(ref.name);
                    if (!weapon) return;

                    const allModelsHaveWeapon = unit.modelInstances ? unit.modelInstances.every((instance) => instance.loadout.includes(weapon.id)) : false;

                    additions.push({
                        type: "add",
                        weapon,
                        isSelected: allModelsHaveWeapon,
                        parsedOption: opt,
                    });
                });
        });

        return additions;
    }, [categorizedOptions.unitWide, unit.wargear?.weapons, unit.abilities, unit.datasheetId, unit.modelInstances]);

    // Handle unit-wide addition toggle
    const handleUnitWideAdditionToggle = useCallback(
        (weapon: Weapon) => {
            if (!unit.modelInstances) return;

            const allModelsHaveWeapon = unit.modelInstances.every((instance) => instance.loadout.includes(weapon.id));

            updateAllModelLoadouts(list, unit.listItemId, (instance) => {
                if (allModelsHaveWeapon) {
                    return instance.loadout.filter((id) => id !== weapon.id);
                } else {
                    return instance.loadout.includes(weapon.id) ? instance.loadout : [...instance.loadout, weapon.id];
                }
            });
        },
        [list, unit, updateAllModelLoadouts]
    );

    // Render helpers
    const renderWeaponProfile = (profile: WeaponProfile, isSelected: boolean, isDisabled: boolean, onClick?: () => void, isStacked?: boolean, disabledLabel?: string) => (
        <WargearProfileCard key={profile.name} profile={profile} isSelected={isSelected} isDisabled={isDisabled} isStacked={isStacked} onCardClick={onClick} disabledLabel={disabledLabel} />
    );

    const renderSwapGroup = (swapGroup: WeaponSwapGroup, instance: ModelInstance, isDisabled: boolean, disabledReason?: string) => {
        const hasNonDefaultSelection = swapGroup.options.some((opt) => opt.isSelected && !opt.isDefault);

        return (
            <div key={`swap-${swapGroup.replacesWeaponId}`} className="space-y-2">
                {swapGroup.options.map((option) => {
                    const isSelected = option.isSelected;
                    const isOptionDisabled = isDisabled && !isSelected && !hasNonDefaultSelection;
                    const clickHandler = isOptionDisabled ? undefined : () => handleSwapSelection(instance, swapGroup, option);

                    // If this is a package option, render all weapons in the package
                    const weaponsToRender = option.packageWeapons && option.packageWeapons.length > 0 ? option.packageWeapons : [option.weapon];

                    return (
                        <div key={option.weapon.id} className={styles.WargearProfileCardSwapItemWrapper}>
                            {weaponsToRender.map((weapon) => weapon.profiles?.map((profile) => renderWeaponProfile(profile, isSelected, isOptionDisabled, clickHandler, weapon.profiles.length > 1 || weaponsToRender.length > 1, isOptionDisabled ? disabledReason : undefined)))}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderAddition = (addition: WeaponAddition, instance: ModelInstance, isDisabled: boolean, disabledReason?: string) => {
        const weapon = addition.weapon;
        const isOptionDisabled = isDisabled && !addition.isSelected;

        return (
            <div key={`add-${weapon.id}`} className="relative pl-8">
                <div
                    className={`absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full transition-colors border ${addition.isSelected ? "bg-fireDragonBright border-fireDragonBright text-deathWorldForest" : "bg-transparent border-fireDragonBright/40 text-fireDragonBright/40"}`}
                >
                    <Plus className={`w-3 h-3 transition-transform duration-[500ms] ${addition.isSelected ? "rotate-[180deg]" : ""}`} />
                </div>

                <div className="space-y-1">{weapon.profiles?.map((profile) => renderWeaponProfile(profile, addition.isSelected, isOptionDisabled, isOptionDisabled ? undefined : () => handleAdditionToggle(instance, weapon), false, isOptionDisabled ? disabledReason : undefined))}</div>
            </div>
        );
    };

    const renderReadOnlyWeapons = (weapons: Weapon[]) => {
        const ranged = weapons.filter((w) => w.type === "Ranged");
        const melee = weapons.filter((w) => w.type === "Melee");

        return (
            <div className="space-y-2">
                {ranged.length > 0 && (
                    <Fragment>
                        {ranged.map((weapon) => (
                            <div key={weapon.id} className="space-y-1">
                                {weapon.profiles?.map((profile, pIdx) => (
                                    <div key={`${weapon.id}-${pIdx}`} className="relative">
                                        {pIdx > 0 && <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-fireDragonBright/30" />}
                                        {renderWeaponProfile(profile, true, false)}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </Fragment>
                )}

                {melee.length > 0 && (
                    <Fragment>
                        {melee.map((weapon) => (
                            <div key={weapon.id} className="space-y-1">
                                {weapon.profiles?.map((profile, pIdx) => (
                                    <div key={`${weapon.id}-${pIdx}`} className="relative">
                                        {pIdx > 0 && <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-fireDragonBright/30" />}
                                        {renderWeaponProfile(profile, true, false)}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </Fragment>
                )}
            </div>
        );
    };

    const renderCollapsedGroup = (group: (typeof displayGroups)[0]) => {
        const label = group.startIndex === group.endIndex ? `#${group.startIndex}` : `#${group.startIndex}-${group.endIndex}`;

        return (
            <div key={`collapsed-${group.startIndex}-${group.endIndex}`}>
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

                {renderReadOnlyWeapons(group.sharedWeapons)}
            </div>
        );
    };

    const renderModelWithOptions = (modelInfo: ModelOptionsInfo, displayIndex: number) => {
        const weaponGroups = buildWeaponGroups(modelInfo);
        const rangedGroups = weaponGroups.filter((g) => {
            if (g.type === "swap") {
                return g.options[0].weapon.type === "Ranged";
            }
            return g.weapon.type === "Ranged";
        });
        const meleeGroups = weaponGroups.filter((g) => {
            if (g.type === "swap") {
                return g.options[0].weapon.type === "Melee";
            }
            return g.weapon.type === "Melee";
        });

        const coveredWeaponIds = new Set<string>();
        weaponGroups.forEach((g) => {
            if (g.type === "swap") {
                g.options.forEach((o) => coveredWeaponIds.add(o.weapon.id));
            } else {
                coveredWeaponIds.add(g.weapon.id);
            }
        });

        const staticWeapons = modelInfo.currentWeapons.filter((w) => !coveredWeaponIds.has(w.id));
        const staticRanged = staticWeapons.filter((w) => w.type === "Ranged");
        const staticMelee = staticWeapons.filter((w) => w.type === "Melee");

        return (
            <div key={modelInfo.instance.instanceId}>
                <div className="flex justify-between text-fireDragonBright">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-metadata-l font-medium">{modelInfo.modelType}</span>
                        <span className="text-fireDragonBright/60 text-body-s">#{displayIndex}</span>
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
                    {(rangedGroups.length > 0 || staticRanged.length > 0) && (
                        <Fragment>
                            {staticRanged.map((weapon) => (
                                <div key={weapon.id} className="space-y-1">
                                    {weapon.profiles?.map((profile, pIdx) => (
                                        <div key={`${weapon.id}-${pIdx}`} className="relative">
                                            {pIdx > 0 && <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-fireDragonBright/30" />}
                                            {renderWeaponProfile(profile, true, false)}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {rangedGroups.map((group) => {
                                if (group.type === "swap") {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderSwapGroup(group, modelInfo.instance, availOpt?.isDisabled ?? false, availOpt?.disabledReason);
                                } else {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderAddition(group, modelInfo.instance, availOpt?.isDisabled ?? false, availOpt?.disabledReason);
                                }
                            })}
                        </Fragment>
                    )}

                    {(meleeGroups.length > 0 || staticMelee.length > 0) && (
                        <Fragment>
                            {staticMelee.map((weapon) => (
                                <div key={weapon.id} className="space-y-1">
                                    {weapon.profiles?.map((profile, pIdx) => (
                                        <div key={`${weapon.id}-${pIdx}`} className="relative">
                                            {pIdx > 0 && <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-fireDragonBright/30" />}
                                            {renderWeaponProfile(profile, true, false)}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {meleeGroups.map((group) => {
                                if (group.type === "swap") {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderSwapGroup(group, modelInfo.instance, availOpt?.isDisabled ?? false, availOpt?.disabledReason);
                                } else {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderAddition(group, modelInfo.instance, availOpt?.isDisabled ?? false, availOpt?.disabledReason);
                                }
                            })}
                        </Fragment>
                    )}
                </div>
            </div>
        );
    };

    const renderUnitWideSwapGroup = (swapGroup: WeaponSwapGroup) => {
        // Find the currently selected option to get all its weapon IDs (for packages)
        const selectedOption = swapGroup.options.find((opt) => opt.isSelected);
        const currentWeaponIds = selectedOption?.packageWeapons?.map((w) => w.id) || (selectedOption ? [selectedOption.weapon.id] : [swapGroup.replacesWeaponId]);

        return (
            <div key={`unit-wide-swap-${swapGroup.replacesWeaponId}`} className="space-y-2">
                {swapGroup.options.map((option) => {
                    const isSelected = option.isSelected;
                    // Pass all weapon IDs for packages
                    const newWeaponIds = option.packageWeapons?.map((w) => w.id) || [option.weapon.id];
                    const clickHandler = () => handleUnitWideSelectionChange(swapGroup.optionLine, newWeaponIds, currentWeaponIds);

                    // If this is a package option, render all weapons in the package
                    const weaponsToRender = option.packageWeapons && option.packageWeapons.length > 0 ? option.packageWeapons : [option.weapon];

                    return (
                        <div key={option.weapon.id} className={styles.WargearProfileCardSwapItemWrapper}>
                            {weaponsToRender.map((weapon) => weapon.profiles?.map((profile) => renderWeaponProfile(profile, isSelected, false, clickHandler, weapon.profiles.length > 1 || weaponsToRender.length > 1)))}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderUnitWideAddition = (addition: WeaponAddition) => {
        const weapon = addition.weapon;

        return (
            <div key={`unit-wide-add-${weapon.id}`} className="relative pl-8">
                <div
                    className={`absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full transition-colors border ${addition.isSelected ? "bg-fireDragonBright border-fireDragonBright text-deathWorldForest" : "bg-transparent border-fireDragonBright/40 text-fireDragonBright/40"}`}
                >
                    <Plus className={`w-3 h-3 transition-transform duration-[500ms] ${addition.isSelected ? "rotate-[180deg]" : ""}`} />
                </div>

                <div className="space-y-1">{weapon.profiles?.map((profile) => renderWeaponProfile(profile, addition.isSelected, false, () => handleUnitWideAdditionToggle(weapon)))}</div>
            </div>
        );
    };

    const renderUnitWideSection = () => {
        const unitWideSwapGroups = buildUnitWideSwapGroups();

        if (unitWideSwapGroups.length === 0 && unitWideAdditions.length === 0) return null;

        return (
            <div className="mb-6">
                <div className="flex justify-between text-fireDragonBright">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-metadata-l font-medium">Unit-wide options</span>
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
                    {unitWideSwapGroups.map((swapGroup) => renderUnitWideSwapGroup(swapGroup))}
                    {unitWideAdditions.map((addition) => renderUnitWideAddition(addition))}
                </div>
            </div>
        );
    };

    // Build ratio weapon groups for per-model sections
    const buildRatioWeaponGroups = useCallback(
        (modelInfo: ModelOptionsInfo): WeaponGroup[] => {
            const groups: WeaponGroup[] = [];
            const processedOptionLines = new Set<number>();
            const swapGroupsByReplacedWeapon = new Map<string, WeaponSwapGroup>();

            // Helper to find weapon or wargear ability
            const findWeaponOrAbilityLocal = (name: string): Weapon | undefined => {
                return findWeaponOrAbility(unit.wargear?.weapons || [], unit.abilities as DatasheetAbility[] | undefined, name, unit.datasheetId);
            };

            const unitWideOptionLines = new Set(categorizedOptions.unitWide.map((opt) => opt.line));

            const isSelectedForOption = (weaponId: string, optionLine: number, isDefault: boolean): boolean => {
                const selections = modelInfo.instance.optionSelections;
                if (selections && selections[optionLine] !== undefined) {
                    return selections[optionLine] === weaponId;
                }
                return modelInfo.instance.loadout.includes(weaponId);
            };

            const hasWeaponOption = (swapGroup: WeaponSwapGroup, weaponId: string): boolean => {
                return swapGroup.options.some((opt) => opt.weapon.id === weaponId);
            };

            modelInfo.availableOptions.forEach((availOpt) => {
                if (!availOpt.isEligible) return;

                const opt = availOpt.parsedOption;

                if (unitWideOptionLines.has(opt.line)) return;

                if (opt.targeting.type !== "ratio" && opt.targeting.type !== "ratio-capped") return;

                if (processedOptionLines.has(opt.line)) return;

                if (opt.action.type === "replace" && opt.action.removes.length > 0) {
                    const replacedWeaponName = opt.action.removes[0].name;

                    // Helper to build replacement options respecting isPackage
                    const buildReplacementOptions = (): SwapOption[] => {
                        return opt.action.adds
                            .map((choice) => {
                                const weapons = choice.weapons.map((ref) => findWeaponOrAbilityLocal(ref.name)).filter((w): w is Weapon => w !== undefined);

                                if (weapons.length === 0) return null;

                                if (choice.isPackage && weapons.length > 1) {
                                    return {
                                        weapon: weapons[0],
                                        packageWeapons: weapons,
                                        isDefault: false,
                                        isSelected: isSelectedForOption(weapons[0].id, opt.line, false),
                                    };
                                } else {
                                    return {
                                        weapon: weapons[0],
                                        isDefault: false,
                                        isSelected: isSelectedForOption(weapons[0].id, opt.line, false),
                                    };
                                }
                            })
                            .filter((o): o is SwapOption => o !== null);
                    };

                    if (isGenericWeaponReference(replacedWeaponName)) {
                        const currentUnitWideWeapon = unitWideWeaponId ? (unit.wargear?.weapons || []).find((w) => w.id === unitWideWeaponId) : null;

                        if (!currentUnitWideWeapon) return;

                        const replacementOptions = buildReplacementOptions();

                        const existingGroup = swapGroupsByReplacedWeapon.get(currentUnitWideWeapon.id);
                        if (existingGroup) {
                            replacementOptions.forEach((replOpt) => {
                                if (!hasWeaponOption(existingGroup, replOpt.weapon.id)) {
                                    existingGroup.options.push(replOpt);
                                }
                            });
                        } else {
                            const swapGroup: WeaponSwapGroup = {
                                type: "swap",
                                replacesWeaponId: currentUnitWideWeapon.id,
                                replacesWeaponName: currentUnitWideWeapon.name,
                                optionLine: opt.line,
                                parsedOption: opt,
                                options: [
                                    {
                                        weapon: currentUnitWideWeapon,
                                        isDefault: true,
                                        isSelected: isSelectedForOption(currentUnitWideWeapon.id, opt.line, true),
                                    },
                                    ...replacementOptions,
                                ],
                            };
                            swapGroupsByReplacedWeapon.set(currentUnitWideWeapon.id, swapGroup);
                            groups.push(swapGroup);
                        }
                    } else {
                        const replacedWeapon = findWeaponByName(unit.wargear?.weapons || [], replacedWeaponName);
                        if (!replacedWeapon) return;

                        const replacementOptions = buildReplacementOptions();

                        const existingGroup = swapGroupsByReplacedWeapon.get(replacedWeapon.id);
                        if (existingGroup) {
                            replacementOptions.forEach((replOpt) => {
                                if (!hasWeaponOption(existingGroup, replOpt.weapon.id)) {
                                    existingGroup.options.push(replOpt);
                                }
                            });
                        } else {
                            const swapGroup: WeaponSwapGroup = {
                                type: "swap",
                                replacesWeaponId: replacedWeapon.id,
                                replacesWeaponName: replacedWeapon.name,
                                optionLine: opt.line,
                                parsedOption: opt,
                                options: [
                                    {
                                        weapon: replacedWeapon,
                                        isDefault: true,
                                        isSelected: isSelectedForOption(replacedWeapon.id, opt.line, true),
                                    },
                                    ...replacementOptions,
                                ],
                            };
                            swapGroupsByReplacedWeapon.set(replacedWeapon.id, swapGroup);
                            groups.push(swapGroup);
                        }
                    }

                    processedOptionLines.add(opt.line);
                }
            });

            return groups;
        },
        [unit.wargear?.weapons, unit.abilities, unit.datasheetId, categorizedOptions.unitWide, unitWideWeaponId]
    );

    const renderModelWithRatioOptions = (modelInfo: ModelOptionsInfo, displayIndex: number) => {
        const weaponGroups = buildRatioWeaponGroups(modelInfo);
        const rangedGroups = weaponGroups.filter((g) => {
            if (g.type === "swap") {
                return g.options[0].weapon.type === "Ranged";
            }
            return g.weapon.type === "Ranged";
        });
        const meleeGroups = weaponGroups.filter((g) => {
            if (g.type === "swap") {
                return g.options[0].weapon.type === "Melee";
            }
            return g.weapon.type === "Melee";
        });

        const coveredWeaponIds = new Set<string>();
        weaponGroups.forEach((g) => {
            if (g.type === "swap") {
                g.options.forEach((o) => coveredWeaponIds.add(o.weapon.id));
            } else {
                coveredWeaponIds.add(g.weapon.id);
            }
        });

        categorizedOptions.unitWide.forEach((opt) => {
            opt.action.removes.forEach((ref) => {
                const weapon = findWeaponByName(unit.wargear?.weapons || [], ref.name);
                if (weapon) coveredWeaponIds.add(weapon.id);
            });
            opt.action.adds
                .flatMap((choice) => choice.weapons)
                .forEach((ref) => {
                    const weapon = findWeaponByName(unit.wargear?.weapons || [], ref.name);
                    if (weapon) coveredWeaponIds.add(weapon.id);
                });
        });

        const staticWeapons = modelInfo.currentWeapons.filter((w) => !coveredWeaponIds.has(w.id));
        const staticRanged = staticWeapons.filter((w) => w.type === "Ranged");
        const staticMelee = staticWeapons.filter((w) => w.type === "Melee");

        return (
            <div key={modelInfo.instance.instanceId}>
                <div className="flex justify-between text-fireDragonBright">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-metadata-l font-medium">{modelInfo.modelType}</span>
                        <span className="text-fireDragonBright/60 text-body-s">#{displayIndex}</span>
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
                    {(rangedGroups.length > 0 || staticRanged.length > 0) && (
                        <Fragment>
                            {staticRanged.map((weapon) => (
                                <div key={weapon.id} className="space-y-1">
                                    {weapon.profiles?.map((profile, pIdx) => (
                                        <div key={`${weapon.id}-${pIdx}`} className="relative">
                                            {pIdx > 0 && <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-fireDragonBright/30" />}
                                            {renderWeaponProfile(profile, true, false)}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {rangedGroups.map((group) => {
                                if (group.type === "swap") {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderSwapGroup(group, modelInfo.instance, availOpt?.isDisabled ?? false, availOpt?.disabledReason);
                                } else {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderAddition(group, modelInfo.instance, availOpt?.isDisabled ?? false, availOpt?.disabledReason);
                                }
                            })}
                        </Fragment>
                    )}

                    {(meleeGroups.length > 0 || staticMelee.length > 0) && (
                        <Fragment>
                            {staticMelee.map((weapon) => (
                                <div key={weapon.id} className="space-y-1">
                                    {weapon.profiles?.map((profile, pIdx) => (
                                        <div key={`${weapon.id}-${pIdx}`} className="relative">
                                            {pIdx > 0 && <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-fireDragonBright/30" />}
                                            {renderWeaponProfile(profile, true, false)}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {meleeGroups.map((group) => {
                                if (group.type === "swap") {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderSwapGroup(group, modelInfo.instance, availOpt?.isDisabled ?? false, availOpt?.disabledReason);
                                } else {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderAddition(group, modelInfo.instance, availOpt?.isDisabled ?? false, availOpt?.disabledReason);
                                }
                            })}
                        </Fragment>
                    )}
                </div>
            </div>
        );
    };

    const renderPerModelSections = () => {
        if (ratioEligibleIndices.size === 0 || categorizedOptions.ratio.length === 0) {
            return null;
        }

        const eligibleModels = modelOptionsInfos.filter((info) => ratioEligibleIndices.has(info.instanceIndex));

        return eligibleModels.map((modelInfo) => renderModelWithRatioOptions(modelInfo, modelInfo.instanceIndex + 1));
    };

    const renderCollapsedModelsSection = () => {
        const nonEligibleModels = modelOptionsInfos.filter((info) => !ratioEligibleIndices.has(info.instanceIndex));

        if (nonEligibleModels.length === 0) return null;

        const groups: { modelType: string; startIndex: number; endIndex: number; weapons: Weapon[] }[] = [];
        let currentGroup: (typeof groups)[0] | null = null;

        nonEligibleModels.forEach((info) => {
            if (currentGroup && currentGroup.modelType === info.modelType) {
                currentGroup.endIndex = info.instanceIndex + 1;
            } else {
                if (currentGroup) groups.push(currentGroup);
                currentGroup = {
                    modelType: info.modelType,
                    startIndex: info.instanceIndex + 1,
                    endIndex: info.instanceIndex + 1,
                    weapons: info.currentWeapons,
                };
            }
        });
        if (currentGroup) groups.push(currentGroup);

        return groups.map((group) => {
            const label = group.startIndex === group.endIndex ? `#${group.startIndex}` : `#${group.startIndex}-${group.endIndex}`;

            return (
                <div key={`collapsed-${group.startIndex}-${group.endIndex}`}>
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

                    {renderReadOnlyWeapons(group.weapons)}
                </div>
            );
        });
    };

    const hasUnitWideOptions = categorizedOptions.unitWide.length > 0;
    const hasUnparsedOptions = categorizedOptions.unparsed.length > 0;

    return (
        <div className="grid grid-cols-3 p-6 gap-4">
            <div className="space-y-6 col-span-2">
                {hasUnparsedOptions && <UnparsedOptionsWarning unparsedOptions={categorizedOptions.unparsed} />}

                {hasUnitWideOptions ? (
                    <Fragment>
                        {renderUnitWideSection()}
                        {renderPerModelSections()}
                        {renderCollapsedModelsSection()}
                    </Fragment>
                ) : (
                    displayGroups.map((group) => {
                        if (!group.hasOptions) {
                            return renderCollapsedGroup(group);
                        }

                        const modelInfosInGroup = modelOptionsInfos.filter((info) => group.instances.some((inst) => inst.instanceId === info.instance.instanceId));

                        return modelInfosInGroup.map((modelInfo) => renderModelWithOptions(modelInfo, modelInfo.instanceIndex + 1));
                    })
                )}
            </div>
            <div className="space-y-6 pt-7">
                <WargearRulesPanel options={unit.wargear?.options?.raw} />
                {wargearAbilityEvaluations.length > 0 && <WargearAbilitiesPanel evaluations={wargearAbilityEvaluations} />}
            </div>
        </div>
    );
};

export default WargearTab;

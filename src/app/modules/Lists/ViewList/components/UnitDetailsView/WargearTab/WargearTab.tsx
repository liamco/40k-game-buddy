import { useMemo, useState, useCallback, Fragment } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";

import { ArmyList, ArmyListItem, ModelInstance } from "#types/Lists.tsx";
import { Weapon, WeaponProfile } from "#types/Weapons.tsx";

import { useListManager } from "#modules/Lists/ListManagerContext.tsx";

import { parseOption, getModelOptionsInfo, groupModelsForDisplay, ParsedOption, ModelOptionsInfo, AvailableOption, findWeaponByName, isGenericWeaponReference, resolveGenericWeaponReference, categorizeOptions, getModelsEligibleForRatioOptions, getUnitWideWeaponId } from "./wargearHelpers";
import { getConstraintsForDatasheet, evaluateConstraints, isWeaponBlocked, ConstraintEvaluation } from "./wargearConstraints";

import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";

import WargearProfileCard from "./WargearProfileCard.tsx";
import ComplexWargearSelector from "./ComplexWargearSelector.tsx";

import styles from "./WargearProfileCard.module.css";

interface Props {
    unit: ArmyListItem;
    list: ArmyList;
}

// Types for organizing weapons into swap groups and additions
interface SwapOption {
    weapon: Weapon; // Primary weapon to display
    packageWeapons?: Weapon[]; // Additional weapons in a package deal (e.g., [cyclone, storm bolter])
    isDefault: boolean;
    isSelected: boolean;
}

interface WeaponSwapGroup {
    type: "swap";
    replacesWeaponId: string;
    replacesWeaponName: string;
    replacesWeaponIds?: string[]; // Multiple weapon IDs when replacing "X and Y"
    optionLine: number; // The option line this swap group came from
    options: SwapOption[];
    parsedOption: ParsedOption;
}

interface WeaponAddition {
    type: "add";
    weapon: Weapon;
    isSelected: boolean;
    parsedOption: ParsedOption;
}

type WeaponGroup = WeaponSwapGroup | WeaponAddition;

const WargearTab = ({ unit, list }: Props) => {
    const { updateModelLoadout, updateAllModelLoadouts, updateUnitWideSelection } = useListManager();
    const [expandedModels, setExpandedModels] = useState<Set<number>>(new Set());

    // Check if unit has precomputed loadouts (complex wargear)
    const precomputedLoadouts = useMemo(() => {
        // Access precomputedLoadouts from the unit's datasheet data
        // This is passed through from the datasheet when the unit was added to the list
        return (unit as any).precomputedLoadouts || null;
    }, [unit]);

    // If unit has precomputed loadouts, use the complex selector
    if (precomputedLoadouts && precomputedLoadouts.length > 0) {
        return <ComplexWargearSelector unit={unit} list={list} loadouts={precomputedLoadouts} />;
    }

    // Check if unit has any wargear options (not just notes)
    const hasOptions = useMemo(() => {
        if (!unit.options || unit.options.length === 0) return false;
        return unit.options.some((opt) => opt.button !== "*");
    }, [unit.options]);

    // Parse all options
    const parsedOptions = useMemo(() => {
        if (!unit.options) return [];
        const totalModels = unit.modelInstances?.length || 1;
        return unit.options.map((opt) => parseOption(opt, totalModels));
    }, [unit.options, unit.modelInstances]);

    // Categorize options into unit-wide, ratio, and other
    const categorizedOptions = useMemo(() => categorizeOptions(parsedOptions), [parsedOptions]);

    // Get total model count
    const totalModels = unit.modelInstances?.length || 1;

    // Get indices of models eligible for ratio options
    const ratioEligibleIndices = useMemo(() => getModelsEligibleForRatioOptions(totalModels, categorizedOptions.ratioOptions), [totalModels, categorizedOptions.ratioOptions]);

    // Get current unit-wide weapon ID (checks all unit-wide options for a selection)
    const unitWideWeaponId = useMemo(() => {
        if (categorizedOptions.unitWideOptions.length === 0) return null;
        return getUnitWideWeaponId(unit, categorizedOptions.unitWideOptions);
    }, [unit, categorizedOptions.unitWideOptions]);

    // Get options info for each model
    const modelOptionsInfos = useMemo(() => getModelOptionsInfo(unit, parsedOptions), [unit, parsedOptions]);

    // Group models for display (collapse models with no options)
    const displayGroups = useMemo(() => groupModelsForDisplay(modelOptionsInfos, unit), [modelOptionsInfos, unit]);

    // Evaluate wargear constraints for single-model units (or per-model for multi-model)
    const getConstraintEvaluation = useCallback(
        (instance: ModelInstance): ConstraintEvaluation | null => {
            const constraints = getConstraintsForDatasheet(unit.id);
            if (!constraints || constraints.length === 0) return null;

            return evaluateConstraints(constraints, instance.loadout, unit.availableWargear || [], parsedOptions);
        },
        [unit.id, unit.availableWargear, parsedOptions]
    );

    // Build weapon groups for a specific model instance
    const buildWeaponGroups = useCallback(
        (modelInfo: ModelOptionsInfo): WeaponGroup[] => {
            const groups: WeaponGroup[] = [];
            const processedOptionLines = new Set<number>();
            // Track swap groups by replaced weapon ID for consolidation
            const swapGroupsByReplacedWeapon = new Map<string, WeaponSwapGroup>();

            // Helper to determine if a weapon is selected for a specific option line
            // Uses optionSelections if available, otherwise falls back to checking loadout
            const isSelectedForOption = (weaponId: string, optionLine: number, isDefault: boolean): boolean => {
                const selections = modelInfo.instance.optionSelections;
                if (selections && selections[optionLine] !== undefined) {
                    // We have explicit tracking for this option
                    return selections[optionLine] === weaponId;
                }
                // Fallback: check if the weapon is in the loadout
                // This handles both default weapons and non-default weapons that were
                // selected before optionSelections tracking was added
                return modelInfo.instance.loadout.includes(weaponId);
            };

            // Helper to check if a weapon option already exists in a swap group
            const hasWeaponOption = (swapGroup: WeaponSwapGroup, weaponId: string): boolean => {
                return swapGroup.options.some((opt) => opt.weapon.id === weaponId);
            };

            // Process each available option for this model
            modelInfo.availableOptions.forEach((availOpt) => {
                if (!availOpt.isEligible) return;

                const opt = availOpt.parsedOption;

                // Skip if we've already processed this option line
                if (processedOptionLines.has(opt.line)) return;

                if (opt.action === "replace" && opt.replacesWeaponNames.length > 0) {
                    const replacedWeaponName = opt.replacesWeaponNames[0];

                    // Check if this is a generic reference like "ranged weapon" or "melee weapon"
                    if (isGenericWeaponReference(replacedWeaponName)) {
                        // Resolve to actual weapons of that type from the model's loadout
                        const resolvedWeapons = resolveGenericWeaponReference(replacedWeaponName, modelInfo.instance.loadout, unit.availableWargear || []);

                        // Get all replacement options from this option line
                        const replacementWeapons = opt.addsWeaponNames.map((name) => findWeaponByName(unit.availableWargear || [], name)).filter((w): w is Weapon => w !== undefined);

                        // Create swap groups for each resolved weapon
                        resolvedWeapons.forEach((replacedWeapon) => {
                            // Check if we already have a swap group for this replaced weapon
                            const existingGroup = swapGroupsByReplacedWeapon.get(replacedWeapon.id);
                            if (existingGroup) {
                                // Add new replacement options to existing group (avoid duplicates)
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
                                // Create new swap group for this replaced weapon
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
                        // Specific weapon name
                        const replacedWeapon = findWeaponByName(unit.availableWargear || [], replacedWeaponName);

                        if (!replacedWeapon) return;

                        // Get all single replacement options from this option line
                        const replacementWeapons = opt.addsWeaponNames.map((name) => findWeaponByName(unit.availableWargear || [], name)).filter((w): w is Weapon => w !== undefined);

                        // Build swap options for single weapons
                        const singleWeaponOptions: SwapOption[] = replacementWeapons.map((w) => ({
                            weapon: w,
                            isDefault: false,
                            isSelected: isSelectedForOption(w.id, opt.line, false),
                        }));

                        // Build swap options for package deals (e.g., cyclone missile launcher + storm bolter)
                        const packageOptions: SwapOption[] = (opt.addsWeaponPackages || [])
                            .map((packageNames) => {
                                const packageWeapons = packageNames.map((name) => findWeaponByName(unit.availableWargear || [], name)).filter((w): w is Weapon => w !== undefined);

                                if (packageWeapons.length === 0) return null;

                                // Primary weapon is the first one (e.g., cyclone missile launcher)
                                const primaryWeapon = packageWeapons[0];

                                return {
                                    weapon: primaryWeapon,
                                    packageWeapons: packageWeapons,
                                    isDefault: false,
                                    isSelected: isSelectedForOption(primaryWeapon.id, opt.line, false),
                                };
                            })
                            .filter((opt): opt is SwapOption => opt !== null);

                        const allReplacementOptions = [...singleWeaponOptions, ...packageOptions];

                        // Check if we already have a swap group for this replaced weapon
                        const existingGroup = swapGroupsByReplacedWeapon.get(replacedWeapon.id);
                        if (existingGroup) {
                            // Add new replacement options to existing group (avoid duplicates)
                            allReplacementOptions.forEach((replOpt) => {
                                if (!hasWeaponOption(existingGroup, replOpt.weapon.id)) {
                                    existingGroup.options.push(replOpt);
                                }
                            });
                        } else {
                            // Create new swap group for this replaced weapon
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

                            // If there are multiple replaced weapons (e.g., "bolt rifle and close combat weapon"),
                            // track all their IDs so we can remove all of them when a replacement is selected
                            if (opt.replacesWeaponNames.length > 1) {
                                const additionalReplacedIds = opt.replacesWeaponNames
                                    .slice(1) // Skip first one, it's already the primary
                                    .map((name) => findWeaponByName(unit.availableWargear || [], name)?.id)
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
                } else if (opt.action === "add") {
                    // Addition options
                    opt.addsWeaponNames.forEach((name) => {
                        const weapon = findWeaponByName(unit.availableWargear || [], name);
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
        [unit.availableWargear]
    );

    // Handle weapon selection in a swap group
    const handleSwapSelection = useCallback(
        (instance: ModelInstance, swapGroup: WeaponSwapGroup, selectedOption: SwapOption) => {
            // Update the option selections tracking
            const newOptionSelections = { ...(instance.optionSelections || {}) };
            newOptionSelections[swapGroup.optionLine] = selectedOption.weapon.id;

            // Collect all weapon IDs that could be in this swap group (including package weapons)
            const allSwapWeaponIds = new Set<string>();
            swapGroup.options.forEach((opt) => {
                allSwapWeaponIds.add(opt.weapon.id);
                if (opt.packageWeapons) {
                    opt.packageWeapons.forEach((w) => allSwapWeaponIds.add(w.id));
                }
            });

            // Also include any additional replaced weapons (for "X and Y can be replaced" cases)
            if (swapGroup.replacesWeaponIds) {
                swapGroup.replacesWeaponIds.forEach((id) => allSwapWeaponIds.add(id));
            }

            // Remove all swap group weapons from loadout
            const newLoadout = instance.loadout.filter((id) => !allSwapWeaponIds.has(id));

            // Add the selected weapon(s) - either single weapon or package
            if (selectedOption.packageWeapons) {
                // Package deal: add all weapons in the package
                selectedOption.packageWeapons.forEach((w) => newLoadout.push(w.id));
            } else {
                // Single weapon
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

    // Handle unit-wide selection change
    const handleUnitWideSelectionChange = useCallback(
        (optionLine: number, newWeaponId: string, oldWeaponId: string) => {
            updateUnitWideSelection(list, unit.listItemId, optionLine, newWeaponId, oldWeaponId);
        },
        [list, unit.listItemId, updateUnitWideSelection]
    );

    // Build unit-wide swap groups from all-models options
    const buildUnitWideSwapGroups = useCallback((): WeaponSwapGroup[] => {
        const groups: WeaponSwapGroup[] = [];
        const swapGroupsByReplacedWeapon = new Map<string, WeaponSwapGroup>();

        // Use the consolidated unitWideWeaponId to determine selection state
        const currentWeaponId = unitWideWeaponId;

        categorizedOptions.unitWideOptions.forEach((opt) => {
            if (opt.action !== "replace" || opt.replacesWeaponNames.length === 0) return;

            const replacedWeaponName = opt.replacesWeaponNames[0];
            const replacedWeapon = findWeaponByName(unit.availableWargear || [], replacedWeaponName);
            if (!replacedWeapon) return;

            // Get replacement weapons
            const replacementWeapons = opt.addsWeaponNames.map((name) => findWeaponByName(unit.availableWargear || [], name)).filter((w): w is Weapon => w !== undefined);

            // Check if we already have a swap group for this replaced weapon
            const existingGroup = swapGroupsByReplacedWeapon.get(replacedWeapon.id);
            if (existingGroup) {
                // Add new replacement options to existing group (avoid duplicates)
                replacementWeapons.forEach((w) => {
                    if (!existingGroup.options.some((o) => o.weapon.id === w.id)) {
                        existingGroup.options.push({
                            weapon: w,
                            isDefault: false,
                            isSelected: currentWeaponId === w.id,
                        });
                    }
                });
            } else {
                // Determine what's currently selected using the consolidated weapon ID
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
                        ...replacementWeapons.map((w) => ({
                            weapon: w,
                            isDefault: false,
                            isSelected: currentWeaponId === w.id,
                        })),
                    ],
                };
                swapGroupsByReplacedWeapon.set(replacedWeapon.id, swapGroup);
                groups.push(swapGroup);
            }
        });

        return groups;
    }, [categorizedOptions.unitWideOptions, unit.availableWargear, unitWideWeaponId]);

    // Build unit-wide addition options (for "All models can be equipped with X")
    const unitWideAdditions = useMemo((): WeaponAddition[] => {
        const additions: WeaponAddition[] = [];

        categorizedOptions.unitWideOptions.forEach((opt) => {
            if (opt.action !== "add" || opt.addsWeaponNames.length === 0) return;

            opt.addsWeaponNames.forEach((weaponName) => {
                const weapon = findWeaponByName(unit.availableWargear || [], weaponName);
                if (!weapon) return;

                // Check if ALL models have this weapon (for unit-wide, it's all or nothing)
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
    }, [categorizedOptions.unitWideOptions, unit.availableWargear, unit.modelInstances]);

    // Handle unit-wide addition toggle (add/remove weapon from all models)
    const handleUnitWideAdditionToggle = useCallback(
        (weapon: Weapon) => {
            if (!unit.modelInstances) return;

            // Check if ALL models have the weapon (matches display logic)
            const allModelsHaveWeapon = unit.modelInstances.every((instance) => instance.loadout.includes(weapon.id));

            // Update all model loadouts at once to avoid race conditions
            updateAllModelLoadouts(list, unit.listItemId, (instance) => {
                if (allModelsHaveWeapon) {
                    // Remove weapon from all
                    return instance.loadout.filter((id) => id !== weapon.id);
                } else {
                    // Add weapon to those missing it
                    return instance.loadout.includes(weapon.id) ? instance.loadout : [...instance.loadout, weapon.id];
                }
            });
        },
        [list, unit, updateAllModelLoadouts]
    );

    // Toggle model expansion
    const toggleModelExpansion = (index: number) => {
        setExpandedModels((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const renderWeaponProfile = (profile: WeaponProfile, isSelected: boolean, isDisabled: boolean, onClick?: () => void, isStacked?: boolean, disabledLabel?: string) => (
        <WargearProfileCard key={profile.name} profile={profile} isSelected={isSelected} isDisabled={isDisabled} isStacked={isStacked} onCardClick={onClick} disabledLabel={disabledLabel} />
    );

    // Render a weapon swap group with visual indicators
    const renderSwapGroup = (swapGroup: WeaponSwapGroup, instance: ModelInstance, isDisabled: boolean, constraintEval: ConstraintEvaluation | null) => {
        // Check if this model has already selected a non-default option in this swap group
        // If so, all options in the group should be clickable (to allow switching back)
        const hasNonDefaultSelection = swapGroup.options.some((opt) => opt.isSelected && !opt.isDefault);

        // Get all weapon IDs in this swap group - constraints between these should not block
        // because selecting any option replaces the current one
        const swapGroupWeaponIds = new Set(swapGroup.options.map((opt) => opt.weapon.id));

        return (
            <div key={`swap-${swapGroup.replacesWeaponId}`} className="space-y-2">
                {swapGroup.options.map((option, optIdx) => {
                    const isSelected = option.isSelected;
                    const weapon = option.weapon;

                    // Check constraint blocking
                    const constraintBlock = isWeaponBlocked(weapon.id, isSelected, constraintEval);

                    // Don't apply constraint blocking within the same swap group.
                    // Within a swap group, selecting a different option replaces the current one,
                    // so constraints between options in the same group are irrelevant.
                    // We check if the blocking weapon (mentioned in the reason) is also in this swap group.
                    let shouldApplyConstraintBlock = constraintBlock.isBlocked;
                    if (shouldApplyConstraintBlock && constraintBlock.reason) {
                        // Check if any weapon in this swap group is mentioned in the block reason
                        // If so, the block is from within this group and should be ignored
                        for (const opt of swapGroup.options) {
                            if (opt.isSelected && constraintBlock.reason.toLowerCase().includes(opt.weapon.name.toLowerCase())) {
                                shouldApplyConstraintBlock = false;
                                break;
                            }
                        }
                    }

                    // Option is disabled if:
                    // 1. The overall option is disabled (maxed out) AND not selected AND no non-default selection
                    // 2. OR blocked by a constraint from another swap group
                    const isOptionDisabled = (isDisabled && !isSelected && !hasNonDefaultSelection) || shouldApplyConstraintBlock;

                    // Get the disabled label from constraint if applicable
                    const disabledLabel = shouldApplyConstraintBlock ? constraintBlock.reason : undefined;

                    return (
                        <div key={weapon.id} className={styles.WargearProfileCardSwapItemWrapper}>
                            {weapon.profiles?.map((profile, pIdx) => renderWeaponProfile(profile, isSelected, isOptionDisabled, isOptionDisabled ? undefined : () => handleSwapSelection(instance, swapGroup, option), weapon.profiles.length > 1 ? true : false, disabledLabel))}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render an addition weapon with plus icon
    const renderAddition = (addition: WeaponAddition, instance: ModelInstance, isDisabled: boolean) => {
        const weapon = addition.weapon;

        return (
            <div key={`add-${weapon.id}`} className="relative pl-8">
                {/* Plus icon */}
                <div
                    className={`absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full transition-colors border ${addition.isSelected ? "bg-fireDragonBright border-fireDragonBright text-deathWorldForest" : "bg-transparent border-fireDragonBright/40 text-fireDragonBright/40"}`}
                >
                    <Plus className={`w-3 h-3 transition-transform duration-[500ms] ${addition.isSelected ? "rotate-[180deg]" : ""}`} />
                </div>

                {/* Weapon profiles */}
                <div className="space-y-1">{weapon.profiles?.map((profile) => renderWeaponProfile(profile, addition.isSelected, isDisabled && !addition.isSelected, isDisabled && !addition.isSelected ? undefined : () => handleAdditionToggle(instance, weapon)))}</div>
            </div>
        );
    };

    // Render weapons with no options (read-only display)
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

    // Render a collapsed model group (models with no options)
    const renderCollapsedGroup = (group: ReturnType<typeof groupModelsForDisplay>[0]) => {
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

    // Render a single model with its weapon options
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

        // Find weapons not covered by any option (static weapons)
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

        // Evaluate constraints for this model instance
        const constraintEval = getConstraintEvaluation(modelInfo.instance);

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

                            {/* Ranged swap groups and additions */}
                            {rangedGroups.map((group) => {
                                if (group.type === "swap") {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderSwapGroup(group, modelInfo.instance, availOpt?.isDisabled ?? false, constraintEval);
                                } else {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderAddition(group, modelInfo.instance, availOpt?.isDisabled ?? false);
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

                            {/* Melee swap groups and additions */}
                            {meleeGroups.map((group) => {
                                if (group.type === "swap") {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderSwapGroup(group, modelInfo.instance, availOpt?.isDisabled ?? false, constraintEval);
                                } else {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderAddition(group, modelInfo.instance, availOpt?.isDisabled ?? false);
                                }
                            })}
                        </Fragment>
                    )}
                </div>
            </div>
        );
    };

    // Render unit-wide swap group (special handling - no instance required)
    const renderUnitWideSwapGroup = (swapGroup: WeaponSwapGroup) => {
        // Get the current weapon ID to pass as oldWeaponId when changing selection
        const currentWeaponId = unitWideWeaponId || swapGroup.replacesWeaponId;

        return (
            <div key={`unit-wide-swap-${swapGroup.replacesWeaponId}`} className="space-y-2">
                {swapGroup.options.map((option) => {
                    const isSelected = option.isSelected;
                    const weapon = option.weapon;

                    return (
                        <div key={weapon.id} className={styles.WargearProfileCardSwapItemWrapper}>
                            {weapon.profiles?.map((profile) => renderWeaponProfile(profile, isSelected, false, () => handleUnitWideSelectionChange(swapGroup.optionLine, weapon.id, currentWeaponId), weapon.profiles.length > 1))}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render the unit-wide options section
    // Render a unit-wide addition with plus icon
    const renderUnitWideAddition = (addition: WeaponAddition) => {
        const weapon = addition.weapon;

        return (
            <div key={`unit-wide-add-${weapon.id}`} className="relative pl-8">
                {/* Plus icon */}
                <div
                    className={`absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full transition-colors border ${addition.isSelected ? "bg-fireDragonBright border-fireDragonBright text-deathWorldForest" : "bg-transparent border-fireDragonBright/40 text-fireDragonBright/40"}`}
                >
                    <Plus className={`w-3 h-3 transition-transform duration-[500ms] ${addition.isSelected ? "rotate-[180deg]" : ""}`} />
                </div>

                {/* Weapon profiles */}
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

    // Build weapon groups for ratio options only (for per-model sections in unit-wide layout)
    // This shows the unit-wide weapon as the default, with ratio options as alternatives
    const buildRatioWeaponGroups = useCallback(
        (modelInfo: ModelOptionsInfo): WeaponGroup[] => {
            const groups: WeaponGroup[] = [];
            const processedOptionLines = new Set<number>();
            const swapGroupsByReplacedWeapon = new Map<string, WeaponSwapGroup>();

            // Get the unit-wide option lines to exclude
            const unitWideOptionLines = new Set(categorizedOptions.unitWideOptions.map((opt) => opt.line));

            // Helper to determine if a weapon is selected for a specific option line
            const isSelectedForOption = (weaponId: string, optionLine: number, isDefault: boolean): boolean => {
                const selections = modelInfo.instance.optionSelections;
                if (selections && selections[optionLine] !== undefined) {
                    return selections[optionLine] === weaponId;
                }
                return modelInfo.instance.loadout.includes(weaponId);
            };

            // Helper to check if a weapon option already exists in a swap group
            const hasWeaponOption = (swapGroup: WeaponSwapGroup, weaponId: string): boolean => {
                return swapGroup.options.some((opt) => opt.weapon.id === weaponId);
            };

            // Process only ratio options for this model
            modelInfo.availableOptions.forEach((availOpt) => {
                if (!availOpt.isEligible) return;

                const opt = availOpt.parsedOption;

                // Skip unit-wide options - they're handled in the unit-wide section
                if (unitWideOptionLines.has(opt.line)) return;

                // Skip if not a ratio option
                if (opt.targeting.type !== "ratio" && opt.targeting.type !== "ratio-up-to") return;

                // Skip if we've already processed this option line
                if (processedOptionLines.has(opt.line)) return;

                if (opt.action === "replace" && opt.replacesWeaponNames.length > 0) {
                    const replacedWeaponName = opt.replacesWeaponNames[0];

                    // Check if this is a generic reference like "ranged weapon"
                    if (isGenericWeaponReference(replacedWeaponName)) {
                        // For ratio options with generic weapon reference, the "ranged weapon"
                        // refers to the current unit-wide weapon selection
                        const currentUnitWideWeapon = unitWideWeaponId ? (unit.availableWargear || []).find((w) => w.id === unitWideWeaponId) : null;

                        if (!currentUnitWideWeapon) return;

                        // Get replacement weapons from this ratio option
                        const replacementWeapons = opt.addsWeaponNames.map((name) => findWeaponByName(unit.availableWargear || [], name)).filter((w): w is Weapon => w !== undefined);

                        // Check if we already have a swap group for this weapon
                        const existingGroup = swapGroupsByReplacedWeapon.get(currentUnitWideWeapon.id);
                        if (existingGroup) {
                            // Add new replacement options to existing group
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
                            // Create new swap group with unit-wide weapon as default
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
                                    ...replacementWeapons.map((w) => ({
                                        weapon: w,
                                        isDefault: false,
                                        isSelected: isSelectedForOption(w.id, opt.line, false),
                                    })),
                                ],
                            };
                            swapGroupsByReplacedWeapon.set(currentUnitWideWeapon.id, swapGroup);
                            groups.push(swapGroup);
                        }
                    } else {
                        // Specific weapon name - handle normally
                        const replacedWeapon = findWeaponByName(unit.availableWargear || [], replacedWeaponName);
                        if (!replacedWeapon) return;

                        const replacementWeapons = opt.addsWeaponNames.map((name) => findWeaponByName(unit.availableWargear || [], name)).filter((w): w is Weapon => w !== undefined);

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
                    }

                    processedOptionLines.add(opt.line);
                }
            });

            return groups;
        },
        [unit.availableWargear, categorizedOptions.unitWideOptions, unitWideWeaponId]
    );

    // Render a single model with ratio options only (for unit-wide layout)
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

        // Find weapons not covered by any option (static weapons)
        // Exclude the unit-wide weapon variants since they're controlled by unit-wide section
        const coveredWeaponIds = new Set<string>();
        weaponGroups.forEach((g) => {
            if (g.type === "swap") {
                g.options.forEach((o) => coveredWeaponIds.add(o.weapon.id));
            } else {
                coveredWeaponIds.add(g.weapon.id);
            }
        });

        // Also exclude all unit-wide option weapons from static display
        categorizedOptions.unitWideOptions.forEach((opt) => {
            const replacedWeapon = findWeaponByName(unit.availableWargear || [], opt.replacesWeaponNames[0]);
            if (replacedWeapon) coveredWeaponIds.add(replacedWeapon.id);
            opt.addsWeaponNames.forEach((name) => {
                const weapon = findWeaponByName(unit.availableWargear || [], name);
                if (weapon) coveredWeaponIds.add(weapon.id);
            });
        });

        const staticWeapons = modelInfo.currentWeapons.filter((w) => !coveredWeaponIds.has(w.id));
        const staticRanged = staticWeapons.filter((w) => w.type === "Ranged");
        const staticMelee = staticWeapons.filter((w) => w.type === "Melee");

        // Evaluate constraints for this model instance
        const constraintEval = getConstraintEvaluation(modelInfo.instance);

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

                            {/* Ranged swap groups (ratio options only) */}
                            {rangedGroups.map((group) => {
                                if (group.type === "swap") {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderSwapGroup(group, modelInfo.instance, availOpt?.isDisabled ?? false, constraintEval);
                                } else {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderAddition(group, modelInfo.instance, availOpt?.isDisabled ?? false);
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

                            {/* Melee swap groups (ratio options only) */}
                            {meleeGroups.map((group) => {
                                if (group.type === "swap") {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderSwapGroup(group, modelInfo.instance, availOpt?.isDisabled ?? false, constraintEval);
                                } else {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderAddition(group, modelInfo.instance, availOpt?.isDisabled ?? false);
                                }
                            })}
                        </Fragment>
                    )}
                </div>
            </div>
        );
    };

    // Render per-model sections for ratio-eligible models only
    const renderPerModelSections = () => {
        if (ratioEligibleIndices.size === 0 || categorizedOptions.ratioOptions.length === 0) {
            return null;
        }

        // Get models that are eligible for ratio options
        const eligibleModels = modelOptionsInfos.filter((info) => ratioEligibleIndices.has(info.instanceIndex));

        return eligibleModels.map((modelInfo) => renderModelWithRatioOptions(modelInfo, modelInfo.instanceIndex + 1));
    };

    // Render collapsed models section (models without ratio options)
    const renderCollapsedModelsSection = () => {
        // Get models NOT eligible for ratio options
        const nonEligibleModels = modelOptionsInfos.filter((info) => !ratioEligibleIndices.has(info.instanceIndex));

        if (nonEligibleModels.length === 0) return null;

        // Group consecutive models of the same type with same loadout
        const groups: { modelType: string; startIndex: number; endIndex: number; weapons: Weapon[] }[] = [];
        let currentGroup: (typeof groups)[0] | null = null;

        nonEligibleModels.forEach((info) => {
            const loadoutKey = info.instance.loadout.sort().join("|");

            if (currentGroup && currentGroup.modelType === info.modelType) {
                // Extend current group
                currentGroup.endIndex = info.instanceIndex + 1;
            } else {
                // Start new group
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

    // Check if we should use the new unit-wide layout
    const hasUnitWideOptions = categorizedOptions.unitWideOptions.length > 0;

    return (
        <div className="grid grid-cols-3 p-6 gap-4">
            <div className="space-y-6 col-span-2">
                {hasUnitWideOptions ? (
                    // New layout: unit-wide options at top, then ratio-eligible models, then collapsed
                    <Fragment>
                        {renderUnitWideSection()}
                        {renderPerModelSections()}
                        {renderCollapsedModelsSection()}
                    </Fragment>
                ) : (
                    // Original layout for units without "all models" options
                    displayGroups.map((group) => {
                        if (!group.hasOptions) {
                            // Collapsed group - no options available
                            return renderCollapsedGroup(group);
                        }

                        // Expanded group - each model shown individually
                        const modelInfosInGroup = modelOptionsInfos.filter((info) => group.instances.some((inst) => inst.instanceId === info.instance.instanceId));

                        return modelInfosInGroup.map((modelInfo) =>
                            renderModelWithOptions(
                                modelInfo,
                                modelInfo.instanceIndex + 1 // 1-indexed for display
                            )
                        );
                    })
                )}
            </div>
            <div className="space-y-6 pt-7">
                <SplitHeading label="Wargear rules" />
                {unit.options?.map((o, idx) => (
                    <div key={idx} dangerouslySetInnerHTML={{ __html: o.description }} />
                ))}
            </div>
        </div>
    );
};

export default WargearTab;

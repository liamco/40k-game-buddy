import { useMemo, useState, useCallback, Fragment } from "react";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";
import WargearProfileCard from "./WargearProfileCard.tsx";
import { useListManager } from "#modules/Lists/ListManagerContext.tsx";
import { ArmyList, ArmyListItem, ModelInstance } from "#types/Lists.tsx";
import { Weapon, WeaponProfile } from "#types/Weapons.tsx";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { parseOption, getModelOptionsInfo, groupModelsForDisplay, ParsedOption, ModelOptionsInfo, AvailableOption, findWeaponByName, isGenericWeaponReference, resolveGenericWeaponReference } from "./wargearHelpers";

interface Props {
    unit: ArmyListItem;
    list: ArmyList;
}

// Types for organizing weapons into swap groups and additions
interface WeaponSwapGroup {
    type: "swap";
    replacesWeaponId: string;
    replacesWeaponName: string;
    options: {
        weapon: Weapon;
        isDefault: boolean;
        isSelected: boolean;
    }[];
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
    const { updateModelLoadout } = useListManager();
    const [expandedModels, setExpandedModels] = useState<Set<number>>(new Set());

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

    // Get options info for each model
    const modelOptionsInfos = useMemo(() => getModelOptionsInfo(unit, parsedOptions), [unit, parsedOptions]);

    // Group models for display (collapse models with no options)
    const displayGroups = useMemo(() => groupModelsForDisplay(modelOptionsInfos, unit), [modelOptionsInfos, unit]);

    // Build weapon groups for a specific model instance
    const buildWeaponGroups = useCallback(
        (modelInfo: ModelOptionsInfo): WeaponGroup[] => {
            const groups: WeaponGroup[] = [];
            const processedWeaponIds = new Set<string>();

            // Process each available option for this model
            modelInfo.availableOptions.forEach((availOpt) => {
                if (!availOpt.isEligible) return;

                const opt = availOpt.parsedOption;

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
                            // Skip if we already have a swap group for this weapon
                            if (processedWeaponIds.has(replacedWeapon.id)) return;

                            const existingGroup = groups.find((g) => g.type === "swap" && g.replacesWeaponId === replacedWeapon.id) as WeaponSwapGroup | undefined;
                            const currentlyHasDefault = modelInfo.instance.loadout.includes(replacedWeapon.id);

                            if (existingGroup) {
                                // Add options to existing group
                                replacementWeapons.forEach((w) => {
                                    if (!existingGroup.options.find((o) => o.weapon.id === w.id)) {
                                        existingGroup.options.push({
                                            weapon: w,
                                            isDefault: false,
                                            isSelected: modelInfo.instance.loadout.includes(w.id),
                                        });
                                    }
                                });
                            } else {
                                // Create new swap group
                                const swapGroup: WeaponSwapGroup = {
                                    type: "swap",
                                    replacesWeaponId: replacedWeapon.id,
                                    replacesWeaponName: replacedWeapon.name,
                                    parsedOption: opt,
                                    options: [
                                        {
                                            weapon: replacedWeapon,
                                            isDefault: true,
                                            isSelected: currentlyHasDefault,
                                        },
                                        ...replacementWeapons.map((w) => ({
                                            weapon: w,
                                            isDefault: false,
                                            isSelected: modelInfo.instance.loadout.includes(w.id),
                                        })),
                                    ],
                                };
                                groups.push(swapGroup);
                                processedWeaponIds.add(replacedWeapon.id);
                            }
                        });
                    } else {
                        // Specific weapon name - existing logic
                        const replacedWeapon = findWeaponByName(unit.availableWargear || [], replacedWeaponName);

                        if (!replacedWeapon) return;

                        // Check if we already have a swap group for this weapon
                        const existingGroup = groups.find((g) => g.type === "swap" && g.replacesWeaponId === replacedWeapon.id) as WeaponSwapGroup | undefined;

                        // Get all replacement options from this option line
                        const replacementWeapons = opt.addsWeaponNames.map((name) => findWeaponByName(unit.availableWargear || [], name)).filter((w): w is Weapon => w !== undefined);

                        // Check what's currently selected
                        const currentlyHasDefault = modelInfo.instance.loadout.includes(replacedWeapon.id);

                        if (existingGroup) {
                            // Add options to existing group
                            replacementWeapons.forEach((w) => {
                                if (!existingGroup.options.find((o) => o.weapon.id === w.id)) {
                                    existingGroup.options.push({
                                        weapon: w,
                                        isDefault: false,
                                        isSelected: modelInfo.instance.loadout.includes(w.id),
                                    });
                                }
                            });
                        } else {
                            // Create new swap group
                            const swapGroup: WeaponSwapGroup = {
                                type: "swap",
                                replacesWeaponId: replacedWeapon.id,
                                replacesWeaponName: replacedWeapon.name,
                                parsedOption: opt,
                                options: [
                                    {
                                        weapon: replacedWeapon,
                                        isDefault: true,
                                        isSelected: currentlyHasDefault,
                                    },
                                    ...replacementWeapons.map((w) => ({
                                        weapon: w,
                                        isDefault: false,
                                        isSelected: modelInfo.instance.loadout.includes(w.id),
                                    })),
                                ],
                            };
                            groups.push(swapGroup);
                            processedWeaponIds.add(replacedWeapon.id);
                        }
                    }
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
        (instance: ModelInstance, swapGroup: WeaponSwapGroup, selectedWeaponId: string) => {
            // Remove all weapons in this swap group from loadout, then add the selected one
            const swapWeaponIds = swapGroup.options.map((o) => o.weapon.id);
            const newLoadout = instance.loadout.filter((id) => !swapWeaponIds.includes(id));
            newLoadout.push(selectedWeaponId);

            updateModelLoadout(list, unit.listItemId, instance.instanceId, newLoadout);
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

    // Render a single weapon profile card
    const renderWeaponProfile = (profile: WeaponProfile, isSelected: boolean, isDisabled: boolean, onClick?: () => void) => <WargearProfileCard key={profile.name} profile={profile} isSelected={isSelected} isDisabled={isDisabled} onCardClick={onClick} />;

    // Render a weapon swap group with visual indicators
    const renderSwapGroup = (swapGroup: WeaponSwapGroup, instance: ModelInstance, isDisabled: boolean) => {
        // Check if this model has already selected a non-default option in this swap group
        // If so, all options in the group should be clickable (to allow switching back)
        const hasNonDefaultSelection = swapGroup.options.some((opt) => opt.isSelected && !opt.isDefault);

        return (
            <div key={`swap-${swapGroup.replacesWeaponId}`} className="space-y-2">
                {/* Swap group container with connecting line */}
                <div className="relative">
                    {/* Vertical connecting line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-skarsnikGreen/40" />

                    <div className="space-y-2">
                        {swapGroup.options.map((option, optIdx) => {
                            const isSelected = option.isSelected;
                            const weapon = option.weapon;

                            // Option is only truly disabled if:
                            // 1. The overall option is disabled (maxed out) AND
                            // 2. This specific weapon is not selected AND
                            // 3. The model hasn't already made a non-default selection in this group
                            const isOptionDisabled = isDisabled && !isSelected && !hasNonDefaultSelection;

                            return (
                                <div key={weapon.id} className="relative pl-8">
                                    {/* Horizontal connector line */}
                                    <div className="absolute left-4 top-1/2 w-4 h-px bg-skarsnikGreen/40" />

                                    {/* Connection dot */}
                                    <div className={`absolute left-[14px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border ${isSelected ? "bg-skarsnikGreen border-skarsnikGreen" : "bg-transparent border-skarsnikGreen/40"}`} />

                                    {/* Weapon profiles - render all profiles for multi-profile weapons */}
                                    <div className="space-y-1">
                                        {weapon.profiles?.map((profile, pIdx) => (
                                            <div key={`${weapon.id}-${pIdx}`} className="relative">
                                                {/* Dashed line between profiles of same weapon */}
                                                {pIdx > 0 && <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-skarsnikGreen/30" />}
                                                {renderWeaponProfile(profile, isSelected, isOptionDisabled, isOptionDisabled ? undefined : () => handleSwapSelection(instance, swapGroup, weapon.id))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // Render an addition weapon with plus icon
    const renderAddition = (addition: WeaponAddition, instance: ModelInstance, isDisabled: boolean) => {
        const weapon = addition.weapon;

        return (
            <div key={`add-${weapon.id}`} className="relative pl-8">
                {/* Plus icon */}
                <div className={`absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full border ${addition.isSelected ? "bg-skarsnikGreen border-skarsnikGreen text-deathKorps" : "bg-transparent border-skarsnikGreen/40 text-skarsnikGreen/40"}`}>
                    <Plus className="w-3 h-3" />
                </div>

                {/* Weapon profiles */}
                <div className="space-y-1">
                    {weapon.profiles?.map((profile, pIdx) => (
                        <div key={`${weapon.id}-${pIdx}`} className="relative">
                            {pIdx > 0 && <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-skarsnikGreen/30" />}
                            {renderWeaponProfile(profile, addition.isSelected, isDisabled && !addition.isSelected, isDisabled && !addition.isSelected ? undefined : () => handleAdditionToggle(instance, weapon))}
                        </div>
                    ))}
                </div>
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
                                        {pIdx > 0 && <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-skarsnikGreen/30" />}
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
                                        {pIdx > 0 && <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-skarsnikGreen/30" />}
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
                <div className="flex justify-between">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-metadata-l font-medium">{group.modelType}</span>
                        <span className="text-skarsnikGreen/60 text-body-s">{label}</span>
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

        return (
            <div key={modelInfo.instance.instanceId}>
                <div className="flex justify-between">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-metadata-l font-medium">{modelInfo.modelType}</span>
                        <span className="text-skarsnikGreen/60 text-body-s">#{displayIndex}</span>
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
                                            {pIdx > 0 && <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-skarsnikGreen/30" />}
                                            {renderWeaponProfile(profile, true, false)}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {/* Ranged swap groups and additions */}
                            {rangedGroups.map((group) => {
                                if (group.type === "swap") {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderSwapGroup(group, modelInfo.instance, availOpt?.isDisabled ?? false);
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
                                            {pIdx > 0 && <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-skarsnikGreen/30" />}
                                            {renderWeaponProfile(profile, true, false)}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {/* Melee swap groups and additions */}
                            {meleeGroups.map((group) => {
                                if (group.type === "swap") {
                                    const availOpt = modelInfo.availableOptions.find((o) => o.parsedOption.line === group.parsedOption.line);
                                    return renderSwapGroup(group, modelInfo.instance, availOpt?.isDisabled ?? false);
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

    return (
        <div className="space-y-6 p-6">
            {displayGroups.map((group) => {
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
            })}
        </div>
    );
};

export default WargearTab;

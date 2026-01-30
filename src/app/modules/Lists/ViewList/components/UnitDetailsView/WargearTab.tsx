import { useMemo, useState, useCallback } from "react";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";
import WeaponProfileCard from "#components/WeaponProfileCard/WeaponProfileCard.tsx";
import { useListManager } from "#modules/Lists/ListManagerContext.tsx";
import { ArmyList, ArmyListItem, ModelInstance } from "#types/Lists.tsx";
import { Weapon, WeaponProfile } from "#types/Weapons.tsx";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { parseOption, getModelOptionsInfo, groupModelsForDisplay, ParsedOption, ModelOptionsInfo, AvailableOption, findWeaponByName } from "./wargearHelpers";

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
                    // Find the weapon being replaced
                    const replacedWeaponName = opt.replacesWeaponNames[0];
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
    const renderWeaponProfile = (profile: WeaponProfile, isSelected: boolean, isDisabled: boolean, onClick?: () => void) => <WeaponProfileCard key={profile.name} profile={profile} isSelected={isSelected} isDisabled={isDisabled} onCardClick={onClick} />;

    // Render a weapon swap group with visual indicators
    const renderSwapGroup = (swapGroup: WeaponSwapGroup, instance: ModelInstance, isDisabled: boolean) => {
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
                                                {renderWeaponProfile(profile, isSelected, isDisabled && !isSelected, isDisabled && !isSelected ? undefined : () => handleSwapSelection(instance, swapGroup, weapon.id))}
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
            <div className="space-y-4">
                {ranged.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-body-s text-skarsnikGreen/60 uppercase tracking-wider">Ranged</h4>
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
                    </div>
                )}

                {melee.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-body-s text-skarsnikGreen/60 uppercase tracking-wider">Melee</h4>
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
                    </div>
                )}
            </div>
        );
    };

    // Render a collapsed model group (models with no options)
    const renderCollapsedGroup = (group: ReturnType<typeof groupModelsForDisplay>[0]) => {
        const label = group.startIndex === group.endIndex ? `#${group.startIndex}` : `#${group.startIndex}-${group.endIndex}`;

        return (
            <div key={`collapsed-${group.startIndex}-${group.endIndex}`} className="border border-skarsnikGreen/20 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-metadata-l font-medium">{group.modelType}</span>
                    <span className="text-skarsnikGreen/60 text-body-s">{label}</span>
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
            <div key={modelInfo.instance.instanceId} className="border border-skarsnikGreen/20 rounded p-4">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-metadata-l font-medium">{modelInfo.modelType}</span>
                    <span className="text-skarsnikGreen/60 text-body-s">#{displayIndex}</span>
                </div>

                <div className="space-y-6">
                    {/* Ranged weapons */}
                    {(rangedGroups.length > 0 || staticRanged.length > 0) && (
                        <div className="space-y-3">
                            <h4 className="text-body-s text-skarsnikGreen/60 uppercase tracking-wider">Ranged</h4>

                            {/* Static ranged weapons */}
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
                        </div>
                    )}

                    {/* Melee weapons */}
                    {(meleeGroups.length > 0 || staticMelee.length > 0) && (
                        <div className="space-y-3">
                            <h4 className="text-body-s text-skarsnikGreen/60 uppercase tracking-wider">Melee</h4>

                            {/* Static melee weapons */}
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
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // No model instances - show fallback
    if (!unit.modelInstances || unit.modelInstances.length === 0) {
        return (
            <div className="text-skarsnikGreen/60">
                <p>No model data available. This unit may need to be re-added to use per-model weapon management.</p>
            </div>
        );
    }

    // Read-only view for units with no options
    if (!hasOptions) {
        return (
            <div className="space-y-6">
                <SplitHeading label="Weapons" />
                {displayGroups.map((group) => renderCollapsedGroup(group))}
            </div>
        );
    }

    // Interactive view with model-by-model display
    return (
        <div className="space-y-6">
            <SplitHeading label="Weapons" />

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

            {/* Constraint summary */}
            {parsedOptions.some((opt) => !opt.isNote && opt.constraint.maxPerUnit > 1) && (
                <div className="mt-4 p-3 bg-skarsnikGreen/5 rounded border border-skarsnikGreen/20">
                    <h4 className="text-body-s text-skarsnikGreen/80 mb-2">Option Limits</h4>
                    <div className="space-y-1">
                        {parsedOptions
                            .filter((opt) => !opt.isNote && opt.constraint.maxPerUnit > 1)
                            .map((opt) => {
                                const usage = modelOptionsInfos.reduce((count, info) => {
                                    const availOpt = info.availableOptions.find((ao) => ao.parsedOption.line === opt.line);
                                    return count + (availOpt?.currentUsage ?? 0);
                                }, 0);
                                // Only count once (all models have same usage count)
                                const actualUsage = modelOptionsInfos[0]?.availableOptions.find((ao) => ao.parsedOption.line === opt.line)?.currentUsage ?? 0;

                                return (
                                    <div key={opt.line} className="text-body-s text-skarsnikGreen/60 flex justify-between">
                                        <span>{opt.addsWeaponNames.length > 0 ? opt.addsWeaponNames.join(" / ") : "Option"}</span>
                                        <span className={actualUsage >= opt.constraint.maxPerUnit ? "text-orange-400" : ""}>
                                            {actualUsage}/{opt.constraint.maxPerUnit}
                                        </span>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WargearTab;

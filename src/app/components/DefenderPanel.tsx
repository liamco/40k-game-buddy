import React, { useState, useEffect, useMemo, useRef, Fragment } from "react";
import SearchableDropdown, { type SearchableDropdownOption } from "./SearchableDropdown/SearchableDropdown";
import Dropdown, { type DropdownOption } from "./Dropdown/Dropdown";
import type { ArmyList, Datasheet, Faction, Model, GamePhase, Ability, ArmyListItem, WeaponProfile } from "../types";
import { loadFactionData } from "../utils/depotDataLoader";
import { Badge } from "./_ui/badge";
import { collectUnitAbilities, createDefaultCombatStatus, type Mechanic, type UnitContext, type CombatStatus, type CombatStatusFlag } from "../game-engine";
import CombatStatusComponent from "./CombatStatus/CombatStatus";
import SplitHeading from "./SplitHeading/SplitHeading";
import ModelProfileCard from "./ModelProfileCard/ModelProfileCard";
import CombatantPanelEmpty from "./CombatantPanelEmpty/CombatantPanelEmpty";
import StratagemDialog from "./StratagemDialog/StratagemDialog";

interface DefenderPanelProps {
    gamePhase: GamePhase;
    unit: Datasheet | null;
    attachedUnit: Datasheet | null;
    onUnitChange: (unit: Datasheet) => void;
    selectedUnitModel: Model | null;
    onUnitModelChange: (weapon: Model | null) => void;
    combatStatus: CombatStatus;
    onCombatStatusChange: (name: CombatStatusFlag, value: boolean) => void;
    selectedList: ArmyList | null;
    selectedWeaponProfile: WeaponProfile | null;
    modelCount: number;
    startingStrength: number;
    onModelCountChange: (count: number) => void;
    // List selection props
    availableLists: ArmyList[];
    onListChange: (listId: string) => void;
}

/**
 * Extracts defensive bonuses from mechanics for display.
 */
function extractDefensiveBonuses(mechanics: Mechanic[]): {
    saveBonuses: { source: string; value: number }[];
    feelNoPain: { source: string; value: number } | null;
    otherBonuses: { source: string; description: string }[];
} {
    const saveBonuses: { source: string; value: number }[] = [];
    let feelNoPain: { source: string; value: number } | null = null;
    const otherBonuses: { source: string; description: string }[] = [];

    for (const mechanic of mechanics) {
        const sourceName = mechanic.source?.name || "Unknown";

        if (mechanic.effect === "rollBonus" && typeof mechanic.value === "number") {
            if (mechanic.attribute === "s") {
                saveBonuses.push({ source: sourceName, value: mechanic.value });
            }
        } else if (mechanic.effect === "addsAbility" && mechanic.abilities) {
            for (const ability of mechanic.abilities) {
                if (ability.toUpperCase().includes("FEEL NO PAIN") && typeof mechanic.value === "number") {
                    feelNoPain = { source: sourceName, value: mechanic.value };
                } else if (ability.toUpperCase().includes("STEALTH")) {
                    otherBonuses.push({ source: sourceName, description: "Stealth" });
                }
            }
        }
    }

    return { saveBonuses, feelNoPain, otherBonuses };
}

export function DefenderPanel({ gamePhase, unit, attachedUnit, onUnitChange, selectedUnitModel, onUnitModelChange, combatStatus, onCombatStatusChange, selectedList, selectedWeaponProfile, modelCount, startingStrength, onModelCountChange, availableLists, onListChange }: DefenderPanelProps) {
    const [factionData, setFactionData] = useState<Faction | null>(null);
    const lastProcessedUnitRef = useRef<string | null>(null);

    // Convert available lists to Dropdown options
    const listOptions = useMemo((): DropdownOption<ArmyList>[] => {
        return availableLists.map((list) => ({
            id: list.id,
            label: list.name,
            data: list,
        }));
    }, [availableLists]);

    // Load faction data when list changes
    useEffect(() => {
        if (selectedList) {
            loadFactionData(selectedList.factionSlug).then((data) => {
                if (data) {
                    setFactionData(data);
                }
            });
        } else {
            setFactionData(null);
        }
    }, [selectedList]);

    // Combine leaders with their attached units into single items
    // Supports multiple leaders attached to a single bodyguard unit
    // Sorted alphabetically by display name (combined units use their full combined name)
    const combinedListItems = useMemo(() => {
        if (!selectedList) return [];

        const items = selectedList.items;
        const processed = new Set<string>();
        const combined: Array<{ item: ArmyListItem; displayName: string; isCombined: boolean; allLeaders: ArmyListItem[]; bodyguardUnit?: ArmyListItem }> = [];

        // First pass: Find bodyguard units with leaders attached
        items.forEach((item) => {
            if (processed.has(item.listItemId)) return;

            // Check if this unit has leaders attached (leadBy array)
            if (item.leadBy && item.leadBy.length > 0) {
                // Find all leaders for this unit
                const leaders = item.leadBy.map((ref) => items.find((l) => l.id === ref.id && l.name === ref.name)).filter((l): l is ArmyListItem => l !== undefined && !processed.has(l.listItemId));

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
    }, [selectedList]);

    // Convert combined items to dropdown options
    const unitOptions = useMemo((): SearchableDropdownOption<{ item: ArmyListItem; displayName: string; isCombined: boolean; allLeaders: ArmyListItem[]; bodyguardUnit?: ArmyListItem }>[] => {
        return combinedListItems.map((combined) => ({
            id: combined.item.listItemId,
            searchValue: `${combined.displayName} ${combined.item.roleLabel}`,
            data: combined,
        }));
    }, [combinedListItems]);

    // Get display name for selected unit
    const selectedUnitDisplayName = useMemo(() => {
        if (!unit) return null;

        // Try to find by listItemId first (if unit is an ArmyListItem)
        const listItemId = (unit as any).listItemId;
        if (listItemId) {
            const combinedItem = combinedListItems.find((c) => c.item.listItemId === listItemId);
            if (combinedItem) return combinedItem.displayName;
        }

        // Fallback: try to find by id and name (for backwards compatibility)
        const combinedItem = combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);

        return combinedItem ? combinedItem.displayName : unit.name;
    }, [unit, combinedListItems]);

    // Get combined models from all leaders and bodyguard unit if combined unit is selected
    const availableModels = useMemo(() => {
        if (!unit || !selectedList) return unit?.models || [];

        // Check if this is a combined unit (leader(s) with bodyguard unit)
        const listItemId = (unit as any).listItemId;
        const combinedItem = listItemId ? combinedListItems.find((c) => c.item.listItemId === listItemId) : combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);

        if (combinedItem?.isCombined && combinedItem.bodyguardUnit) {
            // Collect models from all leaders
            const allLeaderModels: (Model & { sourceUnit: string; isLeader: boolean })[] = [];
            for (const leader of combinedItem.allLeaders) {
                const leaderModels = (leader.models || []).map((model) => ({
                    ...model,
                    sourceUnit: leader.name,
                    isLeader: true,
                }));
                allLeaderModels.push(...leaderModels);
            }

            // Add bodyguard unit models
            const bodyguardModels = (combinedItem.bodyguardUnit.models || []).map((model) => ({
                ...model,
                sourceUnit: combinedItem.bodyguardUnit!.name,
                isLeader: false,
            }));

            return [...allLeaderModels, ...bodyguardModels];
        }

        // Return leader's models or regular unit's models
        return unit.models || [];
    }, [unit, selectedList, combinedListItems]);

    // Auto-select first non-leader model when combined unit is first selected
    useEffect(() => {
        if (!unit || !selectedList) {
            lastProcessedUnitRef.current = null;
            return;
        }

        // Get unique identifier for this unit
        const unitId = (unit as any).listItemId || unit.id;

        // Only process if this is a new unit (not already processed)
        if (lastProcessedUnitRef.current === unitId) {
            return;
        }

        // Mark this unit as processed
        lastProcessedUnitRef.current = unitId;

        // Check if this is a combined unit
        const listItemId = (unit as any).listItemId;
        const combinedItem = listItemId ? combinedListItems.find((c) => c.item.listItemId === listItemId) : combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);

        if (combinedItem?.isCombined && combinedItem.bodyguardUnit) {
            // Auto-select the first model from the bodyguard unit (non-leader)
            // This only happens when the unit first changes, not on subsequent model selections
            const bodyguard = combinedItem.bodyguardUnit;
            if (bodyguard.models && bodyguard.models.length > 0) {
                onUnitModelChange(bodyguard.models[0]);
            }
        }
    }, [unit, selectedList, combinedListItems, onUnitModelChange]);

    // Check if weapon has precision attribute
    const hasPrecision = useMemo(() => {
        if (!selectedWeaponProfile || !selectedWeaponProfile.attributes) {
            return false;
        }

        // Check for PRECISION in attributes array
        return selectedWeaponProfile.attributes.includes("PRECISION");
    }, [selectedWeaponProfile]);

    // Get all attached leaders as an array for the selected combined unit
    const attachedLeaders = useMemo((): Datasheet[] => {
        if (!unit || !selectedList) return attachedUnit ? [attachedUnit] : [];

        const listItemId = (unit as any).listItemId;
        const combinedItem = listItemId ? combinedListItems.find((c) => c.item.listItemId === listItemId) : combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);

        if (combinedItem?.isCombined && combinedItem.allLeaders.length > 0) {
            return combinedItem.allLeaders;
        }

        // Fallback to legacy attachedUnit prop
        return attachedUnit ? [attachedUnit] : [];
    }, [unit, selectedList, combinedListItems, attachedUnit]);

    // Collect defensive bonuses from all leader abilities when a combined unit is selected
    const leaderDefensiveBonuses = useMemo(() => {
        if (!unit || attachedLeaders.length === 0) {
            return { saveBonuses: [], feelNoPain: null, otherBonuses: [] };
        }

        // Create a unit context to collect abilities from all leaders
        const unitContext: UnitContext = {
            datasheet: unit,
            selectedModel: unit.models?.[0],
            state: createDefaultCombatStatus(),
            attachedLeaders: attachedLeaders,
            // Keep deprecated field for backwards compatibility
            attachedLeader: attachedLeaders[0],
        };

        // Collect all mechanics from the unit and attached leaders
        const mechanics = collectUnitAbilities(unitContext, "defender");

        // Filter to only mechanics that apply when leading
        const leaderMechanics = mechanics.filter((m) => {
            const hasLeadingCondition = m.conditions?.some((c) => c.state === "isLeadingUnit" || c.state === "leading" || (Array.isArray(c.state) && (c.state.includes("isLeadingUnit") || c.state.includes("leading"))));
            return hasLeadingCondition;
        });

        return extractDefensiveBonuses(leaderMechanics);
    }, [unit, attachedLeaders]);

    const handleUnitSelect = (combined: { item: ArmyListItem; displayName: string; isCombined: boolean; allLeaders: ArmyListItem[]; bodyguardUnit?: ArmyListItem }) => {
        onUnitChange(combined.item);
    };

    return (
        <section className="grid grid-cols-5 grid-rows-[auto_1fr_auto] gap-4 p-4 border-1 border-skarsnikGreen rounded overflow-auto">
            <header className="col-span-5 flex">
                <Dropdown options={listOptions} selectedLabel={selectedList?.name} placeholder="Select list..." onSelect={(list) => onListChange(list.id)} triggerClassName="grow-1 max-w-[150px] rounded-tr-none rounded-br-none" />
                <SearchableDropdown
                    options={unitOptions}
                    selectedLabel={selectedUnitDisplayName}
                    placeholder="Search for a unit..."
                    searchPlaceholder="Search units..."
                    emptyMessage="Matching records missing or expunged"
                    onSelect={handleUnitSelect}
                    renderOption={(combined) => <span className="text-blockcaps-m">{combined.displayName}</span>}
                    triggerClassName="grow-999 rounded-tl-none rounded-bl-none border-nocturneGreen border-l-1"
                />
            </header>
            {unit ? (
                <Fragment>
                    <div className="col-span-3 space-y-4">
                        <SplitHeading label="Target composition" />
                        {unit && unit.abilities && unit?.abilities.length > 0 && (
                            <div className="flex items-start flex-wrap gap-2">
                                {unit?.abilities.map((ability: Ability, index: number) => {
                                    return (
                                        <Badge key={ability.id || `${unit.id}-ability-${index}`}>
                                            {ability.name}
                                            {ability.parameter ? ` ${ability.parameter}` : ""}
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}

                        {/* Display leader defensive bonuses when a combined unit is selected */}
                        {attachedLeaders.length > 0 && (leaderDefensiveBonuses.saveBonuses.length > 0 || leaderDefensiveBonuses.feelNoPain || leaderDefensiveBonuses.otherBonuses.length > 0) && (
                            <div className="bg-blue-50 border border-blue-200 rounded-[4px] p-3 space-y-2">
                                <p className="text-[10px] font-bold text-blue-800 uppercase">Leader Bonuses Active</p>
                                <div className="flex flex-wrap gap-2">
                                    {leaderDefensiveBonuses.saveBonuses.map((bonus, idx) => (
                                        <span key={`save-${idx}`} className="text-[10px] font-bold uppercase p-1 px-2 rounded bg-blue-200 text-blue-800" title={bonus.source}>
                                            +{bonus.value} to Save
                                        </span>
                                    ))}
                                    {leaderDefensiveBonuses.feelNoPain && (
                                        <span className="text-[10px] font-bold uppercase p-1 px-2 rounded bg-blue-200 text-blue-800" title={leaderDefensiveBonuses.feelNoPain.source}>
                                            FNP {leaderDefensiveBonuses.feelNoPain.value}+
                                        </span>
                                    )}
                                    {leaderDefensiveBonuses.otherBonuses.map((bonus, idx) => (
                                        <span key={`other-${idx}`} className="text-[10px] font-bold uppercase p-1 px-2 rounded bg-blue-200 text-blue-800" title={bonus.source}>
                                            {bonus.description}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[9px] text-blue-600 italic">From: {leaderDefensiveBonuses.saveBonuses[0]?.source || leaderDefensiveBonuses.feelNoPain?.source || leaderDefensiveBonuses.otherBonuses[0]?.source}</p>
                            </div>
                        )}

                        {unit &&
                            availableModels.length > 0 &&
                            availableModels.map((model: Model & { sourceUnit?: string; isLeader?: boolean }) => {
                                const isSelected = selectedUnitModel?.name === model.name;
                                const modelKey = model.sourceUnit ? `${model.sourceUnit}-${model.name}` : model.name;
                                const isLeaderModel = model.isLeader === true;
                                // Leader models are only disabled if precision is NOT present
                                const isDisabled = isLeaderModel && !hasPrecision;

                                return <ModelProfileCard key={modelKey} model={model} isSelected={isSelected} isDisabled={isDisabled} onUnitModelChange={onUnitModelChange} />;
                            })}
                    </div>
                    <div className="col-span-2 space-y-4">
                        <SplitHeading label="Combat status" />
                        <CombatStatusComponent side="defender" combatStatus={combatStatus} onStatusChange={onCombatStatusChange} modelCount={modelCount} startingStrength={startingStrength} onModelCountChange={onModelCountChange} unit={unit} gamePhase={gamePhase} />
                    </div>
                </Fragment>
            ) : (
                <CombatantPanelEmpty combatant="defender" />
            )}
            <footer className="col-span-5">
                <StratagemDialog side="defender" gamePhase={gamePhase} selectedList={selectedList} />
            </footer>
        </section>
    );
}

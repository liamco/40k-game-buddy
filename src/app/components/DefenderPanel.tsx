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
    const combinedListItems = useMemo(() => {
        if (!selectedList) return [];

        const items = selectedList.items;
        const processed = new Set<string>();
        const combined: Array<{ item: ArmyListItem; displayName: string; isCombined: boolean }> = [];

        // First pass: Process all leaders and their attached units
        items.forEach((item) => {
            // Skip if already processed
            if (processed.has(item.listItemId)) return;

            // If this is a leader with an attached unit
            if (item.leading) {
                // Find the attached unit (without checking processed, since we process leaders first)
                const attachedUnit = items.find((u) => u.id === item.leading?.id && u.name === item.leading?.name);

                if (attachedUnit && !processed.has(attachedUnit.listItemId)) {
                    // Combine leader and attached unit
                    combined.push({
                        item: item, // Use leader as the main item
                        displayName: `${item.name} + ${attachedUnit.name}`,
                        isCombined: true,
                    });
                    processed.add(item.listItemId);
                    processed.add(attachedUnit.listItemId);
                } else {
                    // Leader but attached unit not found or already processed, show leader alone
                    combined.push({
                        item: item,
                        displayName: item.name,
                        isCombined: false,
                    });
                    processed.add(item.listItemId);
                }
            }
        });

        // Second pass: Process remaining items (units being led, regular units)
        items.forEach((item) => {
            // Skip if already processed
            if (processed.has(item.listItemId)) return;

            // If this unit is being led, skip it (it should have been added with its leader in first pass)
            if (item.leadBy) {
                // Check if the leader exists
                const leader = items.find((l) => l.id === item.leadBy?.id && l.name === item.leadBy?.name);

                if (!leader || !processed.has(leader.listItemId)) {
                    // Leader not found or not processed, show this unit alone
                    combined.push({
                        item: item,
                        displayName: item.name,
                        isCombined: false,
                    });
                    processed.add(item.listItemId);
                } else {
                    // Leader was processed, this unit should have been added with it
                    // Mark as processed to skip it
                    processed.add(item.listItemId);
                }
            }
            // Regular unit, not a leader and not being led
            else {
                combined.push({
                    item: item,
                    displayName: item.name,
                    isCombined: false,
                });
                processed.add(item.listItemId);
            }
        });

        return combined;
    }, [selectedList]);

    // Convert combined items to dropdown options
    const unitOptions = useMemo((): SearchableDropdownOption<{ item: ArmyListItem; displayName: string; isCombined: boolean }>[] => {
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

    // Get combined models from leader and attached unit if combined unit is selected
    const availableModels = useMemo(() => {
        if (!unit || !selectedList) return unit?.models || [];

        // Check if this is a combined unit (leader with attached unit)
        const listItemId = (unit as any).listItemId;
        const combinedItem = listItemId ? combinedListItems.find((c) => c.item.listItemId === listItemId) : combinedListItems.find((c) => c.item.id === unit.id && c.item.name === unit.name);

        if (combinedItem?.isCombined && combinedItem.item.leading) {
            // Find the attached unit
            const attachedUnit = selectedList.items.find((u) => u.id === combinedItem.item.leading?.id && u.name === combinedItem.item.leading?.name);

            if (attachedUnit) {
                // Combine models from both units with labels
                const leaderModels = (combinedItem.item.models || []).map((model) => ({
                    ...model,
                    sourceUnit: combinedItem.item.name,
                    isLeader: true,
                }));
                const attachedModels = (attachedUnit.models || []).map((model) => ({
                    ...model,
                    sourceUnit: attachedUnit.name,
                    isLeader: false,
                }));
                return [...leaderModels, ...attachedModels];
            }
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

        if (combinedItem?.isCombined && combinedItem.item.leading) {
            // Find the attached unit
            const attachedUnit = selectedList.items.find((u) => u.id === combinedItem.item.leading?.id && u.name === combinedItem.item.leading?.name);

            if (attachedUnit && attachedUnit.models && attachedUnit.models.length > 0) {
                // Auto-select the first model from the attached unit (non-leader)
                // This only happens when the unit first changes, not on subsequent model selections
                onUnitModelChange(attachedUnit.models[0]);
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

    // Collect defensive bonuses from leader abilities when a combined unit is selected
    const leaderDefensiveBonuses = useMemo(() => {
        if (!unit || !attachedUnit) {
            return { saveBonuses: [], feelNoPain: null, otherBonuses: [] };
        }

        // Create a unit context to collect abilities
        const unitContext: UnitContext = {
            datasheet: unit,
            selectedModel: unit.models?.[0],
            state: createDefaultCombatStatus(),
            attachedLeader: attachedUnit,
        };

        // Collect all mechanics from the unit and attached leader
        const mechanics = collectUnitAbilities(unitContext, "defender");

        // Filter to only mechanics that apply when leading
        const leaderMechanics = mechanics.filter((m) => {
            const hasLeadingCondition = m.conditions?.some((c) => c.state === "isLeadingUnit" || c.state === "leading" || (Array.isArray(c.state) && (c.state.includes("isLeadingUnit") || c.state.includes("leading"))));
            return hasLeadingCondition;
        });

        return extractDefensiveBonuses(leaderMechanics);
    }, [unit, attachedUnit]);

    const handleUnitSelect = (combined: { item: ArmyListItem; displayName: string; isCombined: boolean }) => {
        onUnitChange(combined.item);
    };

    return (
        <section className="grid grid-cols-5 grid-rows-[auto_1fr_auto] gap-4 p-4 border-1 border-skarsnikGreen rounded overflow-auto">
            <header className="col-span-5 flex">
                <Dropdown options={listOptions} selectedLabel={selectedList?.name} placeholder="Select list..." onSelect={(list) => onListChange(list.id)} triggerClassName="grow-1 max-w-[150px] rounded-tr-none rounded-br-none" />
                <SearchableDropdown options={unitOptions} selectedLabel={selectedUnitDisplayName} placeholder="Search for a unit..." searchPlaceholder="Search units..." emptyMessage="No unit found." onSelect={handleUnitSelect} renderOption={(combined) => <span className="text-blockcaps-m">{combined.displayName}</span>} triggerClassName="grow-999 rounded-tl-none rounded-bl-none border-nocturneGreen border-l-1" />
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
                        {attachedUnit && (leaderDefensiveBonuses.saveBonuses.length > 0 || leaderDefensiveBonuses.feelNoPain || leaderDefensiveBonuses.otherBonuses.length > 0) && (
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
            <div id="stratagems" />
        </section>
    );
}

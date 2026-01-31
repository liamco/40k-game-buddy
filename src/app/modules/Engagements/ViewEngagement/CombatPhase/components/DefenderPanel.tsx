import React, { useMemo } from "react";

import type { EngagementForce, EngagementForceItemCombatState } from "#types/Engagements";
import type { WeaponProfile, Model, GamePhase } from "#types/index";

import { type UnitSelectItem, hasPrecisionAttribute } from "../utils/combatUtils";

import Dropdown, { type DropdownOption } from "#components/Dropdown/Dropdown";
import SplitHeading from "#components/SplitHeading/SplitHeading";
import ModelProfileCard from "#components/ModelProfileCard/ModelProfileCard";
import CombatStatusPanel from "./CombatStatusPanel";

interface DefenderPanelProps {
    gamePhase: GamePhase;
    force: EngagementForce;
    unitItems: UnitSelectItem[];
    selectedUnit: UnitSelectItem | undefined;
    onUnitChange: (unit: UnitSelectItem) => void;
    selectedModel: Model | null;
    onModelChange: (model: Model | null) => void;
    selectedWeaponProfile: WeaponProfile | null;
    onCombatStatusChange: (updates: Partial<EngagementForceItemCombatState>) => void;
}

export function DefenderPanel({ gamePhase, force, unitItems, selectedUnit, onUnitChange, selectedModel, onModelChange, selectedWeaponProfile, onCombatStatusChange }: DefenderPanelProps) {
    // Convert unit items to dropdown options
    const unitOptions = useMemo((): DropdownOption<UnitSelectItem>[] => {
        return unitItems.map((unit) => ({
            id: unit.item.listItemId,
            label: unit.displayName,
            data: unit,
        }));
    }, [unitItems]);

    // Get available models for the selected unit
    const availableModels = useMemo(() => {
        if (!selectedUnit) return [];
        return selectedUnit.item.models || [];
    }, [selectedUnit]);

    // Check if weapon has precision attribute
    const hasPrecision = hasPrecisionAttribute(selectedWeaponProfile);

    const handleUnitSelect = (unit: UnitSelectItem) => {
        onUnitChange(unit);
    };

    const combatState = selectedUnit?.item.combatState;
    const startingStrength = selectedUnit?.item.modelInstances?.length || 0;

    // Determine which models are leaders (for PRECISION targeting)
    const leaderSourceNames = useMemo(() => {
        if (!selectedUnit?.item.sourceUnits) return new Set<string>();
        return new Set(selectedUnit.item.sourceUnits.filter((s) => s.isLeader).map((s) => s.name));
    }, [selectedUnit]);

    return (
        <section className="grid p-4 pr-[2px] space-y-6 grid-rows-[auto_auto_1fr] border-1 border-skarsnikGreen rounded overflow-auto h-[calc(100vh-161.5px)]" style={{ scrollbarGutter: "stable" }}>
            <Dropdown
                options={unitOptions}
                selectedLabel={selectedUnit?.displayName}
                placeholder="Select defending unit..."
                searchable
                searchPlaceholder="Search units..."
                emptyMessage="No units found"
                onSelect={handleUnitSelect}
                renderOption={(unit) => <span className="text-blockcaps-m">{unit.displayName}</span>}
                triggerClassName="grow-1 rounded-l-none border-l-0"
            />

            {combatState && selectedUnit && <CombatStatusPanel side="defender" combatState={combatState} modelCount={combatState.modelCount} startingStrength={startingStrength} onModelCountChange={() => {}} onCombatStatusChange={onCombatStatusChange} unit={selectedUnit.item} />}

            {selectedUnit ? (
                <div className="space-y-4">
                    <SplitHeading label="Select target model" />

                    <div className="space-y-2">
                        {availableModels.map((model, idx) => {
                            const isSelected = selectedModel?.name === model.name;

                            // For combined units, check if this model belongs to a leader unit
                            // by checking if any modelInstance with this model's line is from a leader
                            const modelInstance = selectedUnit.item.modelInstances?.find((m) => m.modelTypeLine === idx);
                            const isLeaderModel = modelInstance?.sourceUnitName ? leaderSourceNames.has(modelInstance.sourceUnitName) : false;
                            const isDisabled = isLeaderModel && !hasPrecision;

                            return <ModelProfileCard key={`${model.name}-${idx}`} model={model} isSelected={isSelected} isDisabled={isDisabled} onUnitModelChange={onModelChange} />;
                        })}
                    </div>

                    {availableModels.length === 0 && <p className="text-blockcaps-s opacity-50">No model profiles available</p>}
                </div>
            ) : (
                <div className="flex items-center justify-center p-8">
                    <p className="text-blockcaps-m opacity-50">Select a defending unit</p>
                </div>
            )}
        </section>
    );
}

export default DefenderPanel;

import React, { useMemo } from "react";

import type { EngagementForce, EngagementForceItem, EngagementForceItemCombatState } from "#types/Engagements";
import type { WeaponProfile, Model, GamePhase } from "#types/index";

import { type CombinedUnitItem, getCombinedModels, hasPrecisionAttribute } from "../utils/combatUtils";

import Dropdown, { type DropdownOption } from "#components/Dropdown/Dropdown";
import SplitHeading from "#components/SplitHeading/SplitHeading";
import ModelProfileCard from "#components/ModelProfileCard/ModelProfileCard";
import CombatStatusPanel from "./CombatStatusPanel";
import BaseIcon from "#components/icons/BaseIcon";
import IconSkull from "#components/icons/IconSkull";

interface DefenderPanelProps {
    gamePhase: GamePhase;
    force: EngagementForce;
    combinedItems: CombinedUnitItem[];
    selectedCombined: CombinedUnitItem | undefined;
    onUnitChange: (combined: CombinedUnitItem) => void;
    selectedModel: Model | null;
    onModelChange: (model: Model | null) => void;
    selectedWeaponProfile: WeaponProfile | null;
    modelCount: number;
    startingStrength: number;
    onModelCountChange: (count: number) => void;
    onCombatStatusChange: (updates: Partial<EngagementForceItemCombatState>) => void;
}

export function DefenderPanel({ gamePhase, force, combinedItems, selectedCombined, onUnitChange, selectedModel, onModelChange, selectedWeaponProfile, modelCount, startingStrength, onModelCountChange, onCombatStatusChange }: DefenderPanelProps) {
    // Convert combined items to dropdown options
    const unitOptions = useMemo((): DropdownOption<CombinedUnitItem>[] => {
        return combinedItems.map((combined) => ({
            id: combined.item.listItemId,
            label: combined.displayName,
            data: combined,
        }));
    }, [combinedItems]);

    // Get available models for the selected unit
    const availableModels = useMemo(() => {
        if (!selectedCombined) return [];
        return getCombinedModels(selectedCombined);
    }, [selectedCombined]);

    // Check if weapon has precision attribute
    const hasPrecision = hasPrecisionAttribute(selectedWeaponProfile);

    const handleUnitSelect = (combined: CombinedUnitItem) => {
        onUnitChange(combined);
    };

    const combatState = selectedCombined?.item.combatState;

    return (
        <section className="grid p-6 space-y-6  grid-rows-[auto_auto_1fr] border-1 border-skarsnikGreen rounded overflow-hidden">
            <Dropdown
                options={unitOptions}
                selectedLabel={selectedCombined?.displayName}
                placeholder="Select defending unit..."
                searchable
                searchPlaceholder="Search units..."
                emptyMessage="No units found"
                onSelect={handleUnitSelect}
                renderOption={(combined) => <span className="text-blockcaps-m">{combined.displayName}</span>}
                triggerClassName="grow-1 rounded-l-none border-l-0"
            />

            {combatState && <CombatStatusPanel side="defender" combatState={combatState} modelCount={modelCount} startingStrength={startingStrength} onModelCountChange={onModelCountChange} onCombatStatusChange={onCombatStatusChange} unit={selectedCombined.item} />}

            {selectedCombined ? (
                <div className="overflow-auto">
                    <div className="col-span-3 space-y-4">
                        <SplitHeading label="Select target model" />

                        <div className="space-y-2">
                            {availableModels.map((model) => {
                                const modelWithSource = model as Model & {
                                    sourceUnit?: string;
                                    isLeader?: boolean;
                                };
                                const isSelected = selectedModel?.name === model.name;
                                const modelKey = modelWithSource.sourceUnit ? `${modelWithSource.sourceUnit}-${model.name}` : model.name;

                                // Leader models are disabled unless weapon has PRECISION
                                const isLeaderModel = modelWithSource.isLeader === true;
                                const isDisabled = isLeaderModel && !hasPrecision;

                                return <ModelProfileCard key={modelKey} model={model} isSelected={isSelected} isDisabled={isDisabled} onUnitModelChange={onModelChange} />;
                            })}
                        </div>

                        {availableModels.length === 0 && <p className="text-blockcaps-s opacity-50">No model profiles available</p>}
                    </div>
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

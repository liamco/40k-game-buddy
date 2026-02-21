import React, { useState, useMemo, Fragment } from "react";

import type { EngagementForce, EngagementForceItemCombatState } from "#types/Engagements";
import type { Model, GamePhase } from "#types/index";

import { type UnitSelectItem, type SelectedWeapon, hasPrecisionAttribute } from "../utils/combatUtils";

import Dropdown, { type DropdownOption } from "#components/Dropdown/Dropdown";
import SplitHeading from "#components/SplitHeading/SplitHeading";
import ModelProfileCard from "#components/ModelProfileCard/ModelProfileCard";
import CombatStatusPanel from "./CombatStatusPanel";
import UnitInfoDialog from "./UnitInfoDialog";
import { StratagemDialog, useStratagems } from "./StratagemDialog";
import EmptyState from "#components/EmptyState/EmptyState.tsx";
import IconSkull from "#components/icons/IconSkull.tsx";
import { Badge } from "#components/Badge/Badge.tsx";
import { Button } from "#components/Button/Button.tsx";
import BaseIcon from "#components/icons/BaseIcon.tsx";
import { InfoIcon } from "lucide-react";

interface DefenderPanelProps {
    gamePhase: GamePhase;
    force: EngagementForce;
    unitItems: UnitSelectItem[];
    selectedUnit: UnitSelectItem | undefined;
    onUnitChange: (unit: UnitSelectItem) => void;
    selectedModel: Model | null;
    onModelChange: (model: Model | null) => void;
    selectedWeapon: SelectedWeapon | null;
    onCombatStatusChange: (updates: Partial<EngagementForceItemCombatState>) => void;
}

export function DefenderPanel({ gamePhase, force, unitItems, selectedUnit, onUnitChange, selectedModel, onModelChange, selectedWeapon, onCombatStatusChange }: DefenderPanelProps) {
    const [infoOpen, setInfoOpen] = useState(false);
    const [stratagemOpen, setStratagemOpen] = useState(false);
    const { grouped: stratagemGrouped, totalCount: stratagemCount } = useStratagems(force, gamePhase, "defender");

    // Convert unit items to dropdown options
    const unitOptions = useMemo((): DropdownOption<UnitSelectItem>[] => {
        return unitItems.map((unit) => ({
            id: unit.item.listItemId,
            label: unit.displayName,
            data: unit,
        }));
    }, [unitItems]);

    // Get available models for the selected unit, preserving original index for leader detection
    const availableModels = useMemo(() => {
        if (!selectedUnit) return [];
        const models = selectedUnit.item.models || [];
        // Attach original index to each model for leader detection
        return models.map((model, idx) => ({ model, originalIdx: idx }));
    }, [selectedUnit]);

    // Check if weapon has precision attribute
    const hasPrecision = hasPrecisionAttribute(selectedWeapon);

    const handleUnitSelect = (unit: UnitSelectItem) => {
        onUnitChange(unit);
    };

    const combatState = selectedUnit?.item.combatState;
    const startingStrength = selectedUnit?.item.modelInstances?.length || 0;

    // For combined units, determine which model indices belong to leaders.
    // Models are merged as: [...leaderModels, ...bodyguardModels]
    // So we need to count how many models came from leaders to know the cutoff index.
    const leaderModelCount = useMemo(() => {
        if (!selectedUnit?.item.sourceUnits) return 0;
        const leaderNames = new Set(selectedUnit.item.sourceUnits.filter((s) => s.isLeader).map((s) => s.name));
        const instances = selectedUnit.item.modelInstances || [];
        const leaderModelTypes = new Set<string>();
        instances.forEach((m) => {
            if (m.sourceUnitName && leaderNames.has(m.sourceUnitName)) {
                leaderModelTypes.add(`${m.sourceUnitName}-${m.modelTypeLine}`);
            }
        });
        return leaderModelTypes.size;
    }, [selectedUnit]);

    // Check if all bodyguard models are dead - if so, leaders become targetable without PRECISION
    const allBodyguardsKilled = useMemo(() => {
        if (!selectedUnit?.item.sourceUnits || selectedUnit.item.sourceUnits.length <= 1) return false;

        const instances = selectedUnit.item.modelInstances || [];
        const deadModelIds = selectedUnit.item.combatState?.deadModelIds || [];
        const bodyguardNames = new Set(selectedUnit.item.sourceUnits.filter((s) => !s.isLeader).map((s) => s.name));

        // Find all bodyguard model instances
        const bodyguardInstances = instances.filter((m) => m.sourceUnitName && bodyguardNames.has(m.sourceUnitName));

        // If no bodyguard instances, leaders are targetable
        if (bodyguardInstances.length === 0) return true;

        // Check if all bodyguard instances are dead
        return bodyguardInstances.every((m) => deadModelIds.includes(m.instanceId));
    }, [selectedUnit, combatState?.deadModelIds]);

    // Sort models: bodyguard first, leaders last (for combined units)
    const sortedModels = useMemo(() => {
        if (!selectedUnit?.item.sourceUnits || selectedUnit.item.sourceUnits.length <= 1) {
            return availableModels;
        }
        // Sort so non-leaders (originalIdx >= leaderModelCount) come first
        return [...availableModels].sort((a, b) => {
            const aIsLeader = a.originalIdx < leaderModelCount;
            const bIsLeader = b.originalIdx < leaderModelCount;
            if (aIsLeader === bIsLeader) return 0;
            return aIsLeader ? 1 : -1; // Leaders go last
        });
    }, [availableModels, leaderModelCount, selectedUnit]);

    return (
        <section className="grid pr-[2px] space-y-4 grid-rows-[auto_auto_auto_1fr_auto] overflow-auto h-[calc(100vh-108px)]" style={{ scrollbarGutter: "stable" }}>
            <SplitHeading label="Target unit" labelClassName="text-blockcaps-xs" />
            <div className="flex gap-2 items-center">
                <Dropdown
                    options={unitOptions}
                    selectedLabel={selectedUnit?.displayName}
                    placeholder="Select defending unit..."
                    searchable
                    searchPlaceholder="Search units..."
                    emptyMessage="No units found"
                    onSelect={handleUnitSelect}
                    optionClassName={(unit) => (unit.item.combatState.isDestroyed ? "bg-wordBearersRed hover:bg-wordBearersRed hover:text-wildRiderRed text-wildRiderRed" : "")}
                    renderOption={(unit) => (
                        <div className="flex p-2 items-center justify-between">
                            <span className="text-blockcaps-m">{unit.displayName}</span> {unit.item.combatState.isDestroyed ? <Badge variant="destructive">Unit destroyed</Badge> : null}
                        </div>
                    )}
                    triggerClassName="grow-1 rounded-l-none border-l-0"
                />
                <Button variant="ghostSecondary" className="h-full border border-deathWorldForest rounded" disabled={!selectedUnit} onClick={() => selectedUnit && setInfoOpen(true)}>
                    <BaseIcon>
                        <InfoIcon />
                    </BaseIcon>
                </Button>
            </div>

            {selectedUnit && <UnitInfoDialog unit={selectedUnit.item} open={infoOpen} onOpenChange={setInfoOpen} />}

            {/* No unit selected */}
            {!selectedUnit && (
                <div className="flex items-center justify-center p-8">
                    <p className="text-blockcaps-m opacity-50">Select a defending unit</p>
                </div>
            )}

            {/* Combat status panel - shown when unit is selected (alive or destroyed) */}
            {selectedUnit && combatState && (
                <CombatStatusPanel side="defender" gamePhase={gamePhase} combatState={combatState} modelCount={combatState.modelCount} startingStrength={startingStrength} onModelCountChange={() => {}} onCombatStatusChange={onCombatStatusChange} unit={selectedUnit.item} />
            )}

            {/* Unit selected and alive - show model selection */}
            {selectedUnit && !combatState?.isDestroyed && (
                <Fragment>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {sortedModels.map(({ model, originalIdx }) => {
                                const isSelected = selectedModel?.name === model.name;

                                // For combined units, leader models come first in the original array.
                                // Models at originalIdx < leaderModelCount are leaders and need PRECISION to target,
                                // UNLESS all bodyguard models have been killed.
                                const isLeaderModel = selectedUnit?.item.sourceUnits && selectedUnit.item.sourceUnits.length > 1 && originalIdx < leaderModelCount;
                                const isDisabled = isLeaderModel && !hasPrecision && !allBodyguardsKilled;

                                // Check if all model instances of this profile are dead
                                // For combined units, match by sourceUnitName using originalIdx
                                // For single units, match all instances to the single profile
                                const instances = selectedUnit.item.modelInstances || [];
                                const deadModelIds = combatState?.deadModelIds || [];
                                const sourceUnits = selectedUnit.item.sourceUnits;

                                let profileInstances: typeof instances;
                                if (sourceUnits && sourceUnits.length > 1) {
                                    // Combined unit: originalIdx maps to sourceUnits order (leaders first, then bodyguard)
                                    // Models are merged as [...leaderModels, ...bodyguardModels]
                                    const sourceUnit = sourceUnits[originalIdx];
                                    if (sourceUnit) {
                                        profileInstances = instances.filter((m) => m.sourceUnitName === sourceUnit.name);
                                    } else {
                                        profileInstances = [];
                                    }
                                } else {
                                    // Single unit: all instances belong to this profile
                                    profileInstances = instances;
                                }
                                const isDestroyed = profileInstances.length > 0 && profileInstances.every((m) => deadModelIds.includes(m.instanceId));

                                return (
                                    <ModelProfileCard
                                        key={`${model.name}-${originalIdx}`}
                                        model={model}
                                        abilities={selectedUnit.item.abilities}
                                        wargearAbilities={(selectedUnit.item as any).resolvedWargearAbilities}
                                        isSelected={isSelected}
                                        isDisabled={isDisabled}
                                        isDestroyed={isDestroyed}
                                        onUnitModelChange={onModelChange}
                                    />
                                );
                            })}
                        </div>

                        {sortedModels.length === 0 && <p className="text-blockcaps-s opacity-50">No model profiles available</p>}
                    </div>
                    <footer className="pt-2">
                        <Button variant="ghostSecondary" className="w-full border border-deathWorldForest" onClick={() => setStratagemOpen(true)}>
                            {stratagemCount} Defender {stratagemCount === 1 ? "stratagem" : "stratagems"} available
                        </Button>
                        <StratagemDialog side="defender" gamePhase={gamePhase} force={force} grouped={stratagemGrouped} totalCount={stratagemCount} open={stratagemOpen} onOpenChange={setStratagemOpen} />
                    </footer>
                </Fragment>
            )}

            {/* Unit selected but destroyed */}
            {selectedUnit && combatState?.isDestroyed && (
                <div className="flex items-center justify-center p-8 text-wildRiderRed border-2 border-wildRiderRed">
                    <EmptyState variant="red" label="Everyones dead Dave" leadingIcon={<IconSkull />} />
                </div>
            )}
        </section>
    );
}

export default DefenderPanel;

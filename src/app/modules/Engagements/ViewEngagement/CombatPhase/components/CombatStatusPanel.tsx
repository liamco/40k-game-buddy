import { Fragment, useState } from "react";
import { Plus, Minus } from "lucide-react";

import { Button } from "#components/Button/Button.tsx";
import Dropdown from "#components/Dropdown/Dropdown.tsx";
import type { GamePhase } from "../../../../types";
import type { EngagementForceItem, EngagementForceItemCombatState, EngagementModelInstance } from "#types/Engagements";
import { calculateUnitStrength, getUnitStrengthLabel } from "../../../EngagementManagerContext";

import CombatStatusToken from "./CombatStatusToken/CombatStatusToken";
import { CasualtyPanel } from "./CasualtyPanel";
import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconSkull from "#components/icons/IconSkull.tsx";

interface CombatStatusPanelProps {
    side: "attacker" | "defender";
    gamePhase?: GamePhase;
    combatState: EngagementForceItemCombatState;
    modelCount: number;
    startingStrength: number;
    onModelCountChange: (count: number) => void;
    onCombatStatusChange: (updates: Partial<EngagementForceItemCombatState>) => void;
    unit: EngagementForceItem;
}

type ObjectiveRangeValue = EngagementForceItemCombatState["isInObjectiveRange"];

interface ObjectiveRangeOption {
    value: ObjectiveRangeValue;
}

const objectiveRangeOptions: { id: string; label: string; data: ObjectiveRangeOption }[] = [
    { id: "none", label: "None", data: { value: "none" } },
    { id: "friendly", label: "Friendly Objective", data: { value: "friendly" } },
    { id: "enemy", label: "Enemy Objective", data: { value: "enemy" } },
    { id: "contested", label: "Contested Objective", data: { value: "contested" } },
];

export function CombatStatusPanel({ side, gamePhase, combatState, startingStrength, onModelCountChange, onCombatStatusChange, unit }: CombatStatusPanelProps) {
    const [casualtyPanelOpen, setCasualtyPanelOpen] = useState(false);

    // Max wounds for single-model units
    const maxWounds = unit.models[0]?.w || 1;

    const handleBooleanToggle = (key: keyof EngagementForceItemCombatState) => (checked: boolean) => {
        onCombatStatusChange({ [key]: checked });
    };

    const handleCasualtyChange = (deadModelIds: string[]) => {
        const totalModels = unit.modelInstances?.length || 0;
        const aliveCount = totalModels - deadModelIds.length;
        const unitStrength = calculateUnitStrength(aliveCount, startingStrength);
        onModelCountChange(aliveCount);
        onCombatStatusChange({ deadModelIds, unitStrength, isDestroyed: aliveCount === 0 ? true : false });
    };

    // Calculate unit strength based on wounds for single-model units
    const calculateWoundStrength = (current: number, max: number): "full" | "belowStarting" | "belowHalf" => {
        if (current === max) return "full";
        if (current > max / 2) return "belowStarting";
        return "belowHalf";
    };

    const handleWoundsIncrement = () => {
        const currentWounds = combatState.currentWounds;
        if (currentWounds >= maxWounds) return;

        const newWounds = currentWounds + 1;
        const isDamaged = unit.damaged ? newWounds <= unit.damaged.threshold : false;

        onCombatStatusChange({
            currentWounds: newWounds,
            isDamaged,
            isDestroyed: false,
            unitStrength: calculateWoundStrength(newWounds, maxWounds),
        });
    };

    const handleWoundsDecrement = () => {
        const currentWounds = combatState.currentWounds;
        if (currentWounds <= 0) return;

        const newWounds = currentWounds - 1;
        const isDamaged = unit.damaged ? newWounds <= unit.damaged.threshold : false;
        const isDestroyed = newWounds === 0;

        onCombatStatusChange({
            currentWounds: newWounds,
            isDamaged,
            isDestroyed,
            unitStrength: calculateWoundStrength(newWounds, maxWounds),
        });
    };

    const handleCasualtyIncrement = () => {
        const deadIds = combatState.deadModelIds || [];
        if (deadIds.length === 0) return;
        const newDeadIds = deadIds.slice(0, -1);
        handleCasualtyChange(newDeadIds);
    };

    const handleCasualtyDecrement = () => {
        const instances = unit.modelInstances || [];
        const deadIds = combatState.deadModelIds || [];
        if (deadIds.length >= instances.length) return;
        const aliveModels = instances.filter((m: EngagementModelInstance) => !deadIds.includes(m.instanceId));
        const lastAliveModel = aliveModels[aliveModels.length - 1];
        if (lastAliveModel) {
            handleCasualtyChange([...deadIds, lastAliveModel.instanceId]);
        }
    };

    const handleObjectiveRangeChange = (option: ObjectiveRangeOption) => {
        onCombatStatusChange({ isInObjectiveRange: option.value });
    };

    const currentObjectiveLabel = objectiveRangeOptions.find((o) => o.data.value === combatState.isInObjectiveRange)?.label || "None";

    // Use single-model wound display for vehicles/monsters with damaged mechanic or single-model units
    const useSingleModelDisplay = () => {
        if (unit.damaged) return true;
        if (unit.modelInstances && unit.modelInstances.length === 1) return true;
        return false;
    };

    const getUnitStrengthLabelColour = () => {
        switch (combatState.unitStrength) {
            case "full":
                return "text-skarsnikGreen";
            case "belowStarting":
                return "text-fireDragonBright";
            case "belowHalf":
                return "text-wildRiderRed";
        }
    };

    const getWoundsColour = () => {
        if (combatState.isDestroyed) return "text-wildRiderRed";
        if (combatState.isDamaged) return "text-wildRiderRed";
        if (combatState.unitStrength === "belowHalf") return "text-wildRiderRed";
        if (combatState.unitStrength === "belowStarting") return "text-fireDragonBright";
        return "text-skarsnikGreen";
    };

    const calculateUnitGridCols = () => {
        if (!unit.modelInstances) return 1;
        if (unit.modelInstances.length <= 5) return unit.modelInstances.length;
        return Math.ceil(unit.modelInstances.length / 2);
    };

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                {useSingleModelDisplay() ? (
                    <Fragment>
                        <div className="space-y-1">
                            <span className={`text-blockcaps-s ${getUnitStrengthLabelColour()} block`}>{!combatState.isDestroyed ? getUnitStrengthLabel(combatState.unitStrength) : "Unit destroyed"}</span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleWoundsDecrement}
                                    disabled={combatState.currentWounds <= 0 || combatState.isDestroyed}
                                    className={`cursor-pointer p-2 rounded bg-fireDragonBright text-mournfangBrown transition-colors ${combatState.currentWounds <= 0 || combatState.isDestroyed ? "bg-fireDragonBright/30 !cursor-not-allowed" : ""}`}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleWoundsIncrement}
                                    disabled={combatState.currentWounds >= maxWounds}
                                    className={`cursor-pointer p-2 rounded bg-fireDragonBright text-mournfangBrown transition-colors ${combatState.currentWounds >= maxWounds ? "bg-fireDragonBright/30 !cursor-not-allowed" : ""}`}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="text-title-xl !tracking-[0.1em] space-x-1">
                                <span className="text-skarsnikGreen">W</span>
                                <span className={getWoundsColour()}>{combatState.currentWounds}</span>
                                <span className="text-skarsnikGreen/80">/{maxWounds}</span>
                            </div>
                            {unit.damaged && combatState.isDamaged && !combatState.isDestroyed && <div className="inline-block px-2 py-1 bg-wordBearersRed/80 border border-wildRiderRed rounded text-wildRiderRed text-blockcaps-s">Severely Damaged</div>}
                        </div>
                    </Fragment>
                ) : (
                    <Fragment>
                        <div className="space-y-1">
                            <span className={`text-blockcaps-s ${getUnitStrengthLabelColour()} block`}>{!combatState.isDestroyed ? getUnitStrengthLabel(combatState.unitStrength) : "Unit destroyed"}</span>

                            <div className="flex items-center gap-2">
                                <button onClick={handleCasualtyDecrement} disabled={combatState.isDestroyed} className={`cursor-pointer p-2 rounded bg-fireDragonBright text-mournfangBrown transition-colors ${combatState.isDestroyed ? "bg-fireDragonBright/30 !cursor-not-allowed" : ""}`}>
                                    <Minus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleCasualtyIncrement}
                                    disabled={combatState.unitStrength === "full"}
                                    className={`cursor-pointer p-2 rounded bg-fireDragonBright text-mournfangBrown transition-colors ${combatState.unitStrength === "full" ? "bg-fireDragonBright/30 !cursor-not-allowed" : ""}`}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <Button variant="unstyled" className="block" onClick={() => setCasualtyPanelOpen(true)}>
                            <ul className={`inline-grid gap-1 list-none m-0 p-0`} style={{ gridTemplateColumns: `repeat(${calculateUnitGridCols()}, minmax(0, 1fr))`, direction: "rtl" }}>
                                {unit.modelInstances?.map((m: EngagementModelInstance) => (
                                    <li key={m.instanceId} className={` !mt-0 ${combatState.deadModelIds.includes(m.instanceId) ? "bg-wordBearersRed" : "bg-deathWorldForest"} p-1`}>
                                        <BaseIcon size="small" color={combatState.deadModelIds.includes(m.instanceId) ? "wildRiderRed" : "default"}>
                                            <IconSkull />
                                        </BaseIcon>
                                    </li>
                                ))}
                            </ul>
                        </Button>
                    </Fragment>
                )}
            </div>
            <div className={`flex justify-between items-center ${combatState.isDestroyed ? "cursor-not-allowed opacity-50" : ""}`}>
                <div className="relative grow max-w-[15rem]">
                    <span className="text-blockcaps-s">In Obj Range</span>
                    <Dropdown variant="minimal" disabled={combatState.isDestroyed} triggerClassName="w-full" options={objectiveRangeOptions} selectedLabel={currentObjectiveLabel} placeholder="Select..." onSelect={handleObjectiveRangeChange} />
                </div>
                <div className="flex gap-2">
                    <CombatStatusToken disabled={combatState.isDestroyed} icon={combatState.movementBehaviour} active />

                    {side === "attacker" && <></>}
                    {side === "defender" && gamePhase !== "fight" && (
                        <>
                            <CombatStatusToken disabled={combatState.isDestroyed} variant="highlight" icon="cover" active={combatState.isInCover} onChange={handleBooleanToggle("isInCover")} />
                        </>
                    )}
                    <CombatStatusToken disabled={combatState.isDestroyed} icon="shock" variant="destructive" active={combatState.isBattleShocked} onChange={handleBooleanToggle("isBattleShocked")} />
                </div>
            </div>
            <CasualtyPanel open={casualtyPanelOpen} onOpenChange={setCasualtyPanelOpen} unit={unit} deadModelIds={combatState.deadModelIds || []} onCasualtyChange={handleCasualtyChange} />
        </section>
    );
}

export default CombatStatusPanel;

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
import IconShock from "#components/icons/IconShock.tsx";
import IconDefender from "#components/icons/IconDefender.tsx";

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
    { id: "friendly", label: "Friendly", data: { value: "friendly" } },
    { id: "enemy", label: "Enemy", data: { value: "enemy" } },
    { id: "contested", label: "Contested", data: { value: "contested" } },
];

export function CombatStatusPanel({ side, gamePhase, combatState, startingStrength, onModelCountChange, onCombatStatusChange, unit }: CombatStatusPanelProps) {
    const [casualtyPanelOpen, setCasualtyPanelOpen] = useState(false);

    // Max wounds for single-model units
    const maxWounds = unit.models[0]?.w || 1;

    const handleBooleanToggle = (key: "isBattleShocked" | "isInCover") => {
        onCombatStatusChange({ [key]: !combatState[key] });
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
        <section className="grid grid-cols-6 gap-2">
            <div className="row-span-2 col-span-3 p-3 border border-deathWorldForest flex flex-col justify-between">
                <span className={`text-blockcaps-xs-tight opacity-75 ${getUnitStrengthLabelColour()} block`}>{!combatState.isDestroyed ? getUnitStrengthLabel(combatState.unitStrength) : "Unit destroyed"}</span>
                {useSingleModelDisplay() ? (
                    <div className="flex justify-between">
                        <div className="text-right space-y-1">
                            <div className="text-title-xl !tracking-[0.1em] space-x-1">
                                <span className="text-skarsnikGreen">W</span>
                                <span className={getWoundsColour()}>{combatState.currentWounds}</span>
                                <span className="text-skarsnikGreen/80">/{maxWounds}</span>
                            </div>
                            {unit.damaged && combatState.isDamaged && !combatState.isDestroyed && <div className="inline-block px-2 py-1 bg-wordBearersRed/80 border border-wildRiderRed rounded text-wildRiderRed text-blockcaps-s">Severely Damaged</div>}
                        </div>
                        <div className={`flex items-center border ${combatState.isDamaged ? "text-wildRiderRed border-wildRiderRed" : "text-fireDragonBright border-mournfangBrown"}`}>
                            <button
                                onClick={handleWoundsDecrement}
                                disabled={combatState.currentWounds <= 0 || combatState.isDestroyed}
                                className={`cursor-pointer p-2 hover:bg-mournfangBrown transition-colors ${combatState.currentWounds <= 0 || combatState.isDestroyed ? "!cursor-not-allowed" : ""}`}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <button onClick={handleWoundsIncrement} disabled={combatState.currentWounds >= maxWounds} className={`border-l cursor-pointer p-2 hover:bg-mournfangBrown transition-colors ${combatState.currentWounds >= maxWounds ? "!cursor-not-allowed" : ""}`}>
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-end">
                        <Button variant="unstyled" className="block" onClick={() => setCasualtyPanelOpen(true)}>
                            <ul className={`inline-grid gap-1 list-none m-0 p-0`} style={{ gridTemplateColumns: `repeat(${calculateUnitGridCols()}, minmax(0, 1fr))` }}>
                                {unit.modelInstances?.map((m: EngagementModelInstance) => (
                                    <li key={m.instanceId} className={` !mt-0 ${combatState.deadModelIds.includes(m.instanceId) ? "bg-wordBearersRed" : "bg-deathWorldForest"} p-0.5`}>
                                        <BaseIcon size="small" color={combatState.deadModelIds.includes(m.instanceId) ? "wildRiderRed" : "default"}>
                                            <IconSkull />
                                        </BaseIcon>
                                    </li>
                                ))}
                            </ul>
                        </Button>
                        <div className={`flex items-center border ${combatState.isDamaged ? "text-wildRiderRed border-wildRiderRed" : "text-fireDragonBright border-mournfangBrown"}`}>
                            <button onClick={handleCasualtyDecrement} disabled={combatState.isDestroyed} className={`cursor-pointer p-2 hover:bg-mournfangBrown transition-colors ${combatState.currentWounds <= 0 || combatState.isDestroyed ? "!cursor-not-allowed" : ""}`}>
                                <Minus className="w-4 h-4" />
                            </button>
                            <button onClick={handleCasualtyIncrement} disabled={combatState.unitStrength === "full"} className={`cursor-pointer p-2 hover:bg-mournfangBrown transition-colors ${combatState.currentWounds <= 0 || combatState.isDestroyed ? "!cursor-not-allowed" : ""}`}>
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
                <CasualtyPanel open={casualtyPanelOpen} onOpenChange={setCasualtyPanelOpen} unit={unit} deadModelIds={combatState.deadModelIds || []} onCasualtyChange={handleCasualtyChange} />
            </div>
            <button
                type="button"
                className={`col-span-3 space-y-2 p-3 border text-left ${combatState.isBattleShocked ? "border-wildRiderRed text-wildRiderRed shadow-glow-red" : "border-deathWorldForest"}`}
                onClick={() => {
                    handleBooleanToggle("isBattleShocked");
                }}
                disabled={combatState.isDestroyed}
            >
                <span className="text-blockcaps-s block opacity-75">Battle shock</span>
                {combatState.isBattleShocked ? (
                    <BaseIcon color={combatState.isBattleShocked ? "wildRiderRed" : "wordBearersRed"}>
                        <IconShock />
                    </BaseIcon>
                ) : (
                    <span className="block h-[1.07rem]">-</span>
                )}
            </button>
            <div className="col-span-3 space-y-2 p-3 border border-mournfangBrown text-fireDragonBright">
                <span className="text-blockcaps-s block opacity-75">Effects</span>
                {combatState.activeEffects ? (
                    <BaseIcon color="fireDragonBright">
                        <IconShock />
                    </BaseIcon>
                ) : (
                    <span className="block h-[1.07rem]">-</span>
                )}
            </div>
            <div className="col-span-2 space-y-2 p-3 border border-deathWorldForest flex flex-col justify-between">
                <span className="text-blockcaps-s opacity-75">Movement</span>
                <div className="flex justify-between items-center">
                    <span className="text-blockcaps-s">{combatState.movementBehaviour}</span>
                    <CombatStatusToken disabled={combatState.isDestroyed} icon={combatState.movementBehaviour} active />
                </div>
            </div>
            <button
                type="button"
                className={`text-left space-y-2  col-span-2 p-3 border ${combatState.isInCover ? "border-skarsnikGreen shadow-glow-green" : "border-deathWorldForest"} ${side != "defender" && gamePhase !== "fight" ? "cursor-not-allowed" : ""}`}
                onClick={() => handleBooleanToggle("isInCover")}
                disabled={(side != "defender" && gamePhase !== "fight") || combatState.isDestroyed}
            >
                <span className="text-blockcaps-s block opacity-75">In cover</span>
                {combatState.isInCover ? (
                    <BaseIcon color="skarsnikGreen">
                        <IconDefender />
                    </BaseIcon>
                ) : (
                    <span className="block h-[1.07rem]">-</span>
                )}
            </button>
            <div className="col-span-2 p-3 space-y-2 border border-deathWorldForest flex flex-col justify-between">
                <span className="text-blockcaps-s opacity-75">Near obj</span>
                <Dropdown variant="minimal" disabled={combatState.isDestroyed} triggerClassName="w-full" options={objectiveRangeOptions} selectedLabel={currentObjectiveLabel} placeholder="Select..." onSelect={handleObjectiveRangeChange} />
            </div>
        </section>
    );
}

export default CombatStatusPanel;

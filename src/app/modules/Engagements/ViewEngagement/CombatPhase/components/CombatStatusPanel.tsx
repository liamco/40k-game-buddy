import { useState } from "react";
import { Plus, Minus } from "lucide-react";

import { Button } from "#components/Button/Button.tsx";
import Dropdown from "#components/Dropdown/Dropdown.tsx";
import type { EngagementForceItem, EngagementForceItemCombatState, EngagementModelInstance } from "#types/Engagements";
import { calculateUnitStrength, getUnitStrengthLabel } from "../../../EngagementManagerContext";

import CombatStatusToken from "./CombatStatusToken/CombatStatusToken";
import { CasualtyPanel } from "./CasualtyPanel";
import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconSkull from "#components/icons/IconSkull.tsx";

interface CombatStatusPanelProps {
    side: "attacker" | "defender";
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

export function CombatStatusPanel({ side, combatState, startingStrength, onModelCountChange, onCombatStatusChange, unit }: CombatStatusPanelProps) {
    const [casualtyPanelOpen, setCasualtyPanelOpen] = useState(false);

    const handleBooleanToggle = (key: keyof EngagementForceItemCombatState) => (checked: boolean) => {
        onCombatStatusChange({ [key]: checked });
    };

    const handleMovementBehaviour = (value: EngagementForceItemCombatState["movementBehaviour"]) => () => {
        onCombatStatusChange({ movementBehaviour: value });
    };

    const handleCasualtyChange = (deadModelIds: string[]) => {
        const totalModels = unit.modelInstances?.length || 0;
        const aliveCount = totalModels - deadModelIds.length;
        const unitStrength = calculateUnitStrength(aliveCount, startingStrength);
        onModelCountChange(aliveCount);
        onCombatStatusChange({ deadModelIds, unitStrength, isDestroyed: aliveCount === 0 ? true : false });
    };

    const handleIncrement = () => {
        const deadIds = combatState.deadModelIds || [];
        if (deadIds.length === 0) return;
        const newDeadIds = deadIds.slice(0, -1);
        handleCasualtyChange(newDeadIds);
    };

    const handleDecrement = () => {
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

    console.log(unit.name, combatState.isDestroyed);

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

    const calculateUnitGridCols = () => {
        if (unit.modelInstances.length <= 5) return unit.modelInstances.length;

        return Math.ceil(unit.modelInstances.length / 2);
    };

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <Button variant="unstyled" className="block" onClick={() => setCasualtyPanelOpen(true)}>
                        <span className={`text-blockcaps-s ${getUnitStrengthLabelColour()} block`}>{!combatState.isDestroyed ? getUnitStrengthLabel(combatState.unitStrength) : "Unit destroyed"}</span>
                    </Button>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDecrement} disabled={combatState.isDestroyed} className={`cursor-pointer p-2 rounded bg-fireDragonBright text-mournfangBrown transition-colors ${combatState.isDestroyed ? "bg-fireDragonBright/30 !cursor-not-allowed" : ""}`}>
                            <Minus className="w-4 h-4" />
                        </button>
                        <button onClick={handleIncrement} disabled={combatState.unitStrength === "full"} className={`cursor-pointer p-2 rounded bg-fireDragonBright text-mournfangBrown transition-colors ${combatState.unitStrength === "full" ? "bg-fireDragonBright/30 !cursor-not-allowed" : ""}`}>
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <ul className={`inline-grid gap-1`} style={{ gridTemplateColumns: `repeat(${calculateUnitGridCols()}, minmax(0, 1fr))`, direction: "rtl" }}>
                    {unit.modelInstances.map((m: EngagementModelInstance) => (
                        <li key={m.instanceId} className={`${combatState.deadModelIds.includes(m.instanceId) ? "bg-wordBearersRed" : "bg-deathWorldForest"} p-1`}>
                            <BaseIcon size="small" color={combatState.deadModelIds.includes(m.instanceId) ? "wildRiderRed" : "default"}>
                                <IconSkull />
                            </BaseIcon>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={`flex justify-between items-center ${combatState.isDestroyed ? "cursor-not-allowed opacity-50" : ""}`}>
                <div className="relative grow max-w-[15rem]">
                    <span className="text-blockcaps-s">In Obj Range</span>
                    <Dropdown variant="minimal" disabled={combatState.isDestroyed} triggerClassName="w-full" options={objectiveRangeOptions} selectedLabel={currentObjectiveLabel} placeholder="Select..." onSelect={handleObjectiveRangeChange} />
                </div>
                <div className="flex gap-2">
                    <CombatStatusToken disabled={combatState.isDestroyed} icon={combatState.movementBehaviour} active />

                    {side === "attacker" && <></>}
                    {side === "defender" && (
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

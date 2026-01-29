import type { EngagementForceItem, EngagementForceItemCombatState } from "#types/Engagements";

import CombatStatusToken from "./CombatStatusToken/CombatStatusToken";

interface CombatStatusPanelProps {
    side: "attacker" | "defender";
    combatState: EngagementForceItemCombatState;
    modelCount: number;
    startingStrength: number;
    onModelCountChange: (count: number) => void;
    onCombatStatusChange: (updates: Partial<EngagementForceItemCombatState>) => void;
    unit: EngagementForceItem;
}

export function CombatStatusPanel({ side, combatState, onCombatStatusChange }: CombatStatusPanelProps) {
    const handleBooleanToggle = (key: keyof EngagementForceItemCombatState) => (checked: boolean) => {
        onCombatStatusChange({ [key]: checked });
    };

    const handleMovementBehaviour = (value: EngagementForceItemCombatState["movementBehaviour"]) => () => {
        onCombatStatusChange({ movementBehaviour: value });
    };

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                <div></div>
                <div className="flex gap-2">
                    {side === "attacker" && <></>}
                    {side === "defender" && (
                        <>
                            <CombatStatusToken variant="highlight" icon="cover" active={combatState.isInCover} onChange={handleBooleanToggle("isInCover")} />
                        </>
                    )}
                    <CombatStatusToken icon="shock" variant="destructive" active={combatState.isBattleShocked} onChange={handleBooleanToggle("isBattleShocked")} />
                </div>
            </div>
            <div className="flex justify-between items-center">
                <div></div>
                <div className="flex gap-1">
                    <CombatStatusToken icon="fallBack" active={combatState.movementBehaviour === "fallBack"} onChange={handleMovementBehaviour("fallBack")} />
                    <CombatStatusToken icon="holdPosition" active={combatState.movementBehaviour === "hold"} onChange={handleMovementBehaviour("hold")} />
                    <CombatStatusToken icon="move" active={combatState.movementBehaviour === "move"} onChange={handleMovementBehaviour("move")} />
                    <CombatStatusToken icon="advance" active={combatState.movementBehaviour === "advance"} onChange={handleMovementBehaviour("advance")} />
                </div>
            </div>
        </section>
    );
}

export default CombatStatusPanel;

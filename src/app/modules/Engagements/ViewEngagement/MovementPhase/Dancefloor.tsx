import { useMemo } from "react";
import { EngagementForce, EngagementForceItemCombatState } from "#types/Engagements.tsx";
import { buildUnitSelectItems, type UnitSelectItem } from "../CombatPhase/utils/combatUtils";
import UnitMovementCard from "./components/UnitMovementCard";

interface Props {
    attackingForce: EngagementForce;
    onUpdateUnitCombatState: (forceType: "attacking" | "defending", unitId: string, updates: Partial<EngagementForceItemCombatState>) => void;
}

const Dancefloor = ({ attackingForce, onUpdateUnitCombatState }: Props) => {
    const unitItems = useMemo(() => buildUnitSelectItems(attackingForce), [attackingForce]);

    const handleCombatStatusChange = (unitId: string, updates: Partial<EngagementForceItemCombatState>) => {
        onUpdateUnitCombatState("attacking", unitId, updates);
    };

    return (
        <div className="mt-6 border-1 border-skarsnikGreen">
            <div className="grid grid-cols-3 gap-6 p-6">
                {unitItems.map((unitItem) => (
                    <UnitMovementCard key={unitItem.item.listItemId} unitItem={unitItem} onCombatStatusChange={handleCombatStatusChange} />
                ))}
            </div>
        </div>
    );
};

export default Dancefloor;

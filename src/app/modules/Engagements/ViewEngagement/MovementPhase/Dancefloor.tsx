import { useMemo } from "react";
import { EngagementForce, EngagementForceItemCombatState } from "#types/Engagements.tsx";
import { buildCombinedUnitItems, type CombinedUnitItem } from "../CombatPhase/utils/combatUtils";
import UnitMovementCard from "./components/UnitMovementCard";

interface Props {
    attackingForce: EngagementForce;
    onUpdateUnitCombatState: (forceType: "attacking" | "defending", unitId: string, updates: Partial<EngagementForceItemCombatState>) => void;
}

const Dancefloor = ({ attackingForce, onUpdateUnitCombatState }: Props) => {
    const combinedItems = useMemo(() => buildCombinedUnitItems(attackingForce), [attackingForce]);

    const handleCombatStatusChange = (unitId: string, updates: Partial<EngagementForceItemCombatState>) => {
        onUpdateUnitCombatState("attacking", unitId, updates);
    };

    return (
        <div className="mt-6 border-1 border-skarsnikGreen">
            <div className="grid grid-cols-3 gap-6 p-6">
                {combinedItems.map((combined) => (
                    <UnitMovementCard key={combined.item.listItemId} combinedUnit={combined} onCombatStatusChange={handleCombatStatusChange} />
                ))}
            </div>
        </div>
    );
};

export default Dancefloor;

import { useMemo } from "react";
import { EngagementForce, EngagementForceItemCombatState } from "#types/Engagements.tsx";
import { buildUnitSelectItems } from "../CombatPhase/utils/combatUtils";
import UnitChargeCard from "./components/UnitChargeCard";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";

interface Props {
    attackingForce: EngagementForce;
    onUpdateUnitCombatState: (forceType: "attacking" | "defending", unitId: string, updates: Partial<EngagementForceItemCombatState>) => void;
}

const ChargePhase = ({ attackingForce, onUpdateUnitCombatState }: Props) => {
    const unitItems = useMemo(() => buildUnitSelectItems(attackingForce), [attackingForce]);

    const handleCombatStatusChange = (unitId: string, updates: Partial<EngagementForceItemCombatState>) => {
        onUpdateUnitCombatState("attacking", unitId, updates);
    };

    return (
        <div className="space-y-4 overflow-auto h-[calc(100vh-108px)]">
            <SplitHeading label="Available units" />
            <div className="grid grid-cols-3 gap-6">
                {unitItems.map((unitItem) => (
                    <UnitChargeCard key={unitItem.item.listItemId} unitItem={unitItem} onCombatStatusChange={handleCombatStatusChange} />
                ))}
            </div>
        </div>
    );
};

export default ChargePhase;

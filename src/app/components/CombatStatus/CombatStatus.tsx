import React from "react";
import { COMBAT_STATUS_FLAGS, type CombatStatusFlag, type CombatStatus as CombatStatusType } from "../../game-engine";
import { Checkbox } from "../_ui/checkbox.tsx";

/**
 * Defines which combat status flags are relevant for each side.
 * - attacker: statuses that affect the attacking unit
 * - defender: statuses that affect the defending unit
 * - both: statuses relevant to both sides
 */
const STATUS_RELEVANCE: Record<CombatStatusFlag, "attacker" | "defender" | "both" | "neither"> = {
    isStationary: "attacker",
    inCover: "defender",
    inEngagementRange: "neither",
    inRangeOfObjective: "both",
    inRangeOfContestedObjective: "both",
    inRangeOfFriendlyObjective: "both",
    inRangeOfEnemyObjective: "both",
    isBattleShocked: "both",
    hasFiredThisPhase: "neither",
    hasChargedThisTurn: "attacker",
    isBelowStartingStrength: "both",
    isBelowHalfStrength: "both",
    isDamaged: "both",
    isLeadingUnit: "neither",
    isBeingLed: "neither",
};

/**
 * Get combat status flags relevant for a given side.
 */
export function getStatusesForSide(side: "attacker" | "defender") {
    return COMBAT_STATUS_FLAGS.filter((status) => {
        const relevance = STATUS_RELEVANCE[status.name as CombatStatusFlag];
        return relevance === side || relevance === "both";
    });
}

interface Props {
    side: "attacker" | "defender";
    combatStatus: CombatStatusType;
    onStatusChange: (name: CombatStatusFlag, value: boolean) => void;
}

const CombatStatus = ({ side, combatStatus, onStatusChange }: Props) => {
    const relevantStatuses = getStatusesForSide(side);

    return (
        <section className="space-y-4">
            {relevantStatuses.map((status) => (
                <div key={status.name} className="flex items-center justify-between gap-2">
                    <label htmlFor={`${side}-${status.name}`} className="text-xs  font-semibold ">
                        {status.label}
                    </label>
                    <Checkbox
                        id={`${side}-${status.name}`}
                        checked={combatStatus[status.name as CombatStatusFlag]}
                        onCheckedChange={(val) => {
                            onStatusChange(status.name as CombatStatusFlag, val);
                        }}
                    />
                </div>
            ))}
        </section>
    );
};

export default CombatStatus;

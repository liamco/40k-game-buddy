import React, { useMemo } from "react";

import type { Datasheet, DamagedMechanic, GamePhase } from "../../types";

import { COMBAT_STATUS_FLAGS, type CombatStatusFlag, type CombatStatus as CombatStatusType } from "../../game-engine";

import { Badge } from "../_ui/badge";
import { Checkbox } from "../_ui/checkbox.tsx";
import { Input } from "../_ui/input";
import Dropdown, { type DropdownOption } from "../Dropdown/Dropdown";

import styles from "./CombatStatus.module.css";

/**
 * Objective range options for the dropdown
 */
type ObjectiveRangeOption = "none" | "contested" | "friendly" | "enemy";

const OBJECTIVE_OPTIONS: DropdownOption<ObjectiveRangeOption>[] = [
    { id: "none", label: "None", data: "none" },
    { id: "contested", label: "Contested Objective", data: "contested" },
    { id: "friendly", label: "Friendly Objective", data: "friendly" },
    { id: "enemy", label: "Enemy Objective", data: "enemy" },
];

/**
 * Combat status flags that should be shown as individual checkboxes (excluding objective range flags and strength flags)
 */
const CHECKBOX_STATUS_FLAGS = COMBAT_STATUS_FLAGS.filter((status) => !["inRangeOfObjective", "inRangeOfContestedObjective", "inRangeOfFriendlyObjective", "inRangeOfEnemyObjective", "isBelowStartingStrength", "isBelowHalfStrength"].includes(status.name));

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
 * Get combat status flags relevant for a given side (excluding objective and strength flags).
 */
export function getStatusesForSide(side: "attacker" | "defender") {
    return CHECKBOX_STATUS_FLAGS.filter((status) => {
        const relevance = STATUS_RELEVANCE[status.name as CombatStatusFlag];
        return relevance === side || relevance === "both";
    });
}

/**
 * Get current objective range selection from combat status
 */
function getObjectiveRangeValue(combatStatus: CombatStatusType): ObjectiveRangeOption {
    if (combatStatus.inRangeOfContestedObjective) return "contested";
    if (combatStatus.inRangeOfFriendlyObjective) return "friendly";
    if (combatStatus.inRangeOfEnemyObjective) return "enemy";
    return "none";
}

interface Props {
    side: "attacker" | "defender";
    combatStatus: CombatStatusType;
    onStatusChange: (name: CombatStatusFlag, value: boolean) => void;
    modelCount?: number;
    startingStrength?: number;
    onModelCountChange?: (count: number) => void;
    unit?: Datasheet | null;
    gamePhase?: GamePhase;
}

const CombatStatus = ({ side, combatStatus, onStatusChange, modelCount, startingStrength, onModelCountChange, unit, gamePhase }: Props) => {
    const objectiveRangeValue = getObjectiveRangeValue(combatStatus);

    // Check if unit has damaged profile (monsters/vehicles)
    const hasDamagedProfile = useMemo(() => {
        if (!unit) return false;
        const datasheet = unit as Datasheet & { damagedW?: string; damagedDescription?: string };
        return !!(datasheet.damagedW && datasheet.damagedW.trim() !== "" && datasheet.damagedDescription && datasheet.damagedDescription.trim() !== "");
    }, [unit]);

    // Get damaged penalties from unit's damagedMechanics
    const damagedPenalties = useMemo(() => {
        if (!unit) return { hitPenalty: 0, otherPenalties: [] as { attribute: string; value: number }[] };

        const datasheet = unit as Datasheet & { damagedMechanics?: DamagedMechanic[] };
        if (!datasheet.damagedMechanics || datasheet.damagedMechanics.length === 0) {
            return { hitPenalty: 0, otherPenalties: [] };
        }

        let hitPenalty = 0;
        const otherPenalties: { attribute: string; value: number }[] = [];

        for (const mechanic of datasheet.damagedMechanics) {
            if (mechanic.effect === "rollPenalty" && mechanic.attribute === "h") {
                hitPenalty += mechanic.value;
            } else if (mechanic.effect === "statPenalty" || mechanic.effect === "statBonus" || mechanic.effect === "statMultiplier") {
                const value = mechanic.effect === "statPenalty" ? -mechanic.value : mechanic.value;
                otherPenalties.push({ attribute: mechanic.attribute, value });
            }
        }

        return { hitPenalty, otherPenalties };
    }, [unit]);

    // Filter statuses based on side and conditional rules
    const relevantStatuses = useMemo(() => {
        return getStatusesForSide(side).filter((status) => {
            // Exclude isDamaged - it has its own dedicated section
            if (status.name === "isDamaged") {
                return false;
            }
            // Only show "hasChargedThisTurn" in fight phase
            if (status.name === "hasChargedThisTurn") {
                return gamePhase === "FIGHT";
            }
            return true;
        });
    }, [side, gamePhase]);

    const handleObjectiveRangeChange = (value: ObjectiveRangeOption) => {
        // Clear all objective range flags first
        onStatusChange("inRangeOfObjective", false);
        onStatusChange("inRangeOfContestedObjective", false);
        onStatusChange("inRangeOfFriendlyObjective", false);
        onStatusChange("inRangeOfEnemyObjective", false);

        // Set the selected one (and the general flag)
        if (value !== "none") {
            onStatusChange("inRangeOfObjective", true);
            if (value === "contested") {
                onStatusChange("inRangeOfContestedObjective", true);
            } else if (value === "friendly") {
                onStatusChange("inRangeOfFriendlyObjective", true);
            } else if (value === "enemy") {
                onStatusChange("inRangeOfEnemyObjective", true);
            }
        }
    };

    const handleModelCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onModelCountChange || !startingStrength) return;
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 1 && value <= startingStrength) {
            onModelCountChange(value);
        }
    };

    const printCombatReadiness = () => {
        if (combatStatus.isBelowHalfStrength) {
            return "Below half strength";
        } else if (combatStatus.isBelowStartingStrength) {
            return "Below starting strength";
        } else {
            return "Full strength";
        }
    };
    return (
        <section className="space-y-4">
            {/* Models Remaining Section */}
            {startingStrength !== undefined && startingStrength > 0 && modelCount !== undefined && onModelCountChange && (
                <div className="flex items-center justify-between">
                    <div>
                        <span className="block">Combat readiness</span>
                        <span className="text-blockcaps-m">{printCombatReadiness()}</span>
                    </div>
                    <div className="bg-deathWorldForest rounded flex pr-2 items-center">
                        <Input id={`${side}-model-count`} type="number" min={1} max={startingStrength} value={modelCount} onChange={handleModelCountChange} className="bg-transparent p-2" />
                        <span className="text-blockcaps-m whitespace-nowrap">/ {startingStrength}</span>
                    </div>
                </div>
            )}

            {/* Objective Range Dropdown */}
            <div className="relative">
                <span className="text-blockcaps-m absolute pointer-events-none">In objective range</span>
                <Dropdown triggerClassName={styles.ObjectiveControlDropdown} options={OBJECTIVE_OPTIONS} selectedLabel={OBJECTIVE_OPTIONS.find((o) => o.data === objectiveRangeValue)?.label} placeholder="In Range of Objective" onSelect={handleObjectiveRangeChange} />
            </div>

            {/* Other Status Checkboxes */}
            {relevantStatuses.map((status) => (
                <div key={status.name} className="flex items-center justify-between">
                    <label htmlFor={`${side}-${status.name}`} className="block cursor-pointer">
                        {status.label}
                    </label>
                    <Checkbox
                        id={`${side}-${status.name}`}
                        checked={combatStatus[status.name as CombatStatusFlag]}
                        onCheckedChange={(val) => {
                            onStatusChange(status.name as CombatStatusFlag, val as boolean);
                        }}
                    />
                </div>
            ))}

            {/* Damaged Profile Section */}
            {hasDamagedProfile && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <label htmlFor={`${side}-isDamaged`} className="block cursor-pointer">
                                Damaged (Bracketed)
                            </label>
                            {combatStatus.isDamaged && (damagedPenalties.hitPenalty > 0 || damagedPenalties.otherPenalties.length > 0) && (
                                <div className="flex flex-wrap gap-1">
                                    {damagedPenalties.hitPenalty > 0 && <Badge variant="destructive">-{damagedPenalties.hitPenalty} to Hit</Badge>}
                                    {damagedPenalties.otherPenalties.map((penalty, idx) => (
                                        <Badge key={`penalty-${idx}`} variant="destructive">
                                            {penalty.value === 0.5 ? "Half" : (penalty.value > 0 ? "+" : "") + penalty.value} {penalty.attribute.toUpperCase()}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Checkbox
                            id={`${side}-isDamaged`}
                            checked={combatStatus.isDamaged}
                            onCheckedChange={(val) => {
                                onStatusChange("isDamaged", val as boolean);
                            }}
                        />
                    </div>
                </div>
            )}
        </section>
    );
};

export default CombatStatus;

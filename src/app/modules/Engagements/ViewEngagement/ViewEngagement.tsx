import React, { useCallback } from "react";
import { Link, useParams } from "react-router-dom";

import type { GamePhase } from "../../../types";
import type { EngagementForceItemCombatState } from "#types/Engagements";
import { useEngagementManager } from "../EngagementManagerContext";

import GamePhaseSelector from "#components/GamePhaseSelector/GamePhaseSelector.tsx";
import IconCrossedSwords from "#components/icons/IconCrossedSwords.tsx";
import EmptyState from "#components/EmptyState/EmptyState.tsx";
import FactionBadge from "#components/FactionBadge/FactionBadge.tsx";
import Octagon from "./CombatPhase/Octagon";
import Dancefloor from "./MovementPhase/Dancefloor";

// Convert between GamePhase (uppercase) and EngagementPhase (lowercase)

const ViewEngagement = () => {
    const { engagementId } = useParams<{ engagementId: string }>();
    const { getEngagementById, engagementsLoaded, updateEngagementPhase, setActiveForce, updateUnitCombatState } = useEngagementManager();

    const engagement = engagementId ? getEngagementById(engagementId) : undefined;

    if (!engagementsLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center border-1 border-skarsnikGreen">
                <p>Loading...</p>
            </div>
        );
    }

    if (!engagement) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center border-1 border-skarsnikGreen gap-4">
                <EmptyState leadingIcon={<IconCrossedSwords />} label="Engagement not found or redacted" />
                <Link to="/engagements" className="text-skarsnikGreen hover:underline">
                    Return to engagements
                </Link>
            </div>
        );
    }

    const handlePhaseChange = (phase: GamePhase) => {
        updateEngagementPhase(engagement.id, phase);
    };

    const activeForce = engagement.activeForceId === engagement.engagementForceB.sourceListId ? engagement.engagementForceB : engagement.engagementForceA;

    const inactiveForce = engagement.activeForceId === engagement.engagementForceB.sourceListId ? engagement.engagementForceA : engagement.engagementForceB;

    const handleSwitchTurn = () => {
        setActiveForce(engagement.id, inactiveForce.sourceListId);
    };

    // Handler for updating unit combat state - maps forceType to the correct engagement force
    const handleUpdateUnitCombatState = useCallback(
        (forceType: "attacking" | "defending", unitId: string, updates: Partial<EngagementForceItemCombatState>) => {
            updateUnitCombatState(engagement.id, forceType, unitId, updates);
        },
        [engagement.id, updateUnitCombatState]
    );

    return (
        <main className="w-full h-full grid grid-rows-[auto_1fr] ">
            <header className="space-y-2">
                <div>
                    <h1 className="text-blockcaps-s block">{`Engagement ${engagement.id} / ${engagement.currentTurn}.1`}</h1>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <div className="flex bg-mournfangBrown rounded p-2 gap-6 items-center shrink-1 grow-1">
                        <button onClick={handleSwitchTurn} className="text-left text-fireDragonBright shrink-0 cursor-pointer">
                            <span className="text-blockcaps-xs block">Active force</span>
                            <span className="text-blockcaps-s block">{activeForce.factionName}</span>
                        </button>
                        <GamePhaseSelector currentPhase={engagement.currentPhase} onPhaseChange={handlePhaseChange} />
                    </div>
                    <div className="flex gap-4 shrink-1 items-center">
                        <FactionBadge faction={engagement.engagementForceA} />
                        <span>vs</span>
                        <FactionBadge faction={engagement.engagementForceB} />
                    </div>
                </div>
            </header>
            {engagement.currentPhase === "command" && (
                <div className="p-6">
                    <h2 className="text-title-m">Command Phase</h2>
                    <p>Resolve command phase abilities and generate command points.</p>
                </div>
            )}
            {engagement.currentPhase === "movement" && <Dancefloor attackingForce={activeForce} onUpdateUnitCombatState={handleUpdateUnitCombatState} />}
            {(engagement.currentPhase === "shooting" || engagement.currentPhase === "fight") && <Octagon gamePhase={engagement.currentPhase} attackingForce={activeForce} defendingForce={inactiveForce} onUpdateUnitCombatState={handleUpdateUnitCombatState} />}
            {engagement.currentPhase === "charge" && (
                <div className="p-6">
                    <h2 className="text-title-m">Charge Phase</h2>
                    <p>Declare and resolve charge attempts.</p>
                </div>
            )}
        </main>
    );
};

export default ViewEngagement;

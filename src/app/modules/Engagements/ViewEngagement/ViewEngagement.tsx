import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";

import type { GamePhase } from "../../../types";
import type { EngagementForceItemCombatState, OutOfPhaseEvent } from "#types/Engagements";
import { useEngagementManager } from "../EngagementManagerContext";

import GamePhaseSelector from "#modules/Engagements/ViewEngagement/CombatPhase/components/GamePhaseSelector/GamePhaseSelector.tsx";
import GamePlayerSelector from "#modules/Engagements/ViewEngagement/CombatPhase/components/GamePlayerSelector/GamePlayerSelector.tsx";
import IconCrossedSwords from "#components/icons/IconCrossedSwords.tsx";
import EmptyState from "#components/EmptyState/EmptyState.tsx";
import Octagon from "./CombatPhase/Octagon";
import Dancefloor from "./MovementPhase/Dancefloor";
import ChargePhase from "./ChargePhase/ChargePhase";
import CommandPhase from "./CommandPhase/CommandPhase";
import { Button } from "#components/Button/Button.tsx";

const ViewEngagement = () => {
    const { engagementId } = useParams<{ engagementId: string }>();
    const { getEngagementById, engagementsLoaded, updateEngagementPhase, setActiveForce, updateUnitCombatState, resetTurnFlags } = useEngagementManager();

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

    const [outOfPhaseEvent, setOutOfPhaseEvent] = useState<OutOfPhaseEvent>(null);

    const handlePhaseChange = (phase: GamePhase) => {
        setOutOfPhaseEvent(null);
        updateEngagementPhase(engagement.id, phase);
    };

    const handleEndTurn = () => {
        setOutOfPhaseEvent(null);
        resetTurnFlags(engagement.id);
        setActiveForce(engagement.id, inactiveForce.sourceListId);
        updateEngagementPhase(engagement.id, "command");
    };

    const handleToggleOutOfPhaseEvent = (event: "overwatch" | "fightback") => {
        setOutOfPhaseEvent((prev) => (prev === event ? null : event));
    };

    const allForces = [engagement.engagementForceA, engagement.engagementForceB, engagement.engagementForceC, engagement.engagementForceD].filter((f): f is NonNullable<typeof f> => f != null);

    const activeForce = allForces.find((f) => f.sourceListId === engagement.activeForceId) ?? engagement.engagementForceA;

    const inactiveForce = allForces.find((f) => f.sourceListId !== engagement.activeForceId) ?? engagement.engagementForceB;

    const handleSetActiveForce = (forceId: string) => {
        setActiveForce(engagement.id, forceId);
    };

    // Derive effective phase and forces when an out-of-phase event is active
    const effectivePhase: GamePhase = outOfPhaseEvent === "overwatch" ? "shooting" : outOfPhaseEvent === "fightback" ? "fight" : engagement.currentPhase;
    const octagonAttacker = outOfPhaseEvent ? inactiveForce : activeForce;
    const octagonDefender = outOfPhaseEvent ? activeForce : inactiveForce;

    // Handler for updating unit combat state - maps forceType to the correct engagement force
    const handleUpdateUnitCombatState = useCallback(
        (forceType: "attacking" | "defending", unitId: string, updates: Partial<EngagementForceItemCombatState>) => {
            updateUnitCombatState(engagement.id, forceType, unitId, updates);
        },
        [engagement.id, updateUnitCombatState]
    );

    return (
        <div className="w-full h-full grid grid-cols-[250px_1fr] gap-6">
            <aside className="flex flex-col justify-between">
                <div className="space-y-4">
                    <header className="text-center space-y-1">
                        <h1 className="text-blockcaps-s block">{`Op #${engagement.id}`}</h1>
                        <span className="text-blockcaps-xs">
                            {engagement.type} / {engagement.size}
                        </span>
                    </header>
                    <nav className="py-6 px-3 space-y-8 relative">
                        <div className="absolute top-0 left-0 w-full h-2 border-1 border-skarsnikGreen border-b-0" />
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <span className="text-blockcaps-s text-center block text-shadow-glow-green">Active force</span>
                                <GamePlayerSelector players={allForces} activeForceId={engagement.activeForceId} onClick={handleSetActiveForce} />
                            </div>
                            <div className="space-y-2">
                                <span className="text-blockcaps-s text-center block text-shadow-glow-green">Phase</span>
                                <GamePhaseSelector currentPhase={engagement.currentPhase} onPhaseChange={handlePhaseChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-blockcaps-s text-center block text-shadow-glow-green">Reactions</span>
                            <div className="space-y-1">
                                <button
                                    onClick={() => handleToggleOutOfPhaseEvent("overwatch")}
                                    className={`flex items-center w-full border-1 p-3 gap-2 transition-colors transition-opacity cursor-pointer ${
                                        outOfPhaseEvent === "overwatch" ? "bg-fireDragonBright text-mournfangBrown opacity-100" : "border-mournfangBrown text-fireDragonBright opacity-60"
                                    }`}
                                >
                                    <p className="text-blockcaps-s">Overwatch</p>
                                </button>
                                <button
                                    onClick={() => handleToggleOutOfPhaseEvent("fightback")}
                                    className={`flex items-center w-full border-1 p-3 gap-2 transition-colors transition-opacity cursor-pointer ${
                                        outOfPhaseEvent === "fightback" ? "bg-fireDragonBright text-mournfangBrown opacity-100" : "border-mournfangBrown text-fireDragonBright opacity-60"
                                    }`}
                                >
                                    <p className="text-blockcaps-s">Fight Back</p>
                                </button>
                            </div>
                        </div>
                        <Button variant="destructive" size="lg" className="w-full shadow-glow-red" onClick={handleEndTurn}>
                            End turn
                        </Button>
                        <div className="absolute bottom-0 left-0 w-full h-2 border-1 border-skarsnikGreen border-t-0" />
                    </nav>
                </div>
            </aside>

            {outOfPhaseEvent ? (
                <Octagon gamePhase={effectivePhase} attackingForce={octagonAttacker} defendingForce={octagonDefender} onUpdateUnitCombatState={handleUpdateUnitCombatState} isOverwatch={outOfPhaseEvent === "overwatch"} />
            ) : (
                <>
                    {engagement.currentPhase === "command" && <CommandPhase attackingForce={activeForce} defendingForce={inactiveForce} engagementId={engagement.id} />}
                    {engagement.currentPhase === "movement" && <Dancefloor attackingForce={activeForce} onUpdateUnitCombatState={handleUpdateUnitCombatState} />}
                    {(engagement.currentPhase === "shooting" || engagement.currentPhase === "fight") && <Octagon gamePhase={engagement.currentPhase} attackingForce={activeForce} defendingForce={inactiveForce} onUpdateUnitCombatState={handleUpdateUnitCombatState} />}
                    {engagement.currentPhase === "charge" && <ChargePhase attackingForce={activeForce} onUpdateUnitCombatState={handleUpdateUnitCombatState} />}
                </>
            )}
        </div>
    );
};

export default ViewEngagement;

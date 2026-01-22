import React, { Fragment } from "react";
import type { GamePhase } from "../../types";
import GamePhaseSelectorItem from "./GamePhaseSelectorItem";

export interface GamePhaseSelectorProps {
    currentPhase: GamePhase;
    onPhaseChange: (phase: GamePhase) => void;
}

export type Phase = {
    id: GamePhase;
    label: string;
};

const PHASES: Phase[] = [
    { id: "COMMAND", label: "Command" },
    { id: "MOVEMENT", label: "Movement" },
    { id: "SHOOTING", label: "Shooting" },
    { id: "CHARGE", label: "Charge" },
    { id: "FIGHT", label: "Fight" },
];

export function GamePhaseSelector({ currentPhase, onPhaseChange }: GamePhaseSelectorProps) {
    return (
        <div className="flex grow max-w-[700px] border-1 border-fireDragonBright rounded">
            {PHASES.map((phase, index) => (
                <GamePhaseSelectorItem key={phase.id} index={index} currentPhase={currentPhase} phase={phase} onPhaseChange={onPhaseChange} />
            ))}
        </div>
    );
}

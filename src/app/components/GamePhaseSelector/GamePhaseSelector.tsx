import React, { Fragment } from "react";
import type { EngagementPhase } from "#types/Engagements.tsx";
import GamePhaseSelectorItem from "./GamePhaseSelectorItem";

export interface GamePhaseSelectorProps {
    currentPhase: EngagementPhase;
    onPhaseChange: (phase: EngagementPhase) => void;
}

export type Phase = {
    id: EngagementPhase;
    label: string;
};

const PHASES: Phase[] = [
    { id: "command", label: "Command" },
    { id: "movement", label: "Movement" },
    { id: "shooting", label: "Shooting" },
    { id: "charge", label: "Charge" },
    { id: "fight", label: "Fight" },
];

const GamePhaseSelector = ({ currentPhase, onPhaseChange }: GamePhaseSelectorProps) => {
    return (
        <div className={`grid grid-cols-5 grow max-w-[810px] border-1 border-fireDragonBright rounded`}>
            {PHASES.map((phase, index) => (
                <GamePhaseSelectorItem key={phase.id} index={index} currentPhase={currentPhase} phase={phase} onPhaseChange={onPhaseChange} />
            ))}
        </div>
    );
};

export default GamePhaseSelector;

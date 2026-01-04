import React,{ Fragment } from "react";
import type { GamePhase } from "../types";

interface GamePhaseSelectorProps {
    currentPhase: GamePhase;
    onPhaseChange: (phase: GamePhase) => void;
}

const PHASES: { id: GamePhase; label: string }[] = [
    { id: "COMMAND", label: "Command phase" },
    { id: "MOVEMENT", label: "Movement phase" },
    { id: "SHOOTING", label: "Shooting phase" },
    { id: "CHARGE", label: "Charge phase" },
    { id: "FIGHT", label: "Fight phase" },
];

export function GamePhaseSelector({ currentPhase, onPhaseChange }: GamePhaseSelectorProps) {
    return (
        <Fragment>
        <div className="flex items-stretch px-4 pt-4">
            {PHASES.map((phase) => (
                <button
                    key={phase.id}
                    onClick={() => onPhaseChange(phase.id)}
                    className={`
                    flex-1 px-3 pt-2 pb-6 rounded-t-[4px] transition-colors
                    ${
                        currentPhase === phase.id
                            ? "bg-white "
                            : "bg-transparent text-[#767676] hover:text-[#999]"
                    }
                    `}
                >
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[12px] text-nowrap">
                        {phase.label}
                    </p>
                </button>
            ))}
        </div>
        </Fragment>
    );
}

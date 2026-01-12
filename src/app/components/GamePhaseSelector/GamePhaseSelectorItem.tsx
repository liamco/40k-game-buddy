import React from "react";

import { GamePhaseSelectorProps, Phase } from "./GamePhaseSelector";

interface Props {
    currentPhase: GamePhaseSelectorProps["currentPhase"];
    onPhaseChange: GamePhaseSelectorProps["onPhaseChange"];
    phase: Phase;
    index: number;
}

const GamePhaseSelectorItem = ({ index, currentPhase, phase, onPhaseChange }: Props) => {
    return (
        <button
            key={phase.id}
            onClick={() => onPhaseChange(phase.id)}
            className={`cursor-pointer flex not-first:border-l-fireDragonBright border-1 items-center gap-2 p-2 transition-colors grow
        ${currentPhase === phase.id ? "bg-fireDragonBright text-mournfangBrown" : "bg-transparent text-fireDragonBright"}
        `}
        >
            <span className={`text-blockcaps-m inline-block px-1 py-0.5  ${currentPhase === phase.id ? "bg-mournfangBrown text-fireDragonBright" : "bg-fireDragonBright text-mournfangBrown"}`}>{index + 1}.</span>
            <p className="text-blockcaps-m ">{phase.label}</p>
        </button>
    );
};

export default GamePhaseSelectorItem;

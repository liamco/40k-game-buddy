import React from "react";

import styles from "./GamePhaseSelector.module.css";

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
            className={`${styles.GamePhaseSelectorItem} cursor-pointer flex not-first:border-l-fireDragonBright border-1 items-center gap-2 p-2 transition-colors grow
        ${currentPhase === phase.id ? "bg-fireDragonBright text-mournfangBrown" : "bg-transparent text-fireDragonBright"}
        `}
        >
            <span className={` ${styles.GamePhaseSelectorItemCounter} text-blockcaps-m px-1 py-0.5  ${currentPhase === phase.id ? "bg-mournfangBrown text-fireDragonBright" : "bg-fireDragonBright text-mournfangBrown"}`}>{index + 1}.</span>
            <p className="text-blockcaps-s">{phase.label}</p>
        </button>
    );
};

export default GamePhaseSelectorItem;

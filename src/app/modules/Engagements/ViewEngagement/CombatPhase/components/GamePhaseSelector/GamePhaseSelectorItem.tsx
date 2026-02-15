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
        <button key={phase.id} onClick={() => onPhaseChange(phase.id)} className={`${styles.GamePhaseSelectorItem} ${currentPhase === phase.id ? styles.GamePhaseSelectorItemActive : ""} `}>
            <div className={` ${styles.GamePhaseSelectorItemCounter} flex items-center justify-center w-6 h-6 bg-mournfangBrown text-fireDragonBright`}>
                <span className="text-blockcaps-s">{index + 1}</span>
            </div>
            <p className="text-blockcaps-s">{phase.label}</p>
        </button>
    );
};

export default GamePhaseSelectorItem;

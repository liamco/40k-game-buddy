import React from "react";

import FinalResultBox from "./FinalResultbox";
import ResultBox from "./ResultBox";

interface Modifier {
    label: string;
    value: number;
}

interface Props {
    label: string;
    statLabel?: string;
    statValue?: string;
    bonuses: Modifier[];
    penalties: Modifier[];
    finalValue: string;
    finalClassName?: string;
}

const AttackStep = ({ label, statLabel, statValue, bonuses, penalties, finalValue, finalClassName }: Props) => {
    return (
        <section className="not-first:border-1 border-l-skarsnikGreen grid grid-cols-2 gap-2 p-4">
            <header className="col-span-2 border-1 border-skarsnikGreen p-2">
                <span className="text-blockcaps-s">{label}</span>
            </header>

            {statLabel && statValue ? (
                <ResultBox label={statLabel} value={statValue} />
            ) : (
                <div className="flex items-center justify-center">
                    <p className="font-bold text-[24px]">-</p>
                </div>
            )}
            {bonuses.length ? (
                <ResultBox value={`+${bonuses.reduce((sum, b) => sum + b.value, 0)}`} modifiers={bonuses} />
            ) : (
                <div className="flex items-center justify-center">
                    <p className="font-bold text-[24px]">-</p>
                </div>
            )}
            {penalties.length ? (
                <ResultBox value={`${penalties.reduce((sum, p) => sum + p.value, 0)}`} modifiers={penalties} />
            ) : (
                <div className="flex items-center justify-center">
                    <p className="font-bold text-[24px]">-</p>
                </div>
            )}
            <FinalResultBox className={finalClassName} value={finalValue} />
        </section>
    );
};

export default AttackStep;

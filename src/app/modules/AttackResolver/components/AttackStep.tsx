import React from "react";

import BaseIcon from "../../../components/icons/BaseIcon";

import IconCrosshair from "../../../components/icons/IconCrosshair";
import IconDroplets from "../../../components/icons/IconDroplets";
import IconShield from "../../../components/icons/IconShield";
import IconSkull from "../../../components/icons/IconSkull";
import IconSwords from "../../../components/icons/IconSwords";

import FinalResultBox from "./FinalResultbox";
import ResultBox from "./ResultBox";

import strikethrough from "../../../assets/Strikethrough.svg";

interface Modifier {
    label: string;
    value: number;
}

export type StepType = "attacks" | "hitChance" | "woundChance" | "saveChance" | "feelNoPain";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const stepIcons: Record<StepType, IconComponent> = {
    attacks: IconSwords,
    hitChance: IconCrosshair,
    woundChance: IconDroplets,
    saveChance: IconShield,
    feelNoPain: IconSkull,
};

interface Props {
    label: string;
    stepType?: StepType;
    statLabel?: string;
    statValue?: string;
    bonuses: Modifier[];
    penalties: Modifier[];
    finalValue: string;
    finalClassName?: string;
    disabled?: boolean;
}

const AttackStep = ({ label, stepType, statLabel, statValue, bonuses, penalties, finalValue, finalClassName, disabled }: Props) => {
    const Icon = stepType ? stepIcons[stepType] : null;

    return (
        <section className="relative not-first:border-1 border-l-skarsnikGreen">
            <div className={`grid grid-cols-2 gap-2 p-4 ${disabled ? "opacity-25" : ""}`}>
                <header className="col-span-2 border-1 border-skarsnikGreen p-2 flex items-center justify-between">
                    <span className="text-blockcaps-s">{label}</span>
                    {Icon && (
                        <BaseIcon>
                            <Icon />
                        </BaseIcon>
                    )}
                </header>

                {statLabel && statValue ? (
                    <ResultBox className="col-span-2" label={statLabel} value={statValue} />
                ) : (
                    <div className="col-span-2 flex items-center justify-center">
                        <p className="font-bold text-[24px]">-</p>
                    </div>
                )}
                <div className="col-span-2 grid grid-cols-2">
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
                </div>
                <FinalResultBox className={finalClassName} value={finalValue} />
            </div>

            {disabled && <img className="absolute w-full h-full top-0 bottom-0 right-0 left-0" src={strikethrough} alt="X" />}
        </section>
    );
};

export default AttackStep;

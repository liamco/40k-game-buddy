import React from "react";

import BaseIcon from "#components/icons/BaseIcon";
import IconCrosshair from "#components/icons/IconCrosshair";
import IconDroplets from "#components/icons/IconDroplets";
import IconShield from "#components/icons/IconShield";
import IconSkull from "#components/icons/IconSkull";
import IconSwords from "#components/icons/IconSwords";

import FinalResultBox from "./FinalResultbox";
import ResultBox from "./ResultBox";

import strikethrough from "#assets/Strikethrough.svg";

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
        <section className="relative not-first:border-1 border-t-skarsnikGreen">
            <div className={`space-y-2 grid h-full grid-rows-[auto_1fr] p-4 ${disabled ? "opacity-25" : ""}`}>
                <header className="border-1 border-skarsnikGreen p-2 flex items-center justify-between">
                    <span className="text-blockcaps-m">{label}</span>
                    {Icon && (
                        <BaseIcon>
                            <Icon />
                        </BaseIcon>
                    )}
                </header>

                <div className="grid-cols-3 grid w-full">
                    {statLabel && statValue ? (
                        <ResultBox label={statLabel} value={statValue} />
                    ) : (
                        <div className=" flex items-center justify-center">
                            <p className="font-bold text-[24px]">-</p>
                        </div>
                    )}
                    <div className=" grid grid-cols-2">
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
            </div>

            {disabled && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <img src={strikethrough} alt="" className="w-full h-full" />
                </div>
            )}
        </section>
    );
};

export default AttackStep;

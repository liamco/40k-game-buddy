import React from "react";

import type { CriticalEffect } from "#game-engine/types/ModifierResult";

import BaseIcon from "#components/icons/BaseIcon";
import IconCrosshair from "#components/icons/IconCrosshair";
import IconDroplets from "#components/icons/IconDroplets";
import IconShield from "#components/icons/IconShield";
import IconSkull from "#components/icons/IconSkull";
import IconSwords from "#components/icons/IconSwords";

import FinalResultBox from "./FinalResultbox";
import ResultBox from "./ResultBox";

import strikethrough from "#assets/StrikethroughGreen.svg";
import ModifierBox from "./ModifierBox";

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
    isCritical?: boolean;
    criticalEffect?: CriticalEffect | null;
}

const AttackStep = ({ label, stepType, statLabel, statValue, bonuses, penalties, finalValue, finalClassName, disabled, isCritical, criticalEffect }: Props) => {
    const Icon = stepType ? stepIcons[stepType] : null;

    return (
        <section className="relative border-1 border-t-0 first:border-t-1  border-deathWorldForest">
            <div className={`grid h-full grid-rows-[auto_1fr] ${disabled ? "opacity-25" : ""}`}>
                <header className=" bg-deathWorldForest p-2 flex items-center justify-between">
                    <span className="text-blockcaps-s">{label}</span>
                    <div className="flex items-center gap-2">
                        {criticalEffect && <span className="text-blockcaps-s text-fireDragonBright">{criticalEffect.name}</span>}
                        {Icon && (
                            <BaseIcon>
                                <Icon />
                            </BaseIcon>
                        )}
                    </div>
                </header>

                <div className="grid-cols-8 p-3 grid w-full">
                    <ResultBox value={statValue} />
                    <ModifierBox bonuses={bonuses} penalties={penalties} />
                    <FinalResultBox className={finalClassName} value={finalValue} isCritical={isCritical} />
                </div>
            </div>
        </section>
    );
};

export default AttackStep;

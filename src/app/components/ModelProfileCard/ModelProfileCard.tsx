import React, { Fragment, useMemo } from "react";
import { Model } from "#types/Models.tsx";
import type { Ability, WargearAbility } from "#types/Units.tsx";

import { Badge } from "#components/Badge/Badge.tsx";

import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconShield from "#components/icons/IconShield.tsx";

import strikethroughGreen from "#assets/StrikethroughGreen.svg";
import strikethroughRed from "#assets/StrikethroughRed.svg";
import IconSkull from "#components/icons/IconSkull.tsx";

import { applyWargearMechanics, ModifiedStats } from "#utils/applyWargearMechanics.ts";

interface Props {
    model: Model & { sourceUnit?: string; isLeader?: boolean };
    abilities?: Ability[];
    wargearAbilities?: WargearAbility[];
    isDisabled?: boolean;
    isDestroyed?: boolean;
    isSelected?: boolean;
    onUnitModelChange?: (profile: Model | null) => void;
}

const formatAbility = (ability: Ability): string => {
    if (!ability.parameter) return ability.name;
    // Add + suffix for numeric parameters (save-like values)
    const isNumeric = /^\d+$/.test(ability.parameter);
    return isNumeric ? `${ability.name} ${ability.parameter}+` : `${ability.name} ${ability.parameter}`;
};

// Helper to render a stat value, showing modified value with reversed colors if changed
const StatValue = ({ value, modified, isSave = false }: { value: number | null; modified?: { base: number; modified: number }; isSave?: boolean }) => {
    if (modified) {
        return (
            <span className="inline-flex items-center justify-center min-w-[1.5rem] px-1 py-0.5 bg-mournfangBrown rounded text-skarsnikGreen font-medium">
                {modified.modified}
                {isSave ? "+" : ""}
            </span>
        );
    }
    return (
        <span>
            {value}
            {isSave && value !== null ? "+" : ""}
        </span>
    );
};

const ModelProfileCard = ({ model, abilities, wargearAbilities, isDisabled, isSelected, isDestroyed, onUnitModelChange }: Props) => {
    // Compute stat modifications from wargear abilities
    const modifiedStats = useMemo((): ModifiedStats => {
        if (!wargearAbilities || wargearAbilities.length === 0) return {};
        return applyWargearMechanics(model, wargearAbilities);
    }, [model, wargearAbilities]);

    const resolveStyles = () => {
        if (isDestroyed) {
            return "bg-wordBearersRed shadow-none border-wildRiderRed  text-wildRiderRed";
        }
        if (isDisabled) {
            return "";
        }
        if (isSelected) {
            return "bg-fireDragonBright shadow-glow-orange text-mournfangBrown";
        }
        return "";
    };

    return (
        <div
            className={`relative rounded p-3 border-1 transition-colors text-fireDragonBright border-fireDragonBright ${resolveStyles()} ${!isDisabled && onUnitModelChange ? "cursor-pointer " : ""}`}
            onClick={() => {
                if (!isDisabled && !isDestroyed && onUnitModelChange) {
                    onUnitModelChange(model);
                }
            }}
        >
            <div className={`space-y-3 ${isDisabled ? "opacity-25" : ""} ${isDestroyed ? "opacity-40" : ""}`}>
                <div className="flex items-center gap-2">
                    <p>{model.name}</p>
                    {model.isLeader && <Badge variant="outline">Leader</Badge>}
                </div>

                {abilities && abilities.filter((a) => (a.type === "Core" || a.type === "Datasheet") && a.name.toUpperCase() !== "LEADER").length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {abilities
                            .filter((a) => (a.type === "Core" || a.type === "Datasheet") && a.name.toUpperCase() !== "LEADER")
                            .map((ability) => (
                                <Badge key={ability.name} variant={isSelected ? "secondaryAlt" : "outlineAlt"}>
                                    {formatAbility(ability)}
                                </Badge>
                            ))}
                    </div>
                )}

                <div className="grid grid-cols-6 gap-2 text-center">
                    <p>M</p>
                    <p>T</p>
                    <p>Sv</p>
                    <p>W</p>
                    <p>Ld</p>
                    <p>OC</p>
                    <p>
                        <StatValue value={model.m} modified={modifiedStats.m} />
                    </p>
                    <p>
                        <StatValue value={model.t} modified={modifiedStats.t} />
                    </p>
                    <p>
                        <StatValue value={model.sv} modified={modifiedStats.sv} isSave />
                    </p>
                    <p>
                        <StatValue value={model.w} modified={modifiedStats.w} />
                    </p>
                    <p>
                        <StatValue value={model.ld} modified={modifiedStats.ld} isSave />
                    </p>
                    <p>
                        <StatValue value={model.oc} modified={modifiedStats.oc} />
                    </p>
                    {(model.invSv || modifiedStats.invSv) && (
                        <div className="col-start-3 relative flex justify-center">
                            <BaseIcon color={modifiedStats.invSv ? "skarsnikGreen" : "deathWorldForest"} size="large">
                                <IconShield />
                            </BaseIcon>
                            <span className={`inline-block ${isDestroyed ? "text-wildRiderRed" : modifiedStats.invSv ? "text-mournfangBrown font-medium" : "text-fireDragonBright"} absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`}>
                                {modifiedStats.invSv ? modifiedStats.invSv.modified : model.invSv}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {isDisabled && <img className="absolute w-full h-full top-0 bottom-0 right-0 left-0" src={strikethroughGreen} alt="X" />}
            {isDestroyed && (
                <Fragment>
                    <img className="absolute w-full h-full top-0 left-0 pointer-events-none" src={strikethroughRed} alt="X" />
                    <div className="bg-wordBearersRed border-1 border-wildRiderRed shadow-glow-red p-2 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
                        <BaseIcon size="xlarge" color="wildRiderRed">
                            <IconSkull />
                        </BaseIcon>
                    </div>
                </Fragment>
            )}
        </div>
    );
};

export default ModelProfileCard;

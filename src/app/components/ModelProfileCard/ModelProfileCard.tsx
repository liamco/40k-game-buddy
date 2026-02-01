import React, { Fragment } from "react";
import { Model } from "#types/Models.tsx";

import { Badge } from "#components/Badge/Badge.tsx";

import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconShield from "#components/icons/IconShield.tsx";

import strikethroughGreen from "#assets/StrikethroughGreen.svg";
import strikethroughRed from "#assets/StrikethroughRed.svg";
import IconSkull from "#components/icons/IconSkull.tsx";

interface Props {
    model: Model & { sourceUnit?: string; isLeader?: boolean };
    isDisabled?: boolean;
    isDestroyed?: boolean;
    isSelected?: boolean;
    onUnitModelChange?: (profile: Model | null) => void;
}

const ModelProfileCard = ({ model, isDisabled, isSelected, isDestroyed, onUnitModelChange }: Props) => {
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

                <div className="grid grid-cols-6 gap-2 text-center">
                    <p>M</p>
                    <p>T</p>
                    <p>Sv</p>
                    <p>W</p>
                    <p>Ld</p>
                    <p>OC</p>
                    <p>{model.m}</p>
                    <p>{model.t}</p>
                    <p>{model.sv}</p>
                    <p>{model.w}</p>
                    <p>{model.ld}</p>
                    <p>{model.oc}</p>
                    {model.invSv && (
                        <div className="col-start-3 relative flex justify-center">
                            <BaseIcon color="deathWorldForest" size="large">
                                <IconShield />
                            </BaseIcon>
                            <span className={`inline-block ${isDestroyed ? "text-wildRiderRed" : "text-fireDragonBright"} absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`}>{model.invSv}</span>
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

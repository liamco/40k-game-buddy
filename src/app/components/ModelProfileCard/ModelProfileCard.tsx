import React from "react";
import { Model } from "#types/Models.tsx";

import { Badge } from "#components/Badge/Badge.tsx";

import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconShield from "#components/icons/IconShield.tsx";

import strikethrough from "#assets/Strikethrough.svg";

interface Props {
    model: Model & { sourceUnit?: string; isLeader?: boolean };
    isDisabled?: boolean;
    isSelected?: boolean;
    onUnitModelChange?: (profile: Model | null) => void;
}

const ModelProfileCard = ({ model, isDisabled, isSelected, onUnitModelChange }: Props) => {
    return (
        <div
            className={`relative rounded p-3 border-1 transition-colors border-skarsnikGreen ${isSelected ? "bg-skarsnikGreen shadow-glow-green text-deathWorldForest" : "text-skarsnikGreen"} ${!isDisabled && onUnitModelChange ? "cursor-pointer " : ""}`}
            onClick={() => {
                if (!isDisabled && onUnitModelChange) {
                    onUnitModelChange(model);
                }
            }}
        >
            <div className={`space-y-3 ${isDisabled ? "opacity-25" : ""}`}>
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
                            <BaseIcon color="fireDragonBright" size="large">
                                <IconShield />
                            </BaseIcon>
                            <span className="inline-block text-mournfangBrown absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">{model.invSv}</span>
                        </div>
                    )}
                </div>
            </div>
            {isDisabled && <img className="absolute w-full h-full top-0 bottom-0 right-0 left-0" src={strikethrough} alt="X" />}
        </div>
    );
};

export default ModelProfileCard;

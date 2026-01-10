import React from "react";
import { Model } from "../../types";

import { Badge } from "../_ui/badge.tsx";

interface Props {
    model: Model & { sourceUnit?: string; isLeader?: boolean };
    isDisabled: boolean;
    isSelected: boolean;
    onUnitModelChange: (profile: Model | null) => void;
}

const ModelProfileCard = ({ model, isDisabled, isSelected, onUnitModelChange }: Props) => {
    return (
        <div
            className={`rounded p-2 space-y-2 cursor-pointer border-1 transition-colors border-skarsnikGreen ${isSelected ? "bg-skarsnikGreen shadow-glow-green text-deathWorldForest" : "text-skarsnikGreen"}`}
            onClick={() => {
                if (!isDisabled) {
                    onUnitModelChange(model);
                }
            }}
        >
            <div className="flex items-center gap-2">
                <p className=" font-bold text-[12px] ">{model.name}</p>
                {model.isLeader && <Badge variant="outline">Leader</Badge>}
            </div>

            <div className="grid grid-cols-6 gap-2 text-center">
                <p className=" font-bold text-[12px] ">M</p>
                <p className=" font-bold text-[12px] ">T</p>
                <p className=" font-bold text-[12px] ">Sv</p>
                <p className=" font-bold text-[12px] ">W</p>
                <p className=" font-bold text-[12px] ">Ld</p>
                <p className=" font-bold text-[12px] ">OC</p>
                <p className=" font-bold text-[12px] ">{model.m}</p>
                <p className=" font-bold text-[12px] ">{model.t}</p>
                <p className=" font-bold text-[12px] ">{model.sv}</p>
                <p className=" font-bold text-[12px] ">{model.w}</p>
                <p className=" font-bold text-[12px] ">{model.ld}</p>
                <p className=" font-bold text-[12px] ">{model.oc}</p>
                {model.invSv && (
                    <div className="col-start-3">
                        <p className="font-bold text-[12px] inline-block p-2 bg-amber-300 rounded-b-full">{model.invSv}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModelProfileCard;

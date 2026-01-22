import React from "react";
import BaseIcon from "../icons/BaseIcon";
import IconCrossedSwords from "../icons/IconCrossedSwords";
import IconDefender from "../icons/IconDefender";
import IconSkull from "../icons/IconSkull";

interface Props {
    combatant: "attacker" | "defender";
}

const CombatantPanelEmpty = ({ combatant }: Props) => {
    return (
        <div className="col-span-5 h-full flex items-center justify-center">
            <div>
                <div className="flex gap-2 items-center mb-2">
                    <hr className="grow border-none h-[1px] bg-skarsnikGreen" />
                    <BaseIcon>{combatant === "attacker" ? <IconCrossedSwords /> : <IconDefender />}</BaseIcon>
                    <hr className="grow border-none h-[1px] bg-skarsnikGreen" />
                </div>
                <div className="flex items-center gap-4">
                    <span>+++</span>
                    <span className="text-blockcaps-m">{combatant === "attacker" ? "select attacking unit" : "select target unit"}</span>
                    <span>+++</span>
                </div>
                <div className="flex gap-2 items-center mt-3">
                    <hr className="grow border-none h-[1px] bg-skarsnikGreen" />
                    <BaseIcon size="small">
                        <IconSkull />
                    </BaseIcon>
                    <hr className="grow border-none h-[1px] bg-skarsnikGreen" />
                </div>
            </div>
        </div>
    );
};

export default CombatantPanelEmpty;

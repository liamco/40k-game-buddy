import React from "react";
import BaseIcon from "../icons/BaseIcon";
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
                    <h3 className="text-blockcaps-s">swords or shiled</h3>
                    <hr className="grow border-none h-[1px] bg-skarsnikGreen" />
                </div>
                <span className="text-blockcaps-m">+++ {combatant === "attacker" ? "select attacking unit" : "select target unit"} +++</span>
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

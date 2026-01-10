import React from "react";

interface Props {
    combatant: "attacker" | "defender";
}

const CombatantPanelEmpty = ({ combatant }: Props) => {
    return (
        <div className="col-span-5 h-full flex items-center justify-center">
            <div className="space-y-2">
                <div className="flex gap-2 items-center">
                    <hr className="grow border-none h-[1px] bg-skarsnikGreen" />
                    <h3 className="text-blockcaps-s">swords or shiled</h3>
                    <hr className="grow border-none h-[1px] bg-skarsnikGreen" />
                </div>
                <span className="text-blockcaps-m">+++ {combatant === "attacker" ? "select attacking unit" : "select target unit"} +++</span>
                <div className="flex gap-2 items-center">
                    <hr className="grow border-none h-[1px] bg-skarsnikGreen" />
                    <h3 className="text-blockcaps-s">small skull</h3>
                    <hr className="grow border-none h-[1px] bg-skarsnikGreen" />
                </div>
            </div>
        </div>
    );
};

export default CombatantPanelEmpty;

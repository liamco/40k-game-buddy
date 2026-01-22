import React, { useEffect, useState } from "react";
import { ArmyList, GamePhase, GameTurn, Stratagem } from "../../types";
import { StratagemCard } from "./StratagemCard";

import { loadGlobalStratagemData, loadFactionStratagemData } from "../../utils/depotDataLoader";

interface Props {
    selectedList: ArmyList;
    scope: "Attacker" | "Defender";
    gamePhase: GamePhase;
    gameTurn: GameTurn;
}

export const StratagemList = ({ scope, gamePhase, gameTurn, selectedList }) => {
    const [globalStratagemData, setGlobalStratagemData] = useState<Stratagem[]>([]);
    const [stratagemData, setStratagemData] = useState<Stratagem[]>([]);

    // Load faction data when list changes
    useEffect(() => {
        loadGlobalStratagemData().then((data) => {
            if (data) {
                setGlobalStratagemData(data);
            }
        });
        if (selectedList) {
            loadFactionStratagemData(selectedList.factionSlug, selectedList.detachmentSlug).then((data) => {
                if (data) {
                    setStratagemData(data);
                }
            });
        }
    }, [selectedList]);

    return (
        <div className="bg-[#e6e6e6] rounded-[8px] p-6 space-y-4">
            <h3 className=" font-semibold text-[14px] ">{scope}s stratagems</h3>
            {globalStratagemData
                .filter((stratagem) => stratagem.phase.includes(gamePhase))
                .filter((stratagem) => stratagem.type.includes("Core"))
                .filter((stratagem) => stratagem.turn === gameTurn || stratagem.turn === "EITHER")
                .map((stratagem) => (
                    <StratagemCard key={stratagem.id} stratagem={stratagem} />
                ))}
            {stratagemData
                .filter((stratagem) => stratagem.phase.includes(gamePhase))
                .filter((stratagem) => stratagem.turn === gameTurn || stratagem.turn === "EITHER")
                .map((stratagem) => (
                    <StratagemCard key={stratagem.id} stratagem={stratagem} />
                ))}
        </div>
    );
};

export default StratagemList;

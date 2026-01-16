import React, { useEffect, useState } from "react";
import { Scroll } from "lucide-react";

import type { ArmyList, GamePhase, GameTurn, Stratagem } from "../../types";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../_ui/dialog";
import { Button } from "../_ui/button";
import { ScrollArea } from "../_ui/scroll-area";
import { Badge } from "../_ui/badge";

import { loadGlobalStratagemData, loadFactionStratagemData } from "../../utils/depotDataLoader";

type CombatSide = "attacker" | "defender";

interface StratagemDialogProps {
    side: CombatSide;
    gamePhase: GamePhase;
    selectedList: ArmyList | null;
    trigger?: React.ReactNode;
}

// Map combat side to game turn for filtering
const sideToTurn: Record<CombatSide, GameTurn> = {
    attacker: "YOURS",
    defender: "OPPONENTS",
};

export function StratagemDialog({ side, gamePhase, selectedList, trigger }: StratagemDialogProps) {
    const [globalStratagemData, setGlobalStratagemData] = useState<Stratagem[]>([]);
    const [factionStratagemData, setFactionStratagemData] = useState<Stratagem[]>([]);

    const gameTurn = sideToTurn[side];

    // Load stratagem data
    useEffect(() => {
        loadGlobalStratagemData().then((data) => {
            if (data) {
                setGlobalStratagemData(data);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedList) {
            loadFactionStratagemData(selectedList.factionSlug, selectedList.detachmentSlug).then((data) => {
                if (data) {
                    setFactionStratagemData(data);
                }
            });
        } else {
            setFactionStratagemData([]);
        }
    }, [selectedList]);

    // Filter stratagems by phase and turn
    const filterStratagems = (stratagems: Stratagem[]) => {
        return stratagems.filter((stratagem) => {
            const phaseMatch = stratagem.phase.includes(gamePhase) || stratagem.phase.includes("ANY" as GamePhase);
            const turnMatch = stratagem.turn === gameTurn || stratagem.turn === "EITHER";
            return phaseMatch && turnMatch;
        });
    };

    const coreStratagems = filterStratagems(globalStratagemData.filter((s) => s.type.includes("Core")));
    const factionStratagems = filterStratagems(factionStratagemData);

    const hasStratagems = coreStratagems.length > 0 || factionStratagems.length > 0;

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="default" className="w-full">
                        <span className="flex items-center gap-4">
                            <span>+++</span>
                            <span className="text-blockcaps-m">available stratagems</span>
                            <span>+++</span>
                        </span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0" theme="skarsnikGreen">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Scroll className="h-5 w-5" />
                        {side === "attacker" ? "Attacker" : "Defender"} Stratagems - {gamePhase} Phase
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-100px)]">
                    <div className="p-6 pt-4 space-y-6">
                        {!hasStratagems && (
                            <div className="text-center py-8 text-skarsnikGreen/70">
                                <p>No stratagems available for this phase and turn.</p>
                            </div>
                        )}

                        {/* Core Stratagems */}
                        {coreStratagems.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-blockcaps-m border-b border-skarsnikGreen pb-1">Core Stratagems</h3>
                                {coreStratagems.map((stratagem) => (
                                    <StratagemCardStyled key={stratagem.id} stratagem={stratagem} />
                                ))}
                            </div>
                        )}

                        {/* Faction/Detachment Stratagems */}
                        {factionStratagems.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-blockcaps-m border-b border-skarsnikGreen pb-1">{selectedList?.detachmentName || "Detachment"} Stratagems</h3>
                                {factionStratagems.map((stratagem) => (
                                    <StratagemCardStyled key={stratagem.id} stratagem={stratagem} />
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

// Styled stratagem card for the dialog
function StratagemCardStyled({ stratagem }: { stratagem: Stratagem }) {
    return (
        <div className="border border-skarsnikGreen rounded p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm">{stratagem.name}</h4>
                <Badge variant="outline" className="shrink-0">
                    {stratagem.cpCost}CP
                </Badge>
            </div>
            {stratagem.legend && <p className="text-sm text-skarsnikGreen/80 italic">{stratagem.legend}</p>}
            <div className="flex flex-wrap gap-1 text-xs">
                {stratagem.phase && (
                    <Badge variant="secondary" className="text-xs">
                        {Array.isArray(stratagem.phase) ? stratagem.phase.join(", ") : stratagem.phase}
                    </Badge>
                )}
                {stratagem.turn && (
                    <Badge variant="secondary" className="text-xs">
                        {stratagem.turn === "YOURS" ? "Your Turn" : stratagem.turn === "OPPONENTS" ? "Opponent's Turn" : "Either Turn"}
                    </Badge>
                )}
            </div>
        </div>
    );
}

export default StratagemDialog;

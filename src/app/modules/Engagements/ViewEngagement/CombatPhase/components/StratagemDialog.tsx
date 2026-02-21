import React, { useState, useEffect, useMemo } from "react";

import type { EngagementForce } from "#types/Engagements";
import type { GamePhase } from "#types/index";
import type { Stratagem } from "#types/Detachments";

import { loadGlobalStratagemData, loadFactionStratagemData } from "#utils/depotDataLoader";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "#components/Dialog/Dialog";
import { Badge } from "#components/Badge/Badge";
import SplitHeading from "#components/SplitHeading/SplitHeading";

export interface GroupedStratagems {
    core: Stratagem[];
    detachment: Stratagem[];
}

const PHASE_MAP: Record<GamePhase, string> = {
    command: "COMMAND",
    movement: "MOVEMENT",
    shooting: "SHOOTING",
    charge: "CHARGE",
    fight: "FIGHT",
};

function filterByPhase(stratagems: Stratagem[], gamePhase: GamePhase): Stratagem[] {
    const phaseKey = PHASE_MAP[gamePhase];
    return stratagems.filter((s) => s.phase.includes("ANY PHASE") || s.phase.includes(phaseKey));
}

function filterByTurn(stratagems: Stratagem[], side: "attacker" | "defender"): Stratagem[] {
    if (side === "attacker") {
        return stratagems.filter((s) => s.turn === "YOURS" || s.turn === "EITHER");
    }
    return stratagems.filter((s) => s.turn === "OPPONENTS" || s.turn === "EITHER");
}

/** Load and filter stratagems for a given force, phase, and side. */
export function useStratagems(force: EngagementForce, gamePhase: GamePhase, side: "attacker" | "defender"): { grouped: GroupedStratagems; totalCount: number } {
    const [allCore, setAllCore] = useState<Stratagem[]>([]);
    const [allDetachment, setAllDetachment] = useState<Stratagem[]>([]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const [core, detachment] = await Promise.all([loadGlobalStratagemData(), loadFactionStratagemData(force.factionSlug, force.detachmentSlug || "")]);

            if (!cancelled) {
                setAllCore(core || []);
                setAllDetachment(detachment || []);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [force.factionSlug, force.detachmentSlug]);

    const grouped = useMemo((): GroupedStratagems => {
        const core = filterByTurn(filterByPhase(allCore, gamePhase), side);
        const detachment = filterByTurn(filterByPhase(allDetachment, gamePhase), side);
        return { core, detachment };
    }, [allCore, allDetachment, gamePhase, side]);

    const totalCount = grouped.core.length + grouped.detachment.length;

    return { grouped, totalCount };
}

interface StratagemDialogProps {
    side: "attacker" | "defender";
    gamePhase: GamePhase;
    force: EngagementForce;
    grouped: GroupedStratagems;
    totalCount: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StratagemDialog({ side, gamePhase, force, grouped, totalCount, open, onOpenChange }: StratagemDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-blockcaps-m">{side === "attacker" ? "Attacker" : "Defender"} Stratagems</DialogTitle>
                    <DialogDescription className="text-blockcaps-xs opacity-75">
                        {PHASE_MAP[gamePhase]} phase &middot; {totalCount} available
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {grouped.detachment.length > 0 && (
                        <div className="space-y-3">
                            <SplitHeading label={force.detachmentName || "Detachment stratagems"} labelClassName="text-blockcaps-xs" />
                            {grouped.detachment.map((s) => (
                                <StratagemCard key={s.id} stratagem={s} />
                            ))}
                        </div>
                    )}

                    {grouped.core.length > 0 && (
                        <div className="space-y-3">
                            <SplitHeading label="Core stratagems" labelClassName="text-blockcaps-xs" />
                            {grouped.core.map((s) => (
                                <StratagemCard key={s.id} stratagem={s} />
                            ))}
                        </div>
                    )}

                    {totalCount === 0 && <p className="text-blockcaps-s opacity-50 text-center py-4">No stratagems available for this phase</p>}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StratagemCard({ stratagem }: { stratagem: Stratagem }) {
    return (
        <div className="border border-skarsnikGreen/30 rounded p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
                <span className="text-blockcaps-s">{stratagem.name}</span>
                <Badge variant="outline">{stratagem.cpCost} CP</Badge>
            </div>
            <p className="text-xs opacity-75 italic">{stratagem.legend}</p>
            <div className="text-xs leading-relaxed [&_b]:text-fireDragonBright" dangerouslySetInnerHTML={{ __html: stratagem.description }} />
        </div>
    );
}

export default StratagemDialog;

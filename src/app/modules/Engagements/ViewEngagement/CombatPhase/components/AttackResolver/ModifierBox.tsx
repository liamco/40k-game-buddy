import React from "react";
import { Badge } from "#components/Badge/Badge";

interface Modifier {
    label: string;
    value: number;
    leaderName?: string;
    isFromLeader?: boolean;
}

interface ModifierBoxProps {
    bonuses?: Modifier[];
    penalties?: Modifier[];
}

/**
 * Format modifier label with leader attribution if applicable
 */
function formatModifierLabel(mod: Modifier): string {
    if (mod.isFromLeader && mod.leaderName) {
        return `${mod.leaderName}: ${mod.label}`;
    }
    return mod.label;
}

function ModifierBox({ bonuses = [], penalties = [] }: ModifierBoxProps) {
    // Filter out zero-value modifiers
    const activeBonuses = bonuses.filter((m) => m.value !== 0);
    const activePenalties = penalties.filter((m) => m.value !== 0);

    // Calculate totals
    const bonusTotal = activeBonuses.reduce((sum, b) => sum + b.value, 0);
    const penaltyTotal = activePenalties.reduce((sum, p) => sum + p.value, 0);

    const hasBonuses = activeBonuses.length > 0;
    const hasPenalties = activePenalties.length > 0;

    return (
        <div className="space-y-2 col-span-3 flex flex-col justify-center items-center">
            {/* Bonuses */}
            {hasBonuses ? (
                <div className="flex items-center gap-1">
                    <div className="flex flex-wrap gap-1 justify-center">
                        {activeBonuses.map((mod, idx) => (
                            <Badge key={idx} variant={mod.isFromLeader ? "leader" : "default"}>
                                <span className="text-blockcaps-s">{formatModifierLabel(mod)}</span>
                            </Badge>
                        ))}
                    </div>
                    <figure className="text-blockcaps-s text-skarsnikGreen">+{bonusTotal}</figure>
                </div>
            ) : (
                <span className="text-blockcaps-s opacity-50">-</span>
            )}

            {/* Penalties */}
            {hasPenalties ? (
                <div className="flex items-center gap-1">
                    <div className="flex flex-wrap gap-1 justify-center">
                        {activePenalties.map((mod, idx) => (
                            <Badge key={idx} variant={mod.isFromLeader ? "leaderDestructive" : "destructive"}>
                                <span className="text-blockcaps-s">{formatModifierLabel(mod)}</span>
                            </Badge>
                        ))}
                    </div>
                    <figure className="text-blockcaps-s text-wildRiderRed">{penaltyTotal}</figure>
                </div>
            ) : (
                <span className="text-blockcaps-s opacity-50">-</span>
            )}
        </div>
    );
}

export default ModifierBox;

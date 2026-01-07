import React, { useMemo } from "react";
import type { Datasheet, WeaponProfile, Model, GamePhase } from "../../types";
import {
    resolveCombat,
    createDefaultCombatStatus,
    type GameContext,
    type CombatResult,
    type CombatStatus,
} from "../../game-engine";

interface AttackResolverProps {
    gamePhase: GamePhase;
    attackingUnit: Datasheet | null;
    attackerAttachedUnit: Datasheet | null;
    defendingUnit: Datasheet | null;
    defenderAttachedUnit: Datasheet | null;
    selectedWeaponProfile: WeaponProfile | null;
    selectedDefendingModel: Model | null;
    attackerCombatStatus: CombatStatus;
    defenderCombatStatus: CombatStatus;
    activeAttackerStratagems: string[];
    activeDefenderStratagems: string[];
}

/**
 * Builds a GameContext from the component props.
 *
 * When a leader is attached to a bodyguard unit:
 * - The leader is the main datasheet
 * - The bodyguard unit is the attachedLeader (for mechanics collection purposes)
 *
 * This allows the game engine to collect abilities from both units.
 */
function buildGameContext(
    gamePhase: GamePhase,
    attackingUnit: Datasheet,
    attackerAttachedUnit: Datasheet | null,
    defendingUnit: Datasheet,
    defenderAttachedUnit: Datasheet | null,
    selectedWeaponProfile: WeaponProfile,
    selectedDefendingModel: Model,
    attackerCombatStatus: CombatStatus,
    defenderCombatStatus: CombatStatus
): GameContext {
    return {
        phase: gamePhase,
        turn: "YOURS",
        battleRound: 1,
        attacker: {
            datasheet: attackingUnit,
            selectedModel: attackingUnit.models?.[0],
            selectedWeapon: selectedWeaponProfile,
            state: attackerCombatStatus,
            // The attached unit (bodyguard) - allows collecting their abilities too
            attachedLeader: attackerAttachedUnit || undefined,
        },
        defender: {
            datasheet: defendingUnit,
            selectedModel: selectedDefendingModel,
            state: defenderCombatStatus,
            // The attached unit (bodyguard) - allows collecting their abilities too
            attachedLeader: defenderAttachedUnit || undefined,
        },
        attackerStratagems: [],
        defenderStratagems: [],
        attackerArmy: {
            factionId: attackingUnit.factionId,
            factionSlug: attackingUnit.factionSlug,
        },
        defenderArmy: {
            factionId: defendingUnit.factionId,
            factionSlug: defendingUnit.factionSlug,
        },
    };
}

/**
 * Maps source to label for backward compatibility.
 */
function mapSourceToLabel(
    items: { source: string; value: number }[]
): { label: string; value: number }[] {
    return items.map((item) => ({ label: item.source, value: item.value }));
}

/**
 * Converts CombatResult to the legacy AttackResult format for backward compatibility.
 */
function convertToLegacyResult(
    result: CombatResult,
    selectedWeaponProfile: WeaponProfile
): {
    toHit: number;
    autoHit: boolean;
    toWound: number;
    toSave: number;
    invulnSave: boolean;
    feelNoPain: number | null;
    hitBonuses: { label: string; value: number }[];
    hitPenalties: { label: string; value: number }[];
    woundBonuses: { label: string; value: number }[];
    woundPenalties: { label: string; value: number }[];
    saveBonuses: { label: string; value: number }[];
    savePenalties: { label: string; value: number }[];
} {
    // Add AP as a save penalty (for display purposes)
    const savePenalties = mapSourceToLabel(result.saveModifiers.penalties);
    if (selectedWeaponProfile.ap < 0) {
        savePenalties.unshift({ label: "AP", value: selectedWeaponProfile.ap });
    }

    return {
        toHit: result.toHit,
        autoHit: result.autoHit,
        toWound: result.toWound,
        toSave: result.toSave,
        invulnSave: result.invulnSaveUsed,
        feelNoPain: result.feelNoPain,
        hitBonuses: mapSourceToLabel(result.hitModifiers.bonuses),
        hitPenalties: mapSourceToLabel(result.hitModifiers.penalties),
        woundBonuses: mapSourceToLabel(result.woundModifiers.bonuses),
        woundPenalties: mapSourceToLabel(result.woundModifiers.penalties),
        saveBonuses: mapSourceToLabel(result.saveModifiers.bonuses),
        savePenalties,
    };
}

function ModifierBadge({
    label,
    value,
    className,
}: {
    label: string;
    value?: number;
    className?: string;
}) {
    const isPositive = value !== undefined && value > 0;
    const bgColor = isPositive
        ? "bg-green-200"
        : value !== undefined && value < 0
          ? "bg-red-200"
          : "bg-[#b3b3b3]";

    return (
        <div className={`${bgColor} px-1.5 py-0.5 rounded-[2px] ${className || ""}`} title={label}>
            <p className="font-bold text-[8px] uppercase">{label}</p>
        </div>
    );
}

function ResultBox({
    label,
    value,
    modifiers,
}: {
    label?: string;
    value: string;
    modifiers?: { label: string; value: number }[];
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-1">
            {label && <p className="font-bold text-[10px]">{label}</p>}
            {modifiers && modifiers.length > 0 && modifiers.some((m) => m.value !== 0) && (
                <div className="flex flex-wrap gap-1 justify-center">
                    {modifiers
                        .filter((m) => m.value !== 0)
                        .map((mod, idx) => (
                            <ModifierBadge key={idx} label={mod.label} value={mod.value} />
                        ))}
                </div>
            )}
            <p className="font-bold text-[24px]">{value}</p>
        </div>
    );
}

function FinalResultBox({ value }: { value: string }) {
    return (
        <div className="bg-[#2b344c] rounded-[4px] p-4 flex items-center justify-center">
            <p className=" font-bold text-[24px] text-white">{value}</p>
        </div>
    );
}

export function AttackResolver({
    gamePhase,
    attackingUnit,
    attackerAttachedUnit,
    defendingUnit,
    defenderAttachedUnit,
    selectedWeaponProfile,
    selectedDefendingModel,
    attackerCombatStatus,
    defenderCombatStatus,
    activeAttackerStratagems,
    activeDefenderStratagems,
}: AttackResolverProps) {
    // Use game engine for combat resolution
    const result = useMemo(() => {
        if (!attackingUnit || !defendingUnit || !selectedWeaponProfile || !selectedDefendingModel) {
            return null;
        }

        const context = buildGameContext(
            gamePhase,
            attackingUnit,
            attackerAttachedUnit,
            defendingUnit,
            defenderAttachedUnit,
            selectedWeaponProfile,
            selectedDefendingModel,
            attackerCombatStatus,
            defenderCombatStatus
        );

        const combatResult = resolveCombat(context);
        return convertToLegacyResult(combatResult, selectedWeaponProfile);
    }, [
        gamePhase,
        attackingUnit,
        attackerAttachedUnit,
        defendingUnit,
        defenderAttachedUnit,
        selectedWeaponProfile,
        selectedDefendingModel,
        attackerCombatStatus,
        defenderCombatStatus,
    ]);

    if (!result) {
        return (
            <div className="bg-white rounded-[8px] border-4 border-[#e6e6e6] p-6 flex items-center justify-center min-h-[300px]">
                <p className="text-[#767676] text-center">
                    Select an attacking unit with a weapon and a target unit to calculate attack
                    resolution
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[8px] border-4 border-[#e6e6e6] p-6 space-y-6">
            <section>
                <p className="font-bold text-[12px] pb-2 border-b border-[#e6e6e6]">To hit</p>
                <div className="grid grid-cols-4 gap-2 pt-4">
                    <ResultBox
                        label="BS"
                        value={result.autoHit ? "N/A" : `${selectedWeaponProfile?.bsWs}+`}
                    />
                    {result.hitBonuses.length ? (
                        <ResultBox
                            value={`+${result.hitBonuses.reduce((sum, b) => sum + b.value, 0)}`}
                            modifiers={result.hitBonuses}
                        />
                    ) : (
                        <div className="flex items-center justify-center">
                            <p className="font-bold text-[24px]">-</p>
                        </div>
                    )}
                    {result.hitPenalties.length ? (
                        <ResultBox
                            value={`${result.hitPenalties.reduce((sum, p) => sum + p.value, 0)}`}
                            modifiers={result.hitPenalties}
                        />
                    ) : (
                        <div className="flex items-center justify-center">
                            <p className="font-bold text-[24px]">-</p>
                        </div>
                    )}
                    <FinalResultBox value={result.autoHit ? "Auto" : `${result.toHit}+`} />
                </div>
            </section>

            <section>
                <p className="font-bold text-[12px] pb-2 border-b border-[#e6e6e6]">To wound</p>
                <div className="grid grid-cols-4 gap-2 pt-4">
                    <div className="flex items-center justify-center">
                        <p className="font-bold text-[24px]">-</p>
                    </div>
                    {result.woundBonuses.length ? (
                        <ResultBox
                            value={`+${result.woundBonuses.reduce((sum, b) => sum + b.value, 0)}`}
                            modifiers={result.woundBonuses}
                        />
                    ) : (
                        <div className="flex items-center justify-center">
                            <p className="font-bold text-[24px]">-</p>
                        </div>
                    )}
                    {result.woundPenalties.length ? (
                        <ResultBox
                            value={`${result.woundPenalties.reduce((sum, p) => sum + p.value, 0)}`}
                            modifiers={result.woundPenalties}
                        />
                    ) : (
                        <div className="flex items-center justify-center">
                            <p className="font-bold text-[24px]">-</p>
                        </div>
                    )}
                    <FinalResultBox value={`${result.toWound}+`} />
                </div>
            </section>

            <section>
                <p className="font-bold text-[12px] pb-2 border-b border-[#e6e6e6]">To save</p>
                <div className="grid grid-cols-4 gap-2 pt-4">
                    <ResultBox label="Save" value={`${selectedDefendingModel?.sv}+`} />
                    {result.saveBonuses.length ? (
                        <ResultBox
                            value={`+${result.saveBonuses.reduce((sum, b) => sum + b.value, 0)}`}
                            modifiers={result.saveBonuses}
                        />
                    ) : (
                        <div className="flex items-center justify-center">
                            <p className="font-bold text-[24px]">-</p>
                        </div>
                    )}
                    {result.savePenalties.length ? (
                        <ResultBox
                            value={`${result.savePenalties.reduce((sum, p) => sum + p.value, 0)}`}
                            modifiers={result.savePenalties}
                        />
                    ) : (
                        <div className="flex items-center justify-center">
                            <p className="font-bold text-[24px]">-</p>
                        </div>
                    )}
                    <FinalResultBox
                        value={
                            result.toSave < 7
                                ? `${result.toSave}+${result.invulnSave ? "+" : ""}`
                                : `-`
                        }
                    />
                </div>
            </section>

            <section>
                <p className="font-bold text-[12px] pb-2 border-b border-[#e6e6e6]">Feel no pain</p>
                <div className="grid grid-cols-4 gap-2 pt-4">
                    <div className="flex items-center justify-center">
                        <p className="font-bold text-[24px]">-</p>
                    </div>
                    <div className="flex items-center justify-center">
                        <p className="font-bold text-[24px]">-</p>
                    </div>
                    <div className="flex items-center justify-center">
                        <p className="font-bold text-[24px]">-</p>
                    </div>
                    <FinalResultBox value={result.feelNoPain ? `${result.feelNoPain}+` : "-"} />
                </div>
            </section>
        </div>
    );
}

export default AttackResolver;

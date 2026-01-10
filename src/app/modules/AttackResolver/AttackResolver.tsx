import React, { useMemo } from "react";
import type { Datasheet, WeaponProfile, Model, GamePhase } from "../../types";
import { resolveCombat, createDefaultCombatStatus, type GameContext, type CombatResult, type CombatStatus } from "../../game-engine";

import AttackStep from "./components/AttackStep";

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
function buildGameContext(gamePhase: GamePhase, attackingUnit: Datasheet, attackerAttachedUnit: Datasheet | null, defendingUnit: Datasheet, defenderAttachedUnit: Datasheet | null, selectedWeaponProfile: WeaponProfile, selectedDefendingModel: Model, attackerCombatStatus: CombatStatus, defenderCombatStatus: CombatStatus): GameContext {
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
function mapSourceToLabel(items: { source: string; value: number }[]): { label: string; value: number }[] {
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

export function AttackResolver({ gamePhase, attackingUnit, attackerAttachedUnit, defendingUnit, defenderAttachedUnit, selectedWeaponProfile, selectedDefendingModel, attackerCombatStatus, defenderCombatStatus, activeAttackerStratagems, activeDefenderStratagems }: AttackResolverProps) {
    // Use game engine for combat resolution
    const result = useMemo(() => {
        if (!attackingUnit || !defendingUnit || !selectedWeaponProfile || !selectedDefendingModel) {
            return null;
        }

        const context = buildGameContext(gamePhase, attackingUnit, attackerAttachedUnit, defendingUnit, defenderAttachedUnit, selectedWeaponProfile, selectedDefendingModel, attackerCombatStatus, defenderCombatStatus);
        const combatResult = resolveCombat(context);
        return convertToLegacyResult(combatResult, selectedWeaponProfile);
    }, [gamePhase, attackingUnit, attackerAttachedUnit, defendingUnit, defenderAttachedUnit, selectedWeaponProfile, selectedDefendingModel, attackerCombatStatus, defenderCombatStatus]);

    if (!result) {
        return (
            <div className="col-span-2  rounded border-2  p-6 flex items-center justify-center">
                <p className=" text-center">Select an attacking unit with a weapon and a target unit to calculate attack resolution</p>
            </div>
        );
    }

    return (
        <section className="col-span-2 grid grid-cols-5 rounded border-2 border-skarsnikGreen">
            <AttackStep label="To hit" statLabel="BS" statValue={result.autoHit ? "N/A" : `${selectedWeaponProfile?.bsWs}+`} bonuses={result.hitBonuses} penalties={result.hitPenalties} finalValue={result.autoHit ? "Auto" : `${result.toHit}+`} />

            <AttackStep label="To wound" bonuses={result.woundBonuses} penalties={result.woundPenalties} finalValue={`${result.toWound}+`} />

            <AttackStep label="To save" statLabel="Save" statValue={`${selectedDefendingModel?.sv}+`} bonuses={result.saveBonuses} penalties={result.savePenalties} finalValue={result.toSave < 7 ? `${result.toSave}+${result.invulnSave ? "+" : ""}` : `-`} finalClassName={result.invulnSave ? "bg-amber-300" : "bg-black"} />

            <AttackStep label="Feel no pain" bonuses={[]} penalties={[]} finalValue={result.feelNoPain ? `${result.feelNoPain}+` : "-"} />
        </section>
    );
}

export default AttackResolver;

/**
 * React hook for combat resolution
 */

import { useMemo } from "react";

import type { EngagementForceItem, EngagementForce } from "#types/Engagements";
import type { WeaponProfile, Model, GamePhase } from "#types/index";

import { buildCombatContext, type CombatContext, type ActiveStratagem } from "../types/CombatContext";
import type { CombatResolution } from "../types/ModifierResult";
import { resolveCombat } from "../CombatEngine";

export interface UseCombatResolutionParams {
    phase: GamePhase;
    turn?: number;
    isPlayerTurn?: boolean;

    attackerUnit: EngagementForceItem | null;
    attackerForce: EngagementForce;
    weaponProfile: WeaponProfile | null;
    modelCount: number;

    defenderUnit: EngagementForceItem | null;
    defenderForce: EngagementForce;
    targetModel: Model | null;

    activeStratagems?: ActiveStratagem[];
}

/**
 * Hook to compute combat resolution with memoization
 *
 * Returns null if required data is missing (attacker, weapon, defender, target)
 */
export function useCombatResolution(params: UseCombatResolutionParams): CombatResolution | null {
    const {
        phase,
        turn,
        isPlayerTurn,
        attackerUnit,
        attackerForce,
        weaponProfile,
        modelCount,
        defenderUnit,
        defenderForce,
        targetModel,
        activeStratagems,
    } = params;

    return useMemo(() => {
        const context = buildCombatContext({
            phase,
            turn,
            isPlayerTurn,
            attackerUnit,
            attackerForce,
            weaponProfile,
            modelCount,
            defenderUnit,
            defenderForce,
            targetModel,
            activeStratagems,
        });

        if (!context) return null;

        return resolveCombat(context);
    }, [
        phase,
        turn,
        isPlayerTurn,
        attackerUnit,
        attackerForce,
        weaponProfile,
        modelCount,
        defenderUnit,
        defenderForce,
        targetModel,
        activeStratagems,
    ]);
}

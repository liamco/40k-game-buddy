/**
 * React hook for combat resolution
 */

import { useMemo } from "react";

import type { EngagementForceItem, EngagementForce } from "#types/Engagements";
import type { FactionAbility } from "#types/Factions";
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
    weaponCount?: number; // Number of this weapon the model has (multiplies attacks)
    modelCount: number;

    defenderUnit: EngagementForceItem | null;
    defenderForce: EngagementForce;
    targetModel: Model | null;

    activeStratagems?: ActiveStratagem[];
    attackerFactionAbilities?: FactionAbility[];
    isOverwatch?: boolean;
}

/**
 * Hook to compute combat resolution with memoization
 *
 * Returns null if required data is missing (attacker, weapon, defender, target)
 */
export function useCombatResolution(params: UseCombatResolutionParams): CombatResolution | null {
    const { phase, turn, isPlayerTurn, attackerUnit, attackerForce, weaponProfile, weaponCount, modelCount, defenderUnit, defenderForce, targetModel, activeStratagems, attackerFactionAbilities, isOverwatch } = params;

    return useMemo(() => {
        const context = buildCombatContext({
            phase,
            turn,
            isPlayerTurn,
            attackerUnit,
            attackerForce,
            weaponProfile,
            weaponCount,
            modelCount,
            defenderUnit,
            defenderForce,
            targetModel,
            activeStratagems,
            attackerFactionAbilities,
            isOverwatch,
        });

        if (!context) return null;

        return resolveCombat(context);
    }, [phase, turn, isPlayerTurn, attackerUnit, attackerForce, weaponProfile, weaponCount, modelCount, defenderUnit, defenderForce, targetModel, activeStratagems, attackerFactionAbilities, isOverwatch]);
}

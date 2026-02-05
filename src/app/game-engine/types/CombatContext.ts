/**
 * Combat context - the game state passed to the Combat Engine
 */

import type { EngagementForceItem, EngagementForce } from "#types/Engagements";
import type { WeaponProfile, Model, GamePhase } from "#types/index";
import type { Mechanic } from "./Mechanic";

/**
 * Which side of the combat interaction
 */
export type CombatRole = "attacker" | "defender";

/**
 * An activated stratagem affecting combat
 */
export interface ActiveStratagem {
    id: string;
    name: string;
    mechanics: Mechanic[];
    appliesTo: CombatRole;
    targetUnitId?: string;
}

/**
 * The complete game state for combat resolution.
 * Passed to the CombatEngine for modifier evaluation.
 */
export interface CombatContext {
    phase: GamePhase;
    turn: number;
    isPlayerTurn: boolean;

    attacker: {
        unit: EngagementForceItem;
        force: EngagementForce;
        weaponProfile: WeaponProfile;
        weaponCount: number; // Number of this weapon the model has (multiplies attacks)
        modelCount: number;
    };

    defender: {
        unit: EngagementForceItem;
        force: EngagementForce;
        targetModel: Model;
        modelCount: number;
    };

    activeStratagems: ActiveStratagem[];
}

/**
 * Calculate the number of alive models in a unit
 */
function calculateAliveModelCount(unit: EngagementForceItem): number {
    const combatState = unit.combatState;
    if (!combatState) return 1;

    const totalModels = combatState.modelCount || 1;
    const deadCount = combatState.deadModelIds?.length || 0;

    return Math.max(0, totalModels - deadCount);
}

/**
 * Build a CombatContext from component state.
 * Returns null if required data is missing.
 */
export function buildCombatContext(params: {
    phase: GamePhase;
    turn?: number;
    isPlayerTurn?: boolean;
    attackerUnit: EngagementForceItem | null;
    attackerForce: EngagementForce;
    weaponProfile: WeaponProfile | null;
    weaponCount?: number;
    modelCount: number;
    defenderUnit: EngagementForceItem | null;
    defenderForce: EngagementForce;
    defenderModelCount?: number;
    targetModel: Model | null;
    activeStratagems?: ActiveStratagem[];
}): CombatContext | null {
    const { phase, turn = 1, isPlayerTurn = true, attackerUnit, attackerForce, weaponProfile, weaponCount = 1, modelCount, defenderUnit, defenderForce, defenderModelCount, targetModel, activeStratagems = [] } = params;

    if (!attackerUnit || !weaponProfile || !defenderUnit || !targetModel) {
        return null;
    }

    return {
        phase,
        turn,
        isPlayerTurn,
        attacker: {
            unit: attackerUnit,
            force: attackerForce,
            weaponProfile,
            weaponCount,
            modelCount,
        },
        defender: {
            unit: defenderUnit,
            force: defenderForce,
            targetModel,
            modelCount: defenderModelCount ?? calculateAliveModelCount(defenderUnit),
        },
        activeStratagems,
    };
}

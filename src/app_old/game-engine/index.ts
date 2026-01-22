/**
 * Warhammer 40k Game Engine
 *
 * A modular engine for calculating combat mechanics in Warhammer 40,000 10th Edition.
 *
 * ## Main Functions
 *
 * - `resolveCombat(context)` - Full combat resolution with all mechanics
 * - `collectMechanics(context)` - Gather all applicable mechanics
 * - `applyMechanics(mechanics, context, perspective)` - Apply mechanics to get modified stats
 *
 * ## Usage Example
 *
 * ```typescript
 * import { resolveCombat, GameContext } from './game-engine';
 *
 * const context: GameContext = {
 *   phase: 'SHOOTING',
 *   turn: 'YOURS',
 *   battleRound: 1,
 *   attacker: {
 *     datasheet: myUnit,
 *     selectedModel: myUnit.models[0],
 *     selectedWeapon: myUnit.wargear[0].profiles[0],
 *     state: { isStationary: true, inCover: false, ... },
 *   },
 *   defender: {
 *     datasheet: enemyUnit,
 *     selectedModel: enemyUnit.models[0],
 *     state: { inCover: true, ... },
 *   },
 *   attackerStratagems: [],
 *   defenderStratagems: [],
 *   attackerArmy: { factionId: 'SM', factionSlug: 'space-marines' },
 *   defenderArmy: { factionId: 'TYR', factionSlug: 'tyranids' },
 * };
 *
 * const result = resolveCombat(context);
 * console.log(`To Hit: ${result.toHit}+`);
 * console.log(`To Wound: ${result.toWound}+`);
 * console.log(`To Save: ${result.toSave}+`);
 * ```
 */

// ============================================
// MAIN PUBLIC API
// ============================================

import { calculateCombat, getModifiedStats } from "./calculators";
import { collectAllMechanics } from "./collectors";
import { applyEffects } from "./applicators";
import type {
    GameContext,
    CombatResult,
    CollectedMechanics,
    ModifiedStats,
    Mechanic,
} from "./types";

/**
 * Main entry point for combat resolution.
 *
 * This function:
 * 1. Collects all mechanics from unit abilities, weapons, stratagems, etc.
 * 2. Evaluates conditions to determine which mechanics apply
 * 3. Applies effects to modify stats
 * 4. Calculates hit, wound, and save roll targets
 * 5. Returns full combat results with modifier breakdowns
 *
 * @param context - The full game context
 * @returns Complete combat calculation result
 */
export function resolveCombat(context: GameContext): CombatResult {
    return calculateCombat(context);
}

/**
 * Collects all applicable mechanics for a given context.
 *
 * Useful for:
 * - Debugging which mechanics are in play
 * - Displaying active abilities to the user
 * - Custom mechanic processing
 *
 * @param context - The full game context
 * @returns Collected mechanics split by attacker/defender
 */
export function collectMechanics(context: GameContext): CollectedMechanics {
    return collectAllMechanics(context);
}

/**
 * Applies mechanics to produce modified stats.
 *
 * Useful for:
 * - Displaying effective stat profiles
 * - Custom stat calculations
 * - Showing users what modifiers are active
 *
 * @param mechanics - Array of mechanics to apply
 * @param context - The game context
 * @param perspective - Whether applying to "attacker" or "defender"
 * @returns Modified stats after applying mechanics
 */
export function applyMechanics(
    mechanics: Mechanic[],
    context: GameContext,
    perspective: "attacker" | "defender"
): ModifiedStats {
    return applyEffects(mechanics, context, perspective);
}

/**
 * Gets the modified stats for a unit in context.
 *
 * @param context - The game context
 * @param perspective - Which unit to get stats for
 * @returns Modified stats
 */
export { getModifiedStats };

// ============================================
// RE-EXPORT TYPES
// ============================================

export type {
    // Core types
    Entity,
    Effect,
    Attribute,
    RollAttribute,
    UnitAttribute,
    WeaponAttribute,
    Operator,

    // Mechanic types
    Condition,
    Mechanic,
    MechanicSource,
    MechanicSourceType,

    // Context types
    GameContext,
    UnitContext,
    UnitState,
    CombatStatus,
    CombatStatusFlag,
    CombatStatusItem,
    ArmyContext,
    ActiveStratagem,
    Enhancement,
    DetachmentAbility,

    // Result types
    CombatResult,
    CollectedMechanics,
    ModifiedStats,
    ModifiedModelStats,
    ModifiedWeaponStats,
    ModifierBreakdown,
    AppliedMechanic,
    RollModifier,
    RerollType,
    CappedModifierResult,
} from "./types";

// Re-export schema constants and helpers
export {
    ENTITIES,
    EFFECTS,
    ROLL_ATTRIBUTES,
    UNIT_ATTRIBUTES,
    WEAPON_ATTRIBUTES,
    ATTRIBUTES,
    OPERATORS,
    COMBAT_STATUS_FLAGS,
    REROLL_TYPES,
    MECHANIC_SOURCE_TYPES,
    MECHANIC_SCHEMA,
    createDefaultCombatStatus,
} from "./types";

// ============================================
// RE-EXPORT SUB-MODULES (for advanced usage)
// ============================================

// Collectors
export {
    collectAllMechanics,
    collectUnitAbilities,
    collectCombatAbilities,
    collectWeaponAttributes,
    convertWeaponAttribute,
    collectEnhancement,
    collectStratagems,
    filterApplicableStratagems,
    collectDetachmentAbilities,
    filterMechanicsByRollType,
    filterAbilityMechanics,
    filterKeywordMechanics,
    filterStaticNumberMechanics,
} from "./collectors";

// Evaluators
export {
    evaluateCondition,
    evaluateMechanic,
    evaluateMechanicWithReason,
    filterApplicableMechanics,
    resolveEntityState,
    getEntityAttributeValue,
    checkEntityState,
    entityHasKeyword,
    entityHasAnyKeyword,
    entityHasAbility,
    entityHasAnyAbility,
    type EntityState,
} from "./evaluators";

// Applicators
export {
    applyEffects,
    applyEffectsWithDetails,
    capRollModifiers,
    calculateNetModifier,
    separateModifiers,
    createModifierBreakdown,
} from "./applicators";

// Calculators
export {
    calculateCombat,
    calculateHitTarget,
    getHitProbability,
    calculateWoundTarget,
    calculateBaseWoundTarget,
    getWoundProbability,
    calculateSaveTarget,
    getSaveProbability,
    getFailedSaveProbability,
    calculateExpectedDamage,
    parseDamageValue,
    parseAttackValue,
    applyFeelNoPain,
    type HitCalculationResult,
    type WoundCalculationResult,
    type SaveCalculationResult,
    type DamageCalculationResult,
} from "./calculators";

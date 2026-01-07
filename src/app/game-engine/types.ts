import type { Datasheet, Model, WeaponProfile, Stratagem, GamePhase, GameTurn } from "../types";

// ============================================
// RE-EXPORT SCHEMA TYPES
// ============================================

// Import and re-export all schema types from the single source of truth
export type {
    Entity,
    Effect,
    RollAttribute,
    UnitAttribute,
    WeaponAttribute,
    Attribute,
    Operator,
    CombatStatusItem,
    CombatStatusFlag,
    CombatStatus,
    RerollType,
    MechanicSourceType,
} from "./mechanic-schema";

// Re-export const arrays for runtime use
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
} from "./mechanic-schema";

// ============================================
// CONDITION INTERFACE
// ============================================

/**
 * A condition that must be met for a mechanic to apply.
 */
export interface Condition {
    /** Which entity to check */
    entity: Entity;

    /** Optional: which attribute to check */
    attribute?: Attribute;

    /** Optional: state to check (e.g., "inCover", "isStationary") */
    state?: string;

    /** Optional: check if entity has these keywords */
    keywords?: string[];

    /** Optional: check if entity has these abilities */
    abilities?: string[];

    /** Comparison operator */
    operator: Operator;

    /** Value to compare against */
    value: boolean | number | string | null;
}

// ============================================
// MECHANIC SOURCE (for UI display)
// ============================================

export interface MechanicSource {
    type: MechanicSourceType;
    name: string;
    /** For abilities from attached leaders */
    unitName?: string;
}

// ============================================
// MECHANIC INTERFACE
// ============================================

/**
 * A mechanic represents a game effect that can modify stats, rolls, or grant abilities.
 */
export interface Mechanic {
    /** What entity is affected */
    entity: Entity;

    /** What the effect does */
    effect: Effect;

    /** Which attribute is modified (for rollBonus, rollPenalty, staticNumber) */
    attribute?: Attribute;

    /** Abilities being added (for addsAbility) */
    abilities?: string[];

    /** Keywords being added (for addsKeyword) */
    keywords?: string[];

    /** State requirements/additions */
    state?: string[];

    /** The effect value */
    value: boolean | number | string | null;

    /** Conditions that must be met for this mechanic to apply */
    conditions?: Condition[];

    /** Source tracking for UI display (added at collection time) */
    source?: MechanicSource;
}

// ============================================
// ROLL MODIFIER (tracked with source)
// ============================================

export interface RollModifier {
    value: number;
    source: MechanicSource;
    /** True if this modifier was reduced by the cap */
    isCapped?: boolean;
}

/**
 * @deprecated Use CombatStatus instead
 */
export type UnitState = CombatStatus;

// ============================================
// GAME CONTEXT
// ============================================

/**
 * Context for a single unit in combat.
 */
export interface UnitContext {
    /** The unit's datasheet */
    datasheet: Datasheet;

    /** Which model profile is being used */
    selectedModel?: Model;

    /** Which weapon is being used (for attacker) */
    selectedWeapon?: WeaponProfile;

    /** Unit state flags */
    state: UnitState;

    /** Attached leader (if any) */
    attachedLeader?: Datasheet;

    /** Equipped enhancement (if any) */
    enhancement?: Enhancement;
}

/**
 * Enhancement definition.
 */
export interface Enhancement {
    id: string;
    name: string;
    description?: string;
    mechanics?: Mechanic[];
}

/**
 * Detachment ability definition.
 */
export interface DetachmentAbility {
    id: string;
    name: string;
    description?: string;
    mechanics?: Mechanic[];
}

/**
 * Army-level context.
 */
export interface ArmyContext {
    factionId: string;
    factionSlug: string;
    detachmentSlug?: string;
    detachmentAbilities?: DetachmentAbility[];
    /** Unit ID if Oath of Moment (or similar) is targeting a specific unit */
    oathOfMomentTarget?: string;
}

/**
 * Active stratagem with optional target.
 */
export interface ActiveStratagem {
    stratagem: Stratagem;
    /** Which unit the stratagem targets */
    targetUnitId?: string;
}

/**
 * The full game context passed to the engine.
 */
export interface GameContext {
    /** Current game phase */
    phase: GamePhase;

    /** Whose turn it is */
    turn: GameTurn;

    /** Current battle round (1-5) */
    battleRound: number;

    /** Attacker context */
    attacker: UnitContext;

    /** Defender context */
    defender: UnitContext;

    /** Active stratagems for attacker */
    attackerStratagems: ActiveStratagem[];

    /** Active stratagems for defender */
    defenderStratagems: ActiveStratagem[];

    /** Army context for attacker */
    attackerArmy: ArmyContext;

    /** Army context for defender */
    defenderArmy: ArmyContext;
}

// ============================================
// COLLECTED MECHANICS OUTPUT
// ============================================

export interface CollectedMechanics {
    /** Mechanics that apply to the attacker */
    attackerMechanics: Mechanic[];

    /** Mechanics that apply to the defender */
    defenderMechanics: Mechanic[];
}

// ============================================
// MODIFIED STATS OUTPUT
// ============================================

export interface ModifiedModelStats {
    m: number;
    t: number;
    sv: number;
    invSv: number | null;
    w: number;
    ld: number;
    oc: number;
}

export interface ModifiedWeaponStats {
    range: number;
    a: number | string;
    bsWs: number;
    s: number;
    ap: number;
    d: number | string;
    attributes: string[];
}

export interface ModifiedStats {
    /** Model stats (potentially modified) */
    model: ModifiedModelStats;

    /** Weapon stats (potentially modified) */
    weapon?: ModifiedWeaponStats;

    /** Abilities added by mechanics */
    addedAbilities: string[];

    /** Keywords added by mechanics */
    addedKeywords: string[];

    /** Roll modifiers by type */
    rollModifiers: {
        hit: RollModifier[];
        wound: RollModifier[];
        save: RollModifier[];
    };

    /** Special effects */
    autoHit: boolean;
    autoWound: boolean;
    rerollHits: RerollType;
    rerollWounds: RerollType;
    rerollSaves: RerollType;

    /** Feel No Pain value (if any) */
    feelNoPain: number | null;
}

// ============================================
// MODIFIER BREAKDOWN (for UI)
// ============================================

export interface ModifierBreakdown {
    bonuses: { source: string; value: number }[];
    penalties: { source: string; value: number }[];
    netModifier: number;
    /** If modifier was capped, what it was capped to */
    cappedTo: number | null;
}

// ============================================
// APPLIED MECHANIC (for debugging/transparency)
// ============================================

export interface AppliedMechanic {
    mechanic: Mechanic;
    applied: boolean;
    /** Why it was/wasn't applied */
    reason?: string;
}

// ============================================
// COMBAT RESULT OUTPUT
// ============================================

export interface CombatResult {
    /** Target number for hit roll (2-6, or 0 if auto-hit) */
    toHit: number;

    /** Target number for wound roll (2-6) */
    toWound: number;

    /** Target number for save roll (2-7, 7 means no save possible) */
    toSave: number;

    /** True if hits are automatic (TORRENT) */
    autoHit: boolean;

    /** True if invulnerable save was better than armor */
    invulnSaveUsed: boolean;

    /** Feel No Pain value (null if none) */
    feelNoPain: number | null;

    /** Hit modifier breakdown */
    hitModifiers: ModifierBreakdown;

    /** Wound modifier breakdown */
    woundModifiers: ModifierBreakdown;

    /** Save modifier breakdown */
    saveModifiers: ModifierBreakdown;

    /** Expected damage per attack (statistical) */
    expectedDamage?: number;

    /** All mechanics that were evaluated (for debugging) */
    appliedMechanics: AppliedMechanic[];
}

// ============================================
// CAPPED RESULT (from modifier capper)
// ============================================

export interface CappedModifierResult {
    modifiers: RollModifier[];
    netValue: number;
    wasCapped: boolean;
}

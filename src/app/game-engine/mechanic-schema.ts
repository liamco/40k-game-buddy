/**
 * Mechanic Schema - Single Source of Truth
 *
 * This file defines all valid values for mechanic properties as const arrays.
 * Types are derived from these arrays, and they can be serialized into the
 * OpenAI prompt for consistent mechanic extraction.
 */

// ============================================
// ENTITY VALUES
// ============================================

/**
 * Entities represent what is affected by or checked in a mechanic.
 */
export const ENTITIES = [
    "thisArmy", // The unit/model's army
    "thisUnit", // The unit itself
    "thisModel", // A specific model
    "opponentArmy", // The opponent's army
    "opposingUnit", // A unit from the opponent's army
    "opposingModel", // A model from the opponent's army
    "targetUnit", // The unit being targeted (attacked)
    "targetModel", // The model being targeted
] as const;

export type Entity = (typeof ENTITIES)[number];

// ============================================
// EFFECT VALUES
// ============================================

/**
 * The type of effect a mechanic applies.
 */
export const EFFECTS = [
    "rollBonus", // Add to a roll (positive modifier)
    "rollPenalty", // Subtract from a roll (negative modifier)
    "staticNumber", // Set a characteristic to a fixed value
    "addsKeyword", // Grant keywords to an entity
    "addsAbility", // Grant abilities to an entity
    "reroll", // Allow re-rolling dice
    "autoSuccess", // Auto-succeed (e.g., auto-hit from TORRENT)
    "mortalWounds", // Deal mortal wounds
] as const;

export type Effect = (typeof EFFECTS)[number];

// ============================================
// ATTRIBUTE VALUES
// ============================================

/** Roll types that can be modified */
export const ROLL_ATTRIBUTES = [
    "h", // Hit rolls
    "w", // Wound rolls
    "s", // Save rolls
] as const;

/** Unit/model characteristics */
export const UNIT_ATTRIBUTES = [
    "m", // Movement
    "t", // Toughness
    "sv", // Save
    "invSv", // Invulnerable Save
    "w", // Wounds
    "ld", // Leadership
    "oc", // Objective Control
] as const;

/** Weapon characteristics */
export const WEAPON_ATTRIBUTES = [
    "range", // Weapon range
    "a", // Attacks
    "bsWs", // Ballistic Skill / Weapon Skill
    "s", // Strength
    "ap", // Armour Penetration
    "d", // Damage
] as const;

/** All modifiable attributes */
export const ATTRIBUTES = [...ROLL_ATTRIBUTES, ...UNIT_ATTRIBUTES, ...WEAPON_ATTRIBUTES] as const;

export type RollAttribute = (typeof ROLL_ATTRIBUTES)[number];
export type UnitAttribute = (typeof UNIT_ATTRIBUTES)[number];
export type WeaponAttribute = (typeof WEAPON_ATTRIBUTES)[number];
export type Attribute = (typeof ATTRIBUTES)[number];

// ============================================
// OPERATOR VALUES
// ============================================

/**
 * Comparison operators for conditions.
 */
export const OPERATORS = [
    "equals",
    "notEquals",
    "greaterThan",
    "greaterThanOrEqualTo",
    "lessThan",
    "lessThanOrEqualTo",
    "includes", // For array checks (keywords, abilities)
    "notIncludes",
] as const;

export type Operator = (typeof OPERATORS)[number];

// ============================================
// COMBAT STATUS FLAGS
// ============================================

/**
 * All possible combat status flags with human-readable labels.
 * These represent the state of a unit on the battlefield.
 */
export const COMBAT_STATUS_FLAGS = [
    { name: "isStationary", label: "Stationary" },
    { name: "inCover", label: "In Cover" },
    { name: "inEngagementRange", label: "In Engagement Range" },
    { name: "inRangeOfObjective", label: "In Range of Objective" },
    { name: "inRangeOfContestedObjective", label: "In Range of Contested Objective" },
    { name: "inRangeOfFriendlyObjective", label: "In Range of Friendly Objective" },
    { name: "inRangeOfEnemyObjective", label: "In Range of Enemy Objective" },
    { name: "isBattleShocked", label: "Battle-shocked" },
    { name: "hasFiredThisPhase", label: "Fired This Phase" },
    { name: "hasChargedThisTurn", label: "Charged This Turn" },
    { name: "isBelowHalfStrength", label: "Below Half Strength" },
    { name: "isBelowStartingStrength", label: "Below Starting Strength" },
    { name: "isDamaged", label: "Damaged (Bracketed)" },
    { name: "isLeadingUnit", label: "Leading a Unit" },
    { name: "isBeingLed", label: "Being Led" },
] as const;

export type CombatStatusItem = (typeof COMBAT_STATUS_FLAGS)[number];
export type CombatStatusFlag = CombatStatusItem["name"];
export type CombatStatus = Record<CombatStatusFlag, boolean>;

// ============================================
// REROLL TYPES
// ============================================

export const REROLL_TYPES = [
    "none", // No rerolls
    "ones", // Reroll 1s
    "all", // Reroll all dice
    "failed", // Reroll failed dice
] as const;

export type RerollType = (typeof REROLL_TYPES)[number];

// ============================================
// MECHANIC SOURCE TYPES
// ============================================

export const MECHANIC_SOURCE_TYPES = [
    "ability", // Unit ability
    "weapon", // Weapon attribute
    "stratagem", // Stratagem
    "detachment", // Detachment ability
    "enhancement", // Enhancement
    "core", // Core game rule
] as const;

export type MechanicSourceType = (typeof MECHANIC_SOURCE_TYPES)[number];

// ============================================
// SCHEMA EXPORT FOR PROMPT GENERATION
// ============================================

/**
 * Export schema values for use in OpenAI prompt generation.
 * This allows the extract-effects script to dynamically build
 * the prompt with current valid values.
 */
export const MECHANIC_SCHEMA = {
    entities: ENTITIES,
    effects: EFFECTS,
    attributes: {
        all: ATTRIBUTES,
        roll: ROLL_ATTRIBUTES,
        unit: UNIT_ATTRIBUTES,
        weapon: WEAPON_ATTRIBUTES,
    },
    operators: OPERATORS,
    combatStatusFlags: COMBAT_STATUS_FLAGS,
    rerollTypes: REROLL_TYPES,
    mechanicSourceTypes: MECHANIC_SOURCE_TYPES,
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Creates a default CombatStatus with all flags set to false.
 * Dynamically generated from COMBAT_STATUS_FLAGS to stay in sync.
 */
export function createDefaultCombatStatus(): CombatStatus {
    const status = {} as CombatStatus;
    for (const flag of COMBAT_STATUS_FLAGS) {
        status[flag.name] = false;
    }
    return status;
}

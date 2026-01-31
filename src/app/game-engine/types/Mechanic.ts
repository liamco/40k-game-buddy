/**
 * Core mechanic types for the Combat Engine
 * Mirrors the schema defined in scripts/openai-extractors/mechanic-schema.js
 */

/**
 * Entity that a mechanic targets or references
 */
export type Entity =
    | "thisArmy"
    | "thisUnit"
    | "thisModel"
    | "opponentArmy"
    | "opposingUnit"
    | "opposingModel"
    | "targetUnit"
    | "targetModel";

/**
 * Type of effect the mechanic applies
 */
export type Effect =
    | "rollBonus"
    | "rollPenalty"
    | "staticNumber"
    | "addsKeyword"
    | "addsAbility"
    | "reroll"
    | "autoSuccess"
    | "mortalWounds"
    | "ignoreModifier"
    | "halveDamage"
    | "minDamage";

/**
 * Roll-related attributes
 */
export type RollAttribute = "h" | "w" | "s"; // hit, wound, save

/**
 * Unit characteristics
 */
export type UnitAttribute = "m" | "t" | "sv" | "invSv" | "w" | "ld" | "oc" | "fnp";

/**
 * Weapon characteristics
 */
export type WeaponAttribute = "range" | "a" | "bsWs" | "s" | "ap" | "d";

export type Attribute = RollAttribute | UnitAttribute | WeaponAttribute;

/**
 * Comparison operators for conditions
 */
export type Operator =
    | "equals"
    | "notEquals"
    | "greaterThan"
    | "greaterThanOrEqualTo"
    | "lessThan"
    | "lessThanOrEqualTo"
    | "includes"
    | "notIncludes";

/**
 * Condition that must be met for a mechanic to apply
 */
export interface Condition {
    entity: Entity;
    attribute?: Attribute;
    abilities?: string[];
    state?: string;
    keywords?: string[];
    operator: Operator;
    value: boolean | number | string | string[];
}

/**
 * A single game mechanic extracted from ability descriptions
 */
export interface Mechanic {
    entity: Entity;
    effect: Effect;
    attribute?: Attribute;
    abilities?: string[];
    keywords?: string[];
    state?: string[];
    value: boolean | number | string;
    conditions?: Condition[];
}

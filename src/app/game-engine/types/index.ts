/**
 * Game Engine Types - Public API
 */

export type { Entity, Effect, RollAttribute, UnitAttribute, WeaponAttribute, Attribute, Operator, Condition, Mechanic } from "./Mechanic";

export type { EffectSourceType, EffectSource } from "./EffectSource";
export { SOURCE_PRIORITIES, createEffectSource } from "./EffectSource";

export type { CombatRole, ActiveStratagem, CombatContext } from "./CombatContext";
export { buildCombatContext } from "./CombatContext";

export type { AttackStepType, AttributedModifier, SpecialEffectType, SpecialEffect, DisplayModifier, StepModifiers, CombatResolution } from "./ModifierResult";
export { createEmptyStepModifiers } from "./ModifierResult";

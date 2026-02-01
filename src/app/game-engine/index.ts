/**
 * Game Engine - Public API
 */

// Types
export * from "./types";

// Engine
export { CombatEngine, resolveCombat } from "./CombatEngine";

// Weapon utilities
export { parseWeaponAttribute, extractWeaponMechanics, hasWeaponAttribute, getAttributeValue } from "./weaponAttributes";

// Hooks
export { useCombatResolution, type UseCombatResolutionParams } from "./hooks/useCombatResolution";

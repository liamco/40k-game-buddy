/**
 * Wargear Parser Module
 *
 * This module provides type definitions for wargear options and utilities
 * for working with parsed wargear data.
 *
 * Note: Parsing now happens at build time via:
 *   npm run parse-wargear-options
 *
 * The parsed data is stored in each datasheet JSON as `parsedWargearOptions`.
 */

// Types
export type { WargearOptionDef, RawWargearOption, TargetingType, TargetingDef, TargetingCondition, ActionType, ActionDef, WeaponRef, WeaponChoice, ConstraintsDef } from "./types";

// Model type utilities (used by evaluator at runtime)
export { normalizeModelType, modelTypesMatch } from "./extractors/extractModelType";

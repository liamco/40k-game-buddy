/**
 * Wargear Evaluator Module
 *
 * Evaluates wargear options to determine eligibility and constraints.
 */

// Main evaluation function
export { evaluateUnitOptions, getOptionsForModelType } from "./evaluateOptions";

// Types
export type { EvaluatedOption, ModelEvaluation, UnitEvaluation, EligibilityContext } from "./types";

// Eligibility checks (for testing/debugging)
export { checkTargetingEligibility } from "./eligibility/checkTargetingEligibility";
export { checkConstraintEligibility } from "./eligibility/checkConstraintEligibility";
export { countOptionUsage, countWeaponUsage, getCurrentSelection, calculateRatioSlots } from "./eligibility/countUsage";

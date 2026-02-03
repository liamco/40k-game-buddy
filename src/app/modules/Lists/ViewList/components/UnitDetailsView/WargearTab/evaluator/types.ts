/**
 * Evaluator Types
 *
 * Types for the wargear option evaluation system.
 */

import { WargearOptionDef } from "../parser/types";

/**
 * Evaluation result for a single option applied to a specific model.
 */
export interface EvaluatedOption {
    /** The parsed option definition */
    def: WargearOptionDef;

    /** Whether this model can use this option */
    isEligible: boolean;

    /** Human-readable reason for eligibility/ineligibility */
    eligibilityReason?: string;

    /** Whether the option is disabled (e.g., max usage reached) */
    isDisabled: boolean;

    /** Reason the option is disabled */
    disabledReason?: string;

    /** Currently selected weapon ID for this option (null if default) */
    currentSelection: string | null;

    /** How many times this option has been used across the unit */
    currentUsage: number;

    /** Maximum times this option can be used */
    maxUsage: number;

    /** Weapons that cannot be selected due to constraints */
    blockedWeapons: Set<string>;
}

/**
 * Evaluation result for a single model.
 */
export interface ModelEvaluation {
    /** The model instance ID */
    instanceId: string;

    /** Model type name */
    modelType: string;

    /** Evaluated options for this model */
    options: EvaluatedOption[];

    /** Current computed loadout */
    currentLoadout: string[];

    /** Whether loadout differs from default */
    isModified: boolean;
}

/**
 * Complete evaluation result for a unit.
 */
export interface UnitEvaluation {
    /** Per-model evaluations */
    modelEvaluations: ModelEvaluation[];

    /** Options that apply unit-wide (all-models, any-number, etc.) */
    unitWideOptions: WargearOptionDef[];

    /** Options that apply per-model (this-model, specific-model, ratio, etc.) */
    perModelOptions: WargearOptionDef[];

    /** Whether any options failed to parse */
    hasUnparsedOptions: boolean;

    /** Options that failed to parse (for UI warning) */
    unparsedOptions: WargearOptionDef[];
}

/**
 * Context passed to eligibility checks.
 */
export interface EligibilityContext {
    /** Total models in the unit */
    totalModels: number;

    /** Current model being evaluated */
    modelInstance: {
        instanceId: string;
        modelType: string;
        modelTypeLine: number;
        currentLoadout: string[];
    };

    /** All model instances in the unit */
    allModelInstances: Array<{
        instanceId: string;
        modelType: string;
        modelTypeLine: number;
        currentLoadout: string[];
        selections: Record<number, string>;
    }>;

    /** Unit-wide selections */
    unitWideSelections: Record<number, string>;

    /** Count of how many models have selected each option */
    optionUsageCounts: Record<number, number>;
}

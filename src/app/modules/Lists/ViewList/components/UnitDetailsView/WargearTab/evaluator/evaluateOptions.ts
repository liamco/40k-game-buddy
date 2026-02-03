/**
 * Main Option Evaluator
 *
 * Evaluates all wargear options for a unit, determining eligibility
 * and constraints for each model.
 */

import { ModelInstance } from "#types/Lists.tsx";
import { WargearOptionDef } from "../parser/types";
import { UnitEvaluation, ModelEvaluation, EvaluatedOption, EligibilityContext } from "./types";
import { checkTargetingEligibility } from "./eligibility/checkTargetingEligibility";
import { checkConstraintEligibility } from "./eligibility/checkConstraintEligibility";
import { countOptionUsage, getCurrentSelection } from "./eligibility/countUsage";
import { computeModelLoadout, isLoadoutModified } from "../state/computeLoadout";

/**
 * Evaluate all wargear options for a unit.
 *
 * @param parsedOptions - Parsed wargear options for the datasheet
 * @param modelInstances - Model instances in the unit
 * @param unitWideSelections - Unit-wide option selections
 * @returns Complete evaluation result
 */
export function evaluateUnitOptions(parsedOptions: WargearOptionDef[], modelInstances: ModelInstance[], unitWideSelections: Record<number, string> = {}): UnitEvaluation {
    // Separate parsed from unparsed options
    const parsed = parsedOptions.filter((o) => o.wargearParsed);
    const unparsed = parsedOptions.filter((o) => !o.wargearParsed);

    // Categorize options by scope
    const unitWideOptions = parsed.filter((o) => isUnitWideOption(o));
    const perModelOptions = parsed.filter((o) => !isUnitWideOption(o));

    // Count current option usage
    const optionUsageCounts = countOptionUsage(modelInstances, unitWideSelections);

    // Evaluate each model
    const modelEvaluations: ModelEvaluation[] = modelInstances.map((instance) => {
        const currentLoadout = computeModelLoadout(instance, parsedOptions, unitWideSelections);

        const context: EligibilityContext = {
            totalModels: modelInstances.length,
            modelInstance: {
                instanceId: instance.instanceId,
                modelType: instance.modelType,
                modelTypeLine: instance.modelTypeLine,
                currentLoadout,
            },
            allModelInstances: modelInstances.map((m) => ({
                instanceId: m.instanceId,
                modelType: m.modelType,
                modelTypeLine: m.modelTypeLine,
                currentLoadout: computeModelLoadout(m, parsedOptions, unitWideSelections),
                selections: m.optionSelections || {},
            })),
            unitWideSelections,
            optionUsageCounts,
        };

        const evaluatedOptions = parsed.map((option) => evaluateSingleOption(option, context));

        return {
            instanceId: instance.instanceId,
            modelType: instance.modelType,
            options: evaluatedOptions,
            currentLoadout,
            isModified: isLoadoutModified(instance),
        };
    });

    return {
        modelEvaluations,
        unitWideOptions,
        perModelOptions,
        hasUnparsedOptions: unparsed.length > 0,
        unparsedOptions: unparsed,
    };
}

/**
 * Evaluate a single option for a specific model.
 */
function evaluateSingleOption(option: WargearOptionDef, context: EligibilityContext): EvaluatedOption {
    // Check targeting eligibility
    const targetingResult = checkTargetingEligibility(option, context);

    // Check constraint eligibility
    const constraintResult = checkConstraintEligibility(option, context);

    // Get current selection
    const currentSelection = getCurrentSelection(
        option.line,
        {
            instanceId: context.modelInstance.instanceId,
            modelType: context.modelInstance.modelType,
            modelTypeLine: context.modelInstance.modelTypeLine,
            loadout: context.modelInstance.currentLoadout,
            defaultLoadout: [], // Not needed for getCurrentSelection
            optionSelections: context.allModelInstances.find((m) => m.instanceId === context.modelInstance.instanceId)?.selections,
        },
        context.unitWideSelections
    );

    return {
        def: option,
        isEligible: targetingResult.isEligible,
        eligibilityReason: targetingResult.reason,
        isDisabled: constraintResult.isDisabled || !targetingResult.isEligible,
        disabledReason: constraintResult.reason || targetingResult.reason,
        currentSelection,
        currentUsage: context.optionUsageCounts[option.line] || 0,
        maxUsage: targetingResult.maxUsage,
        blockedWeapons: constraintResult.blockedWeapons,
    };
}

/**
 * Check if an option applies unit-wide vs per-model.
 */
function isUnitWideOption(option: WargearOptionDef): boolean {
    const { targeting } = option;
    return targeting.type === "all-models" || targeting.type === "this-unit" || targeting.type === "any-number";
}

/**
 * Get options that are available for a specific model type.
 */
export function getOptionsForModelType(parsedOptions: WargearOptionDef[], modelType: string): WargearOptionDef[] {
    return parsedOptions.filter((option) => {
        const { targeting } = option;

        // These always apply
        if (targeting.type === "this-model" || targeting.type === "all-models" || targeting.type === "any-number" || targeting.type === "this-unit") {
            return true;
        }

        // Check model type match
        if (targeting.modelType) {
            const normalizedTarget = targeting.modelType.toLowerCase();
            const normalizedModel = modelType.toLowerCase();
            return normalizedModel.includes(normalizedTarget) || normalizedTarget.includes(normalizedModel);
        }

        // Ratio and up-to-n options can apply to any model
        if (targeting.type === "ratio" || targeting.type === "ratio-capped" || targeting.type === "up-to-n") {
            return true;
        }

        return false;
    });
}

/**
 * useEvaluatedOptions Hook
 *
 * Evaluates wargear options for a unit, computing eligibility per model.
 */

import { useMemo } from "react";
import { ArmyListItem } from "#types/Lists.tsx";
import { WargearOptionDef } from "../parser";
import { evaluateUnitOptions, UnitEvaluation } from "../evaluator";

/**
 * Hook to evaluate wargear options for a unit.
 *
 * @param parsedOptions - Parsed wargear options
 * @param unit - The army list item (unit)
 * @returns Evaluation result with per-model eligibility
 */
export function useEvaluatedOptions(
    parsedOptions: WargearOptionDef[],
    unit: ArmyListItem
): UnitEvaluation {
    return useMemo(() => {
        const modelInstances = unit.modelInstances || [];
        const unitWideSelections = unit.unitWideSelections || {};

        return evaluateUnitOptions(
            parsedOptions,
            modelInstances,
            unitWideSelections
        );
    }, [parsedOptions, unit.modelInstances, unit.unitWideSelections]);
}

/**
 * Get evaluation for a specific model instance.
 */
export function useModelEvaluation(
    evaluation: UnitEvaluation,
    instanceId: string
) {
    return useMemo(() => {
        return evaluation.modelEvaluations.find(
            (m) => m.instanceId === instanceId
        );
    }, [evaluation.modelEvaluations, instanceId]);
}

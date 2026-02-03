/**
 * Targeting Eligibility Checks
 *
 * Determines if a model is eligible for an option based on targeting rules.
 */

import { WargearOptionDef, TargetingDef } from "../../parser/types";
import { EligibilityContext } from "../types";
import { normalizeModelType, modelTypesMatch } from "../../parser/extractors/extractModelType";

interface TargetingResult {
    isEligible: boolean;
    reason?: string;
    maxUsage: number;
}

/**
 * Check if a model is eligible for an option based on its targeting rules.
 */
export function checkTargetingEligibility(
    option: WargearOptionDef,
    context: EligibilityContext
): TargetingResult {
    const { targeting } = option;
    const { modelInstance, totalModels, optionUsageCounts } = context;

    switch (targeting.type) {
        case "this-model":
            // Single model unit or self-reference - always eligible
            return { isEligible: true, maxUsage: totalModels };

        case "specific-model":
            // Only the named model type is eligible
            return checkSpecificModel(targeting, modelInstance.modelType);

        case "n-model-specific":
            // N models of a specific type can take this
            return checkNModelSpecific(
                targeting,
                modelInstance.modelType,
                optionUsageCounts[option.line] || 0
            );

        case "all-models":
            // All models are eligible
            return { isEligible: true, maxUsage: totalModels };

        case "any-number":
            // Any number of models can take this
            return { isEligible: true, maxUsage: totalModels };

        case "ratio":
            // For every N models, 1 can take this
            return checkRatio(targeting, totalModels, optionUsageCounts[option.line] || 0);

        case "ratio-capped":
            // For every N models, up to M can take this
            return checkRatioCapped(
                targeting,
                totalModels,
                optionUsageCounts[option.line] || 0
            );

        case "up-to-n":
            // Up to N models total can take this
            return checkUpToN(targeting, optionUsageCounts[option.line] || 0);

        case "each-model-type":
            // Each model of a specific type
            return checkEachModelType(targeting, modelInstance.modelType);

        case "conditional":
            // Conditional on equipment
            return checkConditional(targeting, modelInstance.currentLoadout);

        case "this-unit":
            // Unit-level option - treated as eligible for display purposes
            return { isEligible: true, maxUsage: 1 };

        case "if-unit-size":
            // Conditional on unit size
            return checkUnitSize(targeting, totalModels);

        case "unknown":
        default:
            // Unknown targeting - not eligible
            return {
                isEligible: false,
                reason: "Option format not recognized",
                maxUsage: 0,
            };
    }
}

function checkSpecificModel(
    targeting: TargetingDef,
    modelType: string
): TargetingResult {
    if (!targeting.modelType) {
        return { isEligible: false, reason: "No model type specified", maxUsage: 0 };
    }

    const isMatch = modelTypesMatch(targeting.modelType, modelType);
    return {
        isEligible: isMatch,
        reason: isMatch ? undefined : `Only for ${targeting.modelType}`,
        maxUsage: 1,
    };
}

function checkNModelSpecific(
    targeting: TargetingDef,
    modelType: string,
    currentUsage: number
): TargetingResult {
    const count = targeting.count || 1;
    const maxUsage = count;

    // Check if model type matches (if specified)
    if (targeting.modelType) {
        const isMatch = modelTypesMatch(targeting.modelType, modelType);
        if (!isMatch) {
            return {
                isEligible: false,
                reason: `Only for ${targeting.modelType}`,
                maxUsage,
            };
        }
    }

    // Check if max usage reached
    if (currentUsage >= maxUsage) {
        return {
            isEligible: false,
            reason: `Maximum ${count} model(s) can take this option`,
            maxUsage,
        };
    }

    return { isEligible: true, maxUsage };
}

function checkRatio(
    targeting: TargetingDef,
    totalModels: number,
    currentUsage: number
): TargetingResult {
    const ratio = targeting.ratio || 1;
    const maxUsage = Math.floor(totalModels / ratio);

    if (currentUsage >= maxUsage) {
        return {
            isEligible: false,
            reason: `For every ${ratio} models, 1 can take this (${currentUsage}/${maxUsage} used)`,
            maxUsage,
        };
    }

    return { isEligible: true, maxUsage };
}

function checkRatioCapped(
    targeting: TargetingDef,
    totalModels: number,
    currentUsage: number
): TargetingResult {
    const ratio = targeting.ratio || 1;
    const cap = targeting.maxPerRatio || 1;
    const slotsFromRatio = Math.floor(totalModels / ratio);
    const maxUsage = slotsFromRatio * cap;

    if (currentUsage >= maxUsage) {
        return {
            isEligible: false,
            reason: `For every ${ratio} models, up to ${cap} can take this (${currentUsage}/${maxUsage} used)`,
            maxUsage,
        };
    }

    return { isEligible: true, maxUsage };
}

function checkUpToN(
    targeting: TargetingDef,
    currentUsage: number
): TargetingResult {
    const maxUsage = targeting.maxTotal || 1;

    if (currentUsage >= maxUsage) {
        return {
            isEligible: false,
            reason: `Up to ${maxUsage} model(s) can take this option`,
            maxUsage,
        };
    }

    return { isEligible: true, maxUsage };
}

function checkEachModelType(
    targeting: TargetingDef,
    modelType: string
): TargetingResult {
    if (!targeting.modelType) {
        return { isEligible: true, maxUsage: Infinity };
    }

    const isMatch = modelTypesMatch(targeting.modelType, modelType);
    return {
        isEligible: isMatch,
        reason: isMatch ? undefined : `Only for ${targeting.modelType}`,
        maxUsage: Infinity, // Each matching model can take it
    };
}

function checkConditional(
    targeting: TargetingDef,
    currentLoadout: string[]
): TargetingResult {
    const condition = targeting.condition;
    if (!condition) {
        return { isEligible: true, maxUsage: 1 };
    }

    const normalizedLoadout = currentLoadout.map((w) => w.toLowerCase());

    if (condition.type === "equipped-with") {
        // Must have the required weapon(s)
        if (condition.weaponNames) {
            // Must have all weapons
            const hasAll = condition.weaponNames.every((req) =>
                normalizedLoadout.some((w) => w.includes(req.toLowerCase()))
            );
            return {
                isEligible: hasAll,
                reason: hasAll
                    ? undefined
                    : `Requires ${condition.weaponNames.join(" and ")}`,
                maxUsage: 1,
            };
        }

        if (condition.weaponName) {
            const hasWeapon = normalizedLoadout.some((w) =>
                w.includes(condition.weaponName!.toLowerCase())
            );
            return {
                isEligible: hasWeapon,
                reason: hasWeapon ? undefined : `Requires ${condition.weaponName}`,
                maxUsage: 1,
            };
        }
    }

    return { isEligible: true, maxUsage: 1 };
}

function checkUnitSize(
    targeting: TargetingDef,
    totalModels: number
): TargetingResult {
    const threshold = targeting.unitSizeThreshold || 0;
    const meetsThreshold = totalModels >= threshold;

    return {
        isEligible: meetsThreshold,
        reason: meetsThreshold
            ? undefined
            : `Requires unit of ${threshold}+ models`,
        maxUsage: meetsThreshold ? Infinity : 0,
    };
}

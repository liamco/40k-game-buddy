import type { Condition, Mechanic, GameContext, Operator } from "../types";
import {
    getEntityAttributeValue,
    checkEntityState,
    entityHasKeyword,
    entityHasAnyKeyword,
    entityHasAbility,
    entityHasAnyAbility,
} from "./stateResolver";

/**
 * Compares two values using the specified operator.
 */
function compareValues(
    actual: number | string | boolean | null,
    operator: Operator,
    expected: number | string | boolean | null
): boolean {
    // Handle null comparisons
    if (actual === null || actual === undefined) {
        if (operator === "equals") return expected === null;
        if (operator === "notEquals") return expected !== null;
        return false;
    }

    switch (operator) {
        case "equals":
            return actual === expected;

        case "notEquals":
            return actual !== expected;

        case "greaterThan":
            if (typeof actual === "number" && typeof expected === "number") {
                return actual > expected;
            }
            return false;

        case "greaterThanOrEqualTo":
            if (typeof actual === "number" && typeof expected === "number") {
                return actual >= expected;
            }
            return false;

        case "lessThan":
            if (typeof actual === "number" && typeof expected === "number") {
                return actual < expected;
            }
            return false;

        case "lessThanOrEqualTo":
            if (typeof actual === "number" && typeof expected === "number") {
                return actual <= expected;
            }
            return false;

        case "includes":
            // For array membership checks
            if (Array.isArray(actual)) {
                return actual.includes(expected);
            }
            if (typeof actual === "string" && typeof expected === "string") {
                return actual.includes(expected);
            }
            return actual === expected;

        case "notIncludes":
            if (Array.isArray(actual)) {
                return !actual.includes(expected);
            }
            if (typeof actual === "string" && typeof expected === "string") {
                return !actual.includes(expected);
            }
            return actual !== expected;

        default:
            return false;
    }
}

/**
 * Evaluates a single condition.
 *
 * @param condition - The condition to evaluate
 * @param context - The game context
 * @param perspective - Whether we're evaluating from attacker or defender perspective
 * @returns Whether the condition is met
 */
export function evaluateCondition(
    condition: Condition,
    context: GameContext,
    perspective: "attacker" | "defender"
): boolean {
    const { entity, value } = condition;
    // Default to "equals" if operator is not specified
    const operator = condition.operator || "equals";

    // Check state condition
    if (condition.state) {
        const hasState = checkEntityState(entity, condition.state, context, perspective);
        return compareValues(hasState, operator, value as boolean);
    }

    // Check keyword condition
    if (condition.keywords && condition.keywords.length > 0) {
        const hasKeywords = entityHasAnyKeyword(entity, condition.keywords, context, perspective);

        // For keyword checks, we're checking presence
        if (operator === "equals" || operator === "includes") {
            return hasKeywords;
        }
        if (operator === "notEquals" || operator === "notIncludes") {
            return !hasKeywords;
        }
        return hasKeywords;
    }

    // Check ability condition
    if (condition.abilities && condition.abilities.length > 0) {
        const hasAbilities = entityHasAnyAbility(entity, condition.abilities, context, perspective);

        if (operator === "equals" || operator === "includes") {
            return hasAbilities;
        }
        if (operator === "notEquals" || operator === "notIncludes") {
            return !hasAbilities;
        }
        return hasAbilities;
    }

    // Check attribute condition
    if (condition.attribute) {
        const attributeValue = getEntityAttributeValue(
            entity,
            condition.attribute,
            context,
            perspective
        );
        return compareValues(attributeValue, operator, value);
    }

    // Default: condition passes if no specific check is defined
    return true;
}

/**
 * Evaluates all conditions for a mechanic.
 * All conditions must pass (AND logic).
 *
 * @param mechanic - The mechanic whose conditions to evaluate
 * @param context - The game context
 * @param perspective - Whether we're evaluating from attacker or defender perspective
 * @returns Whether all conditions are met
 */
export function evaluateMechanic(
    mechanic: Mechanic,
    context: GameContext,
    perspective: "attacker" | "defender"
): boolean {
    // No conditions = always applies
    if (!mechanic.conditions || mechanic.conditions.length === 0) {
        return true;
    }

    // All conditions must pass
    return mechanic.conditions.every((condition) =>
        evaluateCondition(condition, context, perspective)
    );
}

/**
 * Evaluates a mechanic and returns detailed information about why it did/didn't apply.
 */
export function evaluateMechanicWithReason(
    mechanic: Mechanic,
    context: GameContext,
    perspective: "attacker" | "defender"
): { applied: boolean; reason?: string } {
    if (!mechanic.conditions || mechanic.conditions.length === 0) {
        return { applied: true, reason: "No conditions" };
    }

    for (let i = 0; i < mechanic.conditions.length; i++) {
        const condition = mechanic.conditions[i];
        const passed = evaluateCondition(condition, context, perspective);

        if (!passed) {
            return {
                applied: false,
                reason: `Condition ${i + 1} failed: ${describeCondition(condition)}`,
            };
        }
    }

    return { applied: true, reason: "All conditions met" };
}

/**
 * Creates a human-readable description of a condition.
 */
function describeCondition(condition: Condition): string {
    const parts: string[] = [];

    parts.push(`${condition.entity}`);

    if (condition.state) {
        parts.push(`state=${condition.state}`);
    }
    if (condition.attribute) {
        parts.push(`attr=${condition.attribute}`);
    }
    if (condition.keywords?.length) {
        parts.push(`keywords=[${condition.keywords.join(",")}]`);
    }
    if (condition.abilities?.length) {
        parts.push(`abilities=[${condition.abilities.join(",")}]`);
    }

    parts.push(`${condition.operator}`);
    parts.push(`${condition.value}`);

    return parts.join(" ");
}

/**
 * Filters mechanics to only those that apply given the current context.
 *
 * @param mechanics - Array of mechanics to filter
 * @param context - The game context
 * @param perspective - Whether we're evaluating from attacker or defender perspective
 * @returns Array of mechanics that apply
 */
export function filterApplicableMechanics(
    mechanics: Mechanic[],
    context: GameContext,
    perspective: "attacker" | "defender"
): Mechanic[] {
    return mechanics.filter((mechanic) => evaluateMechanic(mechanic, context, perspective));
}

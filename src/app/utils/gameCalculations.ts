import type { Weapon } from "../types";

/**
 * Calculates the to-wound roll needed based on strength vs toughness
 */
export function calculateToWound(strength: number, toughness: number): number {
    const strengthVsToughness = strength / toughness;

    if (strengthVsToughness >= 2) {
        return 2;
    } else if (strengthVsToughness > 1) {
        return 3;
    } else if (strengthVsToughness === 1) {
        return 4;
    } else if (strengthVsToughness >= 0.5) {
        return 5;
    } else {
        return 6;
    }
}

/**
 * Calculates hit probability percentage
 */
export function getHitProbability(toHit: number): number {
    return ((7 - toHit) / 6) * 100;
}

/**
 * Calculates wound probability percentage
 */
export function getWoundProbability(toWound: number): number {
    return ((7 - toWound) / 6) * 100;
}

/**
 * Calculates save probability percentage
 */
export function getSaveProbability(toSave: number): number {
    return ((7 - toSave) / 6) * 100;
}

/**
 * Calculates the average damage output
 */
export function calculateAverageDamage(
    attacks: number,
    toHit: number,
    toWound: number,
    toSave: number,
    damage: number,
    feelNoPain: number | null
): number {
    const hitProb = getHitProbability(toHit) / 100;
    const woundProb = getWoundProbability(toWound) / 100;
    const failedSaveProb = 1 - getSaveProbability(toSave) / 100;
    const fnpFailProb = feelNoPain ? 1 - getSaveProbability(feelNoPain) / 100 : 1;

    return attacks * hitProb * woundProb * failedSaveProb * fnpFailProb * damage;
}

/**
 * Clamps a dice roll value between 2+ and 6+
 */
export function clampDiceRoll(value: number): number {
    return Math.max(2, Math.min(6, value));
}

/**
 * Formats a modifier value for display
 */
export function formatModifier(value: number): string {
    if (value > 0) return `+${value}`;
    return `${value}`;
}

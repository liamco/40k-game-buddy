/**
 * Output types for combat resolution
 */

import type { EffectSource } from "./EffectSource";

/**
 * Attack resolution steps where modifiers apply
 */
export type AttackStepType = "attacks" | "hitRoll" | "woundRoll" | "saveRoll" | "damageRoll" | "feelNoPain";

/**
 * Individual modifier with source attribution
 */
export interface AttributedModifier {
    value: number;
    source: EffectSource;
    description?: string;
}

/**
 * Special effects that aren't simple numeric modifiers
 */
export type SpecialEffectType = "autoSuccess" | "reroll" | "lethalHits" | "sustainedHits" | "devastatingWounds" | "ignoresCover" | "precision" | "lance" | "assault" | "heavy" | "rapidFire" | "melta" | "hazardous" | "blast" | "indirect" | "antiKeyword";

export interface SpecialEffect {
    type: SpecialEffectType;
    value?: boolean | number | string;
    source: EffectSource;
}

/**
 * Critical effect to display on attack steps (LETHAL HITS, SUSTAINED HITS, DEVASTATING WOUNDS)
 */
export interface CriticalEffect {
    name: string; // Display name: "LETHAL HITS", "SUSTAINED HITS 2", etc.
    type: SpecialEffectType;
    value?: number; // For parameterized effects like SUSTAINED HITS 2
}

/**
 * Display-ready modifier format for AttackStep component
 */
export interface DisplayModifier {
    label: string;
    value: number;
}

/**
 * Aggregated modifiers for a single attack step
 */
export interface StepModifiers {
    step: AttackStepType;

    bonuses: AttributedModifier[];
    penalties: AttributedModifier[];

    rawTotal: number;
    cappedTotal: number;
    isCapped: boolean;

    specialEffects: SpecialEffect[];

    forDisplay: {
        bonuses: DisplayModifier[];
        penalties: DisplayModifier[];
    };
}

/**
 * Create an empty StepModifiers for a given step
 */
export function createEmptyStepModifiers(step: AttackStepType): StepModifiers {
    return {
        step,
        bonuses: [],
        penalties: [],
        rawTotal: 0,
        cappedTotal: 0,
        isCapped: false,
        specialEffects: [],
        forDisplay: {
            bonuses: [],
            penalties: [],
        },
    };
}

/**
 * Complete combat resolution output
 */
export interface CombatResolution {
    // Base values from weapon/model stats
    baseAttacks: number | string;
    baseToHit: number | string;
    baseToWound: number;
    baseSave: number;
    baseInvuln: number | null;
    baseFnp: number | null;
    baseDamage: number | string;

    // Weapon stats for display
    weaponStrength: number;
    weaponAp: number;
    targetToughness: number;

    // Modifiers for each step
    attacksModifiers: StepModifiers;
    hitModifiers: StepModifiers;
    woundModifiers: StepModifiers;
    saveModifiers: StepModifiers;
    fnpModifiers: StepModifiers;
    damageModifiers: StepModifiers;

    // Final computed values
    finalToHit: number | "auto";
    finalToWound: number;
    finalSave: number;
    useInvuln: boolean;
    finalFnp: number | null;

    // Critical thresholds (normally 6, can be modified by abilities)
    criticalHitThreshold: number;
    criticalWoundThreshold: number;
    criticalWoundSource?: string; // e.g., "ANTI-VEHICLE 4+"

    // BLAST bonus attacks (per model)
    blastBonusPerModel: number | null; // +X attacks from BLAST per model
    defenderModelCount: number; // Number of alive models in target unit

    // All weapon special effects (for display)
    weaponEffects: SpecialEffect[];
}

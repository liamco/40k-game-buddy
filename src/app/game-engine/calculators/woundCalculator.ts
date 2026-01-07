import type { RollModifier, ModifierBreakdown } from "../types";
import { capRollModifiers, createModifierBreakdown } from "../applicators";

/**
 * Result of wound calculation.
 */
export interface WoundCalculationResult {
  /** Target number to roll (2-6), or 0 if auto-wound */
  target: number;

  /** True if wounds are automatic (some special rules) */
  autoWound: boolean;

  /** Breakdown of modifiers for UI */
  breakdown: ModifierBreakdown;
}

/**
 * Clamps a dice roll target to valid range (2-6).
 */
function clampRollTarget(target: number): number {
  return Math.max(2, Math.min(6, target));
}

/**
 * Calculates the base wound roll target from Strength vs Toughness.
 *
 * 40k 10th Edition wound chart:
 * - S >= 2T → 2+
 * - S > T → 3+
 * - S = T → 4+
 * - S < T → 5+
 * - S <= T/2 → 6+
 */
export function calculateBaseWoundTarget(strength: number, toughness: number): number {
  if (strength >= toughness * 2) {
    return 2; // S >= 2T
  }
  if (strength > toughness) {
    return 3; // S > T
  }
  if (strength === toughness) {
    return 4; // S = T
  }
  if (strength * 2 <= toughness) {
    return 6; // S <= T/2
  }
  return 5; // S < T
}

/**
 * Calculates the wound roll target.
 *
 * @param strength - Weapon strength
 * @param toughness - Target toughness
 * @param modifiers - Wound roll modifiers
 * @param autoWound - Whether wounds are automatic
 * @returns Wound calculation result
 */
export function calculateWoundTarget(
  strength: number,
  toughness: number,
  modifiers: RollModifier[],
  autoWound: boolean
): WoundCalculationResult {
  // Auto-wound doesn't roll
  if (autoWound) {
    return {
      target: 0,
      autoWound: true,
      breakdown: {
        bonuses: [],
        penalties: [],
        netModifier: 0,
        cappedTo: null,
      },
    };
  }

  // Calculate base target from S vs T
  const baseTarget = calculateBaseWoundTarget(strength, toughness);

  // Cap modifiers (wound rolls are capped at +/-1)
  const { netValue } = capRollModifiers(modifiers, "w");
  const breakdown = createModifierBreakdown(modifiers, "w");

  // Apply modifier
  // Positive modifier = easier to wound = lower target
  // Negative modifier = harder to wound = higher target
  const modifiedTarget = baseTarget - netValue;

  // Clamp to valid range
  const clampedTarget = clampRollTarget(modifiedTarget);

  return {
    target: clampedTarget,
    autoWound: false,
    breakdown,
  };
}

/**
 * Calculates the probability of wounding.
 */
export function getWoundProbability(target: number, autoWound: boolean): number {
  if (autoWound) return 1;
  if (target <= 1) return 1;
  if (target >= 7) return 0;

  return (7 - target) / 6;
}

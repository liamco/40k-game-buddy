import type { RollModifier, ModifierBreakdown, RollAttribute } from "../types";
import { capRollModifiers, createModifierBreakdown } from "../applicators";

/**
 * Result of hit calculation.
 */
export interface HitCalculationResult {
  /** Target number to roll (2-6), or 0 if auto-hit */
  target: number;

  /** True if hits are automatic (TORRENT) */
  autoHit: boolean;

  /** Breakdown of modifiers for UI */
  breakdown: ModifierBreakdown;
}

/**
 * Clamps a dice roll target to valid range (2-6).
 * In 40k, you always fail on an unmodified 1 and succeed on an unmodified 6.
 */
function clampRollTarget(target: number): number {
  return Math.max(2, Math.min(6, target));
}

/**
 * Calculates the hit roll target.
 *
 * @param bsWs - Ballistic Skill or Weapon Skill
 * @param modifiers - Hit roll modifiers
 * @param autoHit - Whether hits are automatic (TORRENT)
 * @returns Hit calculation result
 */
export function calculateHitTarget(
  bsWs: number,
  modifiers: RollModifier[],
  autoHit: boolean
): HitCalculationResult {
  // Auto-hit weapons don't roll
  if (autoHit) {
    return {
      target: 0,
      autoHit: true,
      breakdown: {
        bonuses: [],
        penalties: [],
        netModifier: 0,
        cappedTo: null,
      },
    };
  }

  // Cap modifiers (hit rolls are capped at +/-1)
  const { netValue, wasCapped } = capRollModifiers(modifiers, "h");
  const breakdown = createModifierBreakdown(modifiers, "h");

  // Apply modifier to BS/WS
  // Positive modifier = easier to hit = lower target
  // Negative modifier = harder to hit = higher target
  const modifiedTarget = bsWs - netValue;

  // Clamp to valid range
  const clampedTarget = clampRollTarget(modifiedTarget);

  return {
    target: clampedTarget,
    autoHit: false,
    breakdown,
  };
}

/**
 * Calculates the probability of hitting.
 */
export function getHitProbability(target: number, autoHit: boolean): number {
  if (autoHit) return 1;
  if (target <= 1) return 1; // Always hit (but 1 always fails in practice)
  if (target >= 7) return 0; // Never hit

  // Probability of rolling target or higher on D6
  return (7 - target) / 6;
}

import type { RollModifier, ModifierBreakdown } from "../types";
import { createModifierBreakdown } from "../applicators";

/**
 * Result of save calculation.
 */
export interface SaveCalculationResult {
  /** Target number to roll (2-7), 7 means no save possible */
  target: number;

  /** True if invulnerable save was better */
  invulnUsed: boolean;

  /** True if cover was applied */
  coverApplied: boolean;

  /** Breakdown of modifiers for UI */
  breakdown: ModifierBreakdown;
}

/**
 * Clamps a save roll target to valid range (2-7).
 * 7 means no save is possible.
 */
function clampSaveTarget(target: number): number {
  return Math.max(2, Math.min(7, target));
}

/**
 * Calculates the save roll target.
 *
 * Important 40k rules:
 * - AP worsens armor saves (AP -2 makes a 3+ save into a 5+)
 * - Invulnerable saves are NOT affected by AP
 * - Cover gives +1 to save (only if save is 4+ or worse after AP)
 * - Cover doesn't apply if weapon has IGNORES COVER
 *
 * @param armorSave - Base armor save value
 * @param invulnSave - Invulnerable save value (null if none)
 * @param ap - Weapon AP value (typically negative or zero)
 * @param inCover - Whether defender has cover
 * @param ignoresCover - Whether weapon ignores cover
 * @param modifiers - Save roll modifiers
 * @returns Save calculation result
 */
export function calculateSaveTarget(
  armorSave: number,
  invulnSave: number | null,
  ap: number,
  inCover: boolean,
  ignoresCover: boolean,
  modifiers: RollModifier[]
): SaveCalculationResult {
  // Apply AP to armor save (AP is typically negative, so we add its absolute value)
  // AP -2 makes save worse by 2 (3+ becomes 5+)
  const armorWithAP = armorSave + Math.abs(ap);

  // Check if cover applies
  // Cover only helps if:
  // 1. Unit is in cover
  // 2. Weapon doesn't ignore cover
  // 3. Modified save would be 4+ or worse (rule says cover helps "Sv 4+" or worse)
  let coverApplied = false;
  let armorWithCover = armorWithAP;

  if (inCover && !ignoresCover && armorWithAP >= 4) {
    coverApplied = true;
    armorWithCover = armorWithAP - 1; // Cover improves save by 1
  }

  // Apply additional save modifiers (these are NOT capped)
  const breakdown = createModifierBreakdown(modifiers, "s");
  const armorFinal = armorWithCover - breakdown.netModifier;

  // Determine if invuln is better
  // Invuln is not affected by AP, cover, or modifiers
  let finalTarget: number;
  let invulnUsed = false;

  if (invulnSave !== null && invulnSave < armorFinal) {
    finalTarget = invulnSave;
    invulnUsed = true;
    coverApplied = false; // Cover doesn't apply when using invuln
  } else {
    finalTarget = armorFinal;
  }

  // Clamp to valid range
  const clampedTarget = clampSaveTarget(finalTarget);

  return {
    target: clampedTarget,
    invulnUsed,
    coverApplied,
    breakdown,
  };
}

/**
 * Calculates the probability of making a save.
 */
export function getSaveProbability(target: number): number {
  if (target <= 1) return 1; // Always saves
  if (target >= 7) return 0; // No save possible

  return (7 - target) / 6;
}

/**
 * Calculates the probability of failing a save (taking damage).
 */
export function getFailedSaveProbability(target: number): number {
  return 1 - getSaveProbability(target);
}

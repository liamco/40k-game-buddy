import type { RollModifier, CappedModifierResult, RollAttribute } from "../types";

/**
 * 40k 10th Edition modifier cap rules:
 * - Hit roll modifiers are capped at +1/-1 net
 * - Wound roll modifiers are capped at +1/-1 net
 * - Save roll modifiers are NOT capped
 */

/**
 * Caps roll modifiers according to 40k 10th edition rules.
 *
 * @param modifiers - Array of roll modifiers to cap
 * @param rollType - Type of roll (h=hit, w=wound, s=save)
 * @returns Capped result with modifiers and net value
 */
export function capRollModifiers(
  modifiers: RollModifier[],
  rollType: RollAttribute
): CappedModifierResult {
  // Calculate totals
  const totalBonus = modifiers
    .filter((m) => m.value > 0)
    .reduce((sum, m) => sum + m.value, 0);

  const totalPenalty = modifiers
    .filter((m) => m.value < 0)
    .reduce((sum, m) => sum + m.value, 0);

  const netModifier = totalBonus + totalPenalty;

  // Save rolls are not capped
  if (rollType === "s") {
    return {
      modifiers,
      netValue: netModifier,
      wasCapped: false,
    };
  }

  // Hit and wound rolls are capped at +/-1
  const cappedNet = Math.max(-1, Math.min(1, netModifier));
  const wasCapped = cappedNet !== netModifier;

  // Mark modifiers as capped if they contributed to exceeding the cap
  const cappedModifiers = modifiers.map((m) => ({
    ...m,
    isCapped: wasCapped,
  }));

  return {
    modifiers: cappedModifiers,
    netValue: cappedNet,
    wasCapped,
  };
}

/**
 * Calculates the net modifier value from an array of modifiers.
 * Does NOT apply caps - use capRollModifiers for capped values.
 */
export function calculateNetModifier(modifiers: RollModifier[]): number {
  return modifiers.reduce((sum, m) => sum + m.value, 0);
}

/**
 * Separates modifiers into bonuses and penalties.
 */
export function separateModifiers(modifiers: RollModifier[]): {
  bonuses: RollModifier[];
  penalties: RollModifier[];
} {
  return {
    bonuses: modifiers.filter((m) => m.value > 0),
    penalties: modifiers.filter((m) => m.value < 0),
  };
}

/**
 * Creates a modifier breakdown for UI display.
 */
export function createModifierBreakdown(
  modifiers: RollModifier[],
  rollType: RollAttribute
): {
  bonuses: { source: string; value: number }[];
  penalties: { source: string; value: number }[];
  netModifier: number;
  cappedTo: number | null;
} {
  const { bonuses, penalties } = separateModifiers(modifiers);
  const { netValue, wasCapped } = capRollModifiers(modifiers, rollType);

  return {
    bonuses: bonuses.map((m) => ({
      source: m.source.name,
      value: m.value,
    })),
    penalties: penalties.map((m) => ({
      source: m.source.name,
      value: m.value,
    })),
    netModifier: netValue,
    cappedTo: wasCapped ? netValue : null,
  };
}

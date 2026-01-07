import type {
  GameContext,
  CombatResult,
  AppliedMechanic,
  ModifiedStats,
} from "../types";
import { collectAllMechanics } from "../collectors";
import { applyEffectsWithDetails } from "../applicators";
import { evaluateMechanicWithReason } from "../evaluators";
import { calculateHitTarget, getHitProbability } from "./hitCalculator";
import { calculateWoundTarget, getWoundProbability } from "./woundCalculator";
import {
  calculateSaveTarget,
  getFailedSaveProbability,
} from "./saveCalculator";
import { calculateExpectedDamage } from "./damageCalculator";

/**
 * Main combat resolution function.
 *
 * This orchestrates the full combat calculation:
 * 1. Collects all mechanics from both attacker and defender
 * 2. Evaluates conditions to filter applicable mechanics
 * 3. Applies effects to modify stats
 * 4. Calculates hit, wound, and save rolls
 * 5. Returns full combat result with breakdowns
 *
 * @param context - The full game context
 * @returns Complete combat calculation result
 */
export function calculateCombat(context: GameContext): CombatResult {
  // Collect all mechanics
  const { attackerMechanics, defenderMechanics } = collectAllMechanics(context);

  // Apply attacker mechanics
  const {
    stats: attackerStats,
    applied: attackerApplied,
    notApplied: attackerNotApplied,
  } = applyEffectsWithDetails(attackerMechanics, context, "attacker");

  // Apply defender mechanics
  const {
    stats: defenderStats,
    applied: defenderApplied,
    notApplied: defenderNotApplied,
  } = applyEffectsWithDetails(defenderMechanics, context, "defender");

  // Build applied mechanics list for debugging
  const appliedMechanics: AppliedMechanic[] = [
    ...attackerApplied.map((m) => ({ mechanic: m, applied: true })),
    ...defenderApplied.map((m) => ({ mechanic: m, applied: true })),
    ...attackerNotApplied.map((m) => {
      const { reason } = evaluateMechanicWithReason(m, context, "attacker");
      return { mechanic: m, applied: false, reason };
    }),
    ...defenderNotApplied.map((m) => {
      const { reason } = evaluateMechanicWithReason(m, context, "defender");
      return { mechanic: m, applied: false, reason };
    }),
  ];

  // Calculate hit roll
  const bsWs = attackerStats.weapon?.bsWs ?? 4;
  const hitResult = calculateHitTarget(
    bsWs,
    attackerStats.rollModifiers.hit,
    attackerStats.autoHit
  );

  // Get weapon strength and defender toughness
  const strength = attackerStats.weapon?.s ?? 4;
  const toughness = defenderStats.model.t;

  // Calculate wound roll
  const woundResult = calculateWoundTarget(
    strength,
    toughness,
    attackerStats.rollModifiers.wound,
    attackerStats.autoWound
  );

  // Check for IGNORES COVER
  const ignoresCover =
    attackerStats.addedKeywords.includes("IGNORES COVER") ||
    attackerStats.weapon?.attributes?.includes("IGNORES COVER");

  // Calculate save roll
  const saveResult = calculateSaveTarget(
    defenderStats.model.sv,
    defenderStats.model.invSv,
    attackerStats.weapon?.ap ?? 0,
    context.defender.state.inCover,
    ignoresCover ?? false,
    defenderStats.rollModifiers.save
  );

  // Calculate expected damage (optional statistical output)
  const attacks = attackerStats.weapon?.a ?? 1;
  const damage = attackerStats.weapon?.d ?? 1;
  const fnp = defenderStats.feelNoPain;

  const damageResult = calculateExpectedDamage(
    attacks,
    getHitProbability(hitResult.target, hitResult.autoHit),
    getWoundProbability(woundResult.target, woundResult.autoWound),
    getFailedSaveProbability(saveResult.target),
    damage,
    fnp
  );

  return {
    toHit: hitResult.target,
    toWound: woundResult.target,
    toSave: saveResult.target,
    autoHit: hitResult.autoHit,
    invulnSaveUsed: saveResult.invulnUsed,
    feelNoPain: fnp,
    hitModifiers: hitResult.breakdown,
    woundModifiers: woundResult.breakdown,
    saveModifiers: saveResult.breakdown,
    expectedDamage: damageResult.expectedDamage,
    appliedMechanics,
  };
}

/**
 * Gets modified stats for a unit without calculating combat.
 * Useful for displaying effective stat profiles in the UI.
 */
export function getModifiedStats(
  context: GameContext,
  perspective: "attacker" | "defender"
): ModifiedStats {
  const { attackerMechanics, defenderMechanics } = collectAllMechanics(context);
  const mechanics =
    perspective === "attacker" ? attackerMechanics : defenderMechanics;

  const { stats } = applyEffectsWithDetails(mechanics, context, perspective);
  return stats;
}

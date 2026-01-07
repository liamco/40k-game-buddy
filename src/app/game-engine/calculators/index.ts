// Calculators - perform combat math

export { calculateCombat, getModifiedStats } from "./combatCalculator";

export {
  calculateHitTarget,
  getHitProbability,
  type HitCalculationResult,
} from "./hitCalculator";

export {
  calculateWoundTarget,
  calculateBaseWoundTarget,
  getWoundProbability,
  type WoundCalculationResult,
} from "./woundCalculator";

export {
  calculateSaveTarget,
  getSaveProbability,
  getFailedSaveProbability,
  type SaveCalculationResult,
} from "./saveCalculator";

export {
  calculateExpectedDamage,
  parseDamageValue,
  parseAttackValue,
  applyFeelNoPain,
  type DamageCalculationResult,
} from "./damageCalculator";

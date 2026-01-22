/**
 * Damage calculation utilities.
 */

/**
 * Result of damage calculation.
 */
export interface DamageCalculationResult {
  /** Expected damage per successful attack */
  damagePerHit: number;

  /** Expected damage after FNP */
  damageAfterFNP: number;

  /** Full expected damage calculation */
  expectedDamage: number;
}

/**
 * Parses a damage value which can be a number or dice notation.
 *
 * @param damage - Damage value (number, "D6", "D3", "2D6", etc.)
 * @returns Expected (average) damage value
 */
export function parseDamageValue(damage: number | string): number {
  if (typeof damage === "number") {
    return damage;
  }

  const damageStr = damage.toUpperCase().trim();

  // Handle dice notation
  // D6 = 3.5 average
  // D3 = 2 average
  // 2D6 = 7 average
  // D6+1 = 4.5 average
  // etc.

  // Match patterns like "2D6+3" or "D3" or "D6"
  const diceMatch = damageStr.match(/^(\d*)D(\d+)([+-]\d+)?$/);

  if (diceMatch) {
    const numDice = diceMatch[1] ? parseInt(diceMatch[1]) : 1;
    const dieSize = parseInt(diceMatch[2]);
    const modifier = diceMatch[3] ? parseInt(diceMatch[3]) : 0;

    // Average of a die is (1 + max) / 2
    const avgPerDie = (1 + dieSize) / 2;
    return numDice * avgPerDie + modifier;
  }

  // Try parsing as plain number
  const parsed = parseFloat(damageStr);
  return isNaN(parsed) ? 1 : parsed;
}

/**
 * Calculates expected damage after Feel No Pain.
 *
 * @param damage - Damage dealt
 * @param fnp - Feel No Pain value (e.g., 5 for 5+, 6 for 6+)
 * @returns Expected damage after FNP
 */
export function applyFeelNoPain(damage: number, fnp: number | null): number {
  if (fnp === null || fnp > 6) {
    return damage; // No FNP or invalid FNP
  }

  // FNP success probability
  // FNP 5+ = 2/6 = 33.3% chance to ignore
  // FNP 6+ = 1/6 = 16.7% chance to ignore
  const fnpSuccessRate = (7 - fnp) / 6;
  const damageMultiplier = 1 - fnpSuccessRate;

  return damage * damageMultiplier;
}

/**
 * Calculates expected damage from a full attack sequence.
 *
 * @param attacks - Number of attacks
 * @param hitProb - Probability of hitting
 * @param woundProb - Probability of wounding
 * @param failedSaveProb - Probability of failed save
 * @param damage - Damage per failed save
 * @param fnp - Feel No Pain value (if any)
 * @returns Expected damage calculation result
 */
export function calculateExpectedDamage(
  attacks: number | string,
  hitProb: number,
  woundProb: number,
  failedSaveProb: number,
  damage: number | string,
  fnp: number | null
): DamageCalculationResult {
  // Parse attacks
  const attackCount =
    typeof attacks === "number" ? attacks : parseDamageValue(attacks);

  // Parse damage
  const damagePerHit = parseDamageValue(damage);

  // Calculate expected damage after FNP
  const damageAfterFNP = applyFeelNoPain(damagePerHit, fnp);

  // Calculate full expected damage
  // Attacks × P(hit) × P(wound) × P(fail save) × damage after FNP
  const expectedDamage =
    attackCount * hitProb * woundProb * failedSaveProb * damageAfterFNP;

  return {
    damagePerHit,
    damageAfterFNP,
    expectedDamage,
  };
}

/**
 * Parses an attack value which can be a number or dice notation.
 */
export function parseAttackValue(attacks: number | string): number {
  return parseDamageValue(attacks); // Same logic as damage
}

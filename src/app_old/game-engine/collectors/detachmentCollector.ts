import type {
  Mechanic,
  MechanicSource,
  ArmyContext,
  DetachmentAbility,
} from "../types";

/**
 * Creates a MechanicSource for a detachment ability.
 */
function createDetachmentSource(name: string): MechanicSource {
  return {
    type: "detachment",
    name,
  };
}

/**
 * Extracts mechanics from a detachment ability.
 */
function extractMechanicsFromAbility(ability: DetachmentAbility): Mechanic[] {
  if (!ability.mechanics || ability.mechanics.length === 0) {
    return [];
  }

  return ability.mechanics.map((mechanic) => ({
    ...mechanic,
    source: createDetachmentSource(ability.name),
  }));
}

/**
 * Collects mechanics from detachment abilities.
 *
 * @param army - Army context containing detachment information
 * @param role - Whether this is for "attacker" or "defender"
 * @returns Array of mechanics from detachment abilities
 */
export function collectDetachmentAbilities(
  army: ArmyContext,
  role: "attacker" | "defender"
): Mechanic[] {
  const mechanics: Mechanic[] = [];

  if (!army.detachmentAbilities) {
    return mechanics;
  }

  for (const ability of army.detachmentAbilities) {
    const abilityMechanics = extractMechanicsFromAbility(ability);
    mechanics.push(...abilityMechanics);
  }

  return mechanics;
}

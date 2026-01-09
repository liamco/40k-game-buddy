import type {
  Mechanic,
  MechanicSource,
  ArmyContext,
  FactionAbility,
} from "../types";

/**
 * Creates a MechanicSource for a faction ability.
 */
function createFactionSource(name: string): MechanicSource {
  return {
    type: "faction",
    name,
  };
}

/**
 * Extracts mechanics from a faction ability.
 */
function extractMechanicsFromAbility(ability: FactionAbility): Mechanic[] {
  if (!ability.mechanics || ability.mechanics.length === 0) {
    return [];
  }

  return ability.mechanics.map((mechanic) => ({
    ...mechanic,
    source: createFactionSource(ability.name),
  }));
}

/**
 * Collects mechanics from faction abilities.
 *
 * Faction abilities (like Oath of Moment for Space Marines) are stored
 * centrally in faction.json and referenced by ID in datasheets.
 * The ArmyContext should have these abilities resolved and passed in.
 *
 * @param army - Army context containing faction ability information
 * @param role - Whether this is for "attacker" or "defender"
 * @returns Array of mechanics from faction abilities
 */
export function collectFactionAbilities(
  army: ArmyContext,
  role: "attacker" | "defender"
): Mechanic[] {
  const mechanics: Mechanic[] = [];

  if (!army.factionAbilities) {
    return mechanics;
  }

  for (const ability of army.factionAbilities) {
    const abilityMechanics = extractMechanicsFromAbility(ability);
    mechanics.push(...abilityMechanics);
  }

  return mechanics;
}

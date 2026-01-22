import type { Mechanic, MechanicSource, Enhancement } from "../types";

/**
 * Creates a MechanicSource for an enhancement.
 */
function createEnhancementSource(name: string): MechanicSource {
  return {
    type: "enhancement",
    name,
  };
}

/**
 * Collects mechanics from an enhancement.
 * Attaches source information to each mechanic.
 */
export function collectEnhancement(
  enhancement: Enhancement | undefined
): Mechanic[] {
  if (!enhancement?.mechanics) {
    return [];
  }

  return enhancement.mechanics.map((mechanic) => ({
    ...mechanic,
    source: createEnhancementSource(enhancement.name),
  }));
}

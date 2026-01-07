import type {
  Mechanic,
  MechanicSource,
  ActiveStratagem,
  GameContext,
} from "../types";
import type { Stratagem } from "../../types";

/**
 * Stratagem with mechanics (extending the base Stratagem type).
 */
interface StratagemWithMechanics extends Stratagem {
  mechanics?: Mechanic[];
}

/**
 * Creates a MechanicSource for a stratagem.
 */
function createStratagemSource(name: string): MechanicSource {
  return {
    type: "stratagem",
    name,
  };
}

/**
 * Checks if a stratagem is valid for the current game phase.
 */
function isValidForPhase(
  stratagem: Stratagem,
  currentPhase: string
): boolean {
  if (!stratagem.phase) {
    return true; // No phase restriction
  }

  // Handle "ANY" phase
  if (stratagem.phase === "ANY" || stratagem.phase.includes("ANY" as any)) {
    return true;
  }

  // Check if current phase is in the stratagem's valid phases
  return (stratagem.phase as string[]).includes(currentPhase);
}

/**
 * Checks if a stratagem is valid for the current turn.
 */
function isValidForTurn(stratagem: Stratagem, currentTurn: string): boolean {
  if (!stratagem.turn) {
    return true; // No turn restriction
  }

  if (stratagem.turn === "EITHER") {
    return true;
  }

  return stratagem.turn === currentTurn;
}

/**
 * Extracts mechanics from a single stratagem.
 */
function extractMechanicsFromStratagem(
  stratagem: StratagemWithMechanics
): Mechanic[] {
  if (!stratagem.mechanics || stratagem.mechanics.length === 0) {
    return [];
  }

  return stratagem.mechanics.map((mechanic) => ({
    ...mechanic,
    source: createStratagemSource(stratagem.name),
  }));
}

/**
 * Collects mechanics from active stratagems.
 *
 * @param activeStratagems - Array of active stratagems with optional targets
 * @param context - Game context for phase/turn validation
 * @returns Array of mechanics from valid stratagems
 */
export function collectStratagems(
  activeStratagems: ActiveStratagem[],
  context: GameContext
): Mechanic[] {
  const mechanics: Mechanic[] = [];

  for (const active of activeStratagems) {
    const stratagem = active.stratagem as StratagemWithMechanics;

    // Validate phase
    if (!isValidForPhase(stratagem, context.phase)) {
      continue;
    }

    // Validate turn
    if (!isValidForTurn(stratagem, context.turn)) {
      continue;
    }

    // Extract mechanics
    const stratagemMechanics = extractMechanicsFromStratagem(stratagem);

    // Add target information to mechanics if applicable
    if (active.targetUnitId) {
      for (const mechanic of stratagemMechanics) {
        // Store the target unit ID for condition evaluation
        (mechanic as any).targetUnitId = active.targetUnitId;
      }
    }

    mechanics.push(...stratagemMechanics);
  }

  return mechanics;
}

/**
 * Filters stratagems to only those applicable in the current phase/turn.
 * Useful for displaying available stratagems in the UI.
 */
export function filterApplicableStratagems(
  stratagems: Stratagem[],
  phase: string,
  turn: string
): Stratagem[] {
  return stratagems.filter(
    (stratagem) =>
      isValidForPhase(stratagem, phase) && isValidForTurn(stratagem, turn)
  );
}

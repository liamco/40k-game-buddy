import type {
  Mechanic,
  GameContext,
  ModifiedStats,
  ModifiedModelStats,
  ModifiedWeaponStats,
  RollModifier,
  RerollType,
  MechanicSource,
} from "../types";
import { filterApplicableMechanics } from "../evaluators";

/**
 * Default mechanic source for unknown sources.
 */
const DEFAULT_SOURCE: MechanicSource = {
  type: "ability",
  name: "Unknown",
};

/**
 * Creates initial modified stats from a game context.
 */
function createInitialStats(
  context: GameContext,
  perspective: "attacker" | "defender"
): ModifiedStats {
  const unit = perspective === "attacker" ? context.attacker : context.defender;
  const model = unit.selectedModel;
  const weapon = unit.selectedWeapon;

  return {
    model: {
      m: model?.m ?? 0,
      t: model?.t ?? 0,
      sv: model?.sv ?? 7,
      invSv: model?.invSv ?? null,
      w: model?.w ?? 0,
      ld: model?.ld ?? 0,
      oc: model?.oc ?? 0,
    },
    weapon: weapon
      ? {
          range: weapon.range,
          a: weapon.a,
          bsWs: typeof weapon.bsWs === "number" ? weapon.bsWs : 0,
          s: weapon.s,
          ap: weapon.ap,
          d: weapon.d,
          attributes: [...weapon.attributes],
        }
      : undefined,
    addedAbilities: [],
    addedKeywords: [],
    rollModifiers: {
      hit: [],
      wound: [],
      save: [],
    },
    autoHit: false,
    autoWound: false,
    rerollHits: "none",
    rerollWounds: "none",
    rerollSaves: "none",
    feelNoPain: null,
  };
}

/**
 * Applies a roll bonus mechanic.
 */
function applyRollBonus(stats: ModifiedStats, mechanic: Mechanic): void {
  const source = mechanic.source ?? DEFAULT_SOURCE;
  const value = typeof mechanic.value === "number" ? mechanic.value : 0;

  const modifier: RollModifier = {
    value,
    source,
  };

  switch (mechanic.attribute) {
    case "h":
      stats.rollModifiers.hit.push(modifier);
      break;
    case "w":
      stats.rollModifiers.wound.push(modifier);
      break;
    case "s":
      stats.rollModifiers.save.push(modifier);
      break;
  }
}

/**
 * Applies a roll penalty mechanic.
 */
function applyRollPenalty(stats: ModifiedStats, mechanic: Mechanic): void {
  const source = mechanic.source ?? DEFAULT_SOURCE;
  const value = typeof mechanic.value === "number" ? -Math.abs(mechanic.value) : 0;

  const modifier: RollModifier = {
    value,
    source,
  };

  switch (mechanic.attribute) {
    case "h":
      stats.rollModifiers.hit.push(modifier);
      break;
    case "w":
      stats.rollModifiers.wound.push(modifier);
      break;
    case "s":
      stats.rollModifiers.save.push(modifier);
      break;
  }
}

/**
 * Applies a static number mechanic (sets a characteristic to a fixed value).
 */
function applyStaticNumber(stats: ModifiedStats, mechanic: Mechanic): void {
  const value = mechanic.value;
  if (value === null || value === undefined) return;

  // Model attributes
  const modelAttrs: (keyof ModifiedModelStats)[] = [
    "m",
    "t",
    "sv",
    "invSv",
    "w",
    "ld",
    "oc",
  ];
  if (mechanic.attribute && modelAttrs.includes(mechanic.attribute as any)) {
    const numValue = typeof value === "number" ? value : null;
    if (numValue !== null) {
      (stats.model as any)[mechanic.attribute] = numValue;
    }
  }

  // Weapon attributes
  if (stats.weapon && mechanic.attribute) {
    const weaponAttrs: (keyof ModifiedWeaponStats)[] = [
      "range",
      "a",
      "bsWs",
      "s",
      "ap",
      "d",
    ];
    if (weaponAttrs.includes(mechanic.attribute as any)) {
      (stats.weapon as any)[mechanic.attribute] = value;
    }
  }
}

/**
 * Applies an addsAbility mechanic.
 */
function applyAddsAbility(stats: ModifiedStats, mechanic: Mechanic): void {
  if (!mechanic.abilities) return;

  for (const ability of mechanic.abilities) {
    const upperAbility = ability.toUpperCase();

    // Check for Feel No Pain
    if (upperAbility.includes("FEEL NO PAIN")) {
      const fnpValue = typeof mechanic.value === "number" ? mechanic.value : null;
      if (fnpValue !== null) {
        // Use the best (lowest) FNP value
        if (stats.feelNoPain === null || fnpValue < stats.feelNoPain) {
          stats.feelNoPain = fnpValue;
        }
      }
    }

    // Add to abilities list (avoid duplicates)
    if (!stats.addedAbilities.includes(upperAbility)) {
      stats.addedAbilities.push(upperAbility);
    }
  }
}

/**
 * Applies an addsKeyword mechanic.
 */
function applyAddsKeyword(stats: ModifiedStats, mechanic: Mechanic): void {
  if (!mechanic.keywords) return;

  for (const keyword of mechanic.keywords) {
    const upperKeyword = keyword.toUpperCase();

    // Add to keywords list (avoid duplicates)
    if (!stats.addedKeywords.includes(upperKeyword)) {
      stats.addedKeywords.push(upperKeyword);
    }
  }
}

/**
 * Applies an autoSuccess mechanic.
 */
function applyAutoSuccess(stats: ModifiedStats, mechanic: Mechanic): void {
  switch (mechanic.attribute) {
    case "h":
      stats.autoHit = true;
      break;
    case "w":
      stats.autoWound = true;
      break;
  }
}

/**
 * Applies a reroll mechanic.
 */
function applyReroll(stats: ModifiedStats, mechanic: Mechanic): void {
  const rerollType: RerollType =
    mechanic.value === "ones"
      ? "ones"
      : mechanic.value === "failed"
        ? "failed"
        : mechanic.value === "all"
          ? "all"
          : "all"; // Default to all if just "true"

  switch (mechanic.attribute) {
    case "h":
      // Upgrade reroll (ones < failed < all)
      if (
        stats.rerollHits === "none" ||
        (stats.rerollHits === "ones" && rerollType !== "ones") ||
        (stats.rerollHits === "failed" && rerollType === "all")
      ) {
        stats.rerollHits = rerollType;
      }
      break;
    case "w":
      if (
        stats.rerollWounds === "none" ||
        (stats.rerollWounds === "ones" && rerollType !== "ones") ||
        (stats.rerollWounds === "failed" && rerollType === "all")
      ) {
        stats.rerollWounds = rerollType;
      }
      break;
    case "s":
      if (
        stats.rerollSaves === "none" ||
        (stats.rerollSaves === "ones" && rerollType !== "ones") ||
        (stats.rerollSaves === "failed" && rerollType === "all")
      ) {
        stats.rerollSaves = rerollType;
      }
      break;
  }
}

/**
 * Applies a single mechanic to the stats.
 */
function applyMechanic(stats: ModifiedStats, mechanic: Mechanic): void {
  switch (mechanic.effect) {
    case "rollBonus":
      applyRollBonus(stats, mechanic);
      break;
    case "rollPenalty":
      applyRollPenalty(stats, mechanic);
      break;
    case "staticNumber":
      applyStaticNumber(stats, mechanic);
      break;
    case "addsAbility":
      applyAddsAbility(stats, mechanic);
      break;
    case "addsKeyword":
      applyAddsKeyword(stats, mechanic);
      break;
    case "autoSuccess":
      applyAutoSuccess(stats, mechanic);
      break;
    case "reroll":
      applyReroll(stats, mechanic);
      break;
    // mortalWounds is handled separately in damage calculation
  }
}

/**
 * Applies all applicable mechanics to create modified stats.
 *
 * Mechanics are applied in this order:
 * 1. addsKeyword - Keywords first (other mechanics may check them)
 * 2. addsAbility - Abilities second (other mechanics may check them)
 * 3. staticNumber - Override base values
 * 4. rollBonus/rollPenalty - Accumulate modifiers
 * 5. autoSuccess/reroll - Special effects
 *
 * @param mechanics - Array of mechanics to apply
 * @param context - The game context
 * @param perspective - Whether applying to attacker or defender
 * @returns Modified stats
 */
export function applyEffects(
  mechanics: Mechanic[],
  context: GameContext,
  perspective: "attacker" | "defender"
): ModifiedStats {
  const stats = createInitialStats(context, perspective);

  // Filter to only applicable mechanics
  const applicableMechanics = filterApplicableMechanics(
    mechanics,
    context,
    perspective
  );

  // Sort by effect order
  const effectOrder: Record<string, number> = {
    addsKeyword: 1,
    addsAbility: 2,
    staticNumber: 3,
    rollBonus: 4,
    rollPenalty: 4,
    autoSuccess: 5,
    reroll: 5,
    mortalWounds: 6,
  };

  const sortedMechanics = [...applicableMechanics].sort(
    (a, b) => (effectOrder[a.effect] ?? 99) - (effectOrder[b.effect] ?? 99)
  );

  // Apply each mechanic
  for (const mechanic of sortedMechanics) {
    applyMechanic(stats, mechanic);
  }

  return stats;
}

/**
 * Applies effects and returns both the modified stats and details about which mechanics applied.
 */
export function applyEffectsWithDetails(
  mechanics: Mechanic[],
  context: GameContext,
  perspective: "attacker" | "defender"
): {
  stats: ModifiedStats;
  applied: Mechanic[];
  notApplied: Mechanic[];
} {
  const stats = createInitialStats(context, perspective);
  const applied: Mechanic[] = [];
  const notApplied: Mechanic[] = [];

  // Filter mechanics
  const applicableMechanics = filterApplicableMechanics(
    mechanics,
    context,
    perspective
  );
  const applicableSet = new Set(applicableMechanics);

  for (const mechanic of mechanics) {
    if (applicableSet.has(mechanic)) {
      applied.push(mechanic);
    } else {
      notApplied.push(mechanic);
    }
  }

  // Sort and apply
  const effectOrder: Record<string, number> = {
    addsKeyword: 1,
    addsAbility: 2,
    staticNumber: 3,
    rollBonus: 4,
    rollPenalty: 4,
    autoSuccess: 5,
    reroll: 5,
    mortalWounds: 6,
  };

  const sortedApplied = [...applied].sort(
    (a, b) => (effectOrder[a.effect] ?? 99) - (effectOrder[b.effect] ?? 99)
  );

  for (const mechanic of sortedApplied) {
    applyMechanic(stats, mechanic);
  }

  return { stats, applied, notApplied };
}

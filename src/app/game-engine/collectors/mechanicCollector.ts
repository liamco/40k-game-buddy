import type { GameContext, CollectedMechanics, Mechanic, MechanicSource, UnitContext } from "../types";
import type { Datasheet, DamagedMechanic } from "../../types";
import { collectUnitAbilities } from "./unitAbilityCollector";
import { collectWeaponAttributes } from "./weaponAttributeCollector";
import { collectEnhancement } from "./enhancementCollector";
import { collectDetachmentAbilities } from "./detachmentCollector";
import { collectFactionAbilities } from "./factionAbilityCollector";
import { collectStratagems } from "./stratagemCollector";

/**
 * Collects damaged profile mechanics when a unit is in damaged state.
 * Converts DamagedMechanic to full Mechanic with source information.
 */
function collectDamagedMechanics(unit: UnitContext): Mechanic[] {
    if (!unit.state.isDamaged) {
        return [];
    }

    const datasheet = unit.datasheet as Datasheet & { damagedMechanics?: DamagedMechanic[] };
    if (!datasheet.damagedMechanics || datasheet.damagedMechanics.length === 0) {
        return [];
    }

    const source: MechanicSource = {
        type: "ability",
        name: "Damaged Profile",
        unitName: datasheet.name,
    };

    return datasheet.damagedMechanics.map((dm) => ({
        entity: dm.entity,
        effect: dm.effect,
        attribute: dm.attribute,
        value: dm.value, // Keep positive - applicator handles sign for penalties
        conditions: dm.conditions,
        source,
    }));
}

/**
 * Collects all mechanics from all sources for a given game context.
 *
 * Sources include:
 * - Unit abilities (including attached leader abilities)
 * - Weapon attributes (HEAVY, TORRENT, etc.)
 * - Enhancements
 * - Faction abilities (e.g., Oath of Moment)
 * - Detachment abilities
 * - Active stratagems
 *
 * @param context - The full game context
 * @returns Collected mechanics split by attacker/defender
 */
export function collectAllMechanics(context: GameContext): CollectedMechanics {
    return {
        attackerMechanics: collectAttackerMechanics(context),
        defenderMechanics: collectDefenderMechanics(context),
    };
}

/**
 * Collects all mechanics that apply to the attacker.
 */
function collectAttackerMechanics(context: GameContext): Mechanic[] {
    const mechanics: Mechanic[] = [];

    // 1. Unit abilities (including attached leader)
    const unitAbilities = collectUnitAbilities(context.attacker, "attacker");
    mechanics.push(...unitAbilities);

    // 2. Weapon attributes
    const weaponMechanics = collectWeaponAttributes(context.attacker.selectedWeapon);
    mechanics.push(...weaponMechanics);

    // 3. Enhancement
    const enhancementMechanics = collectEnhancement(context.attacker.enhancement);
    mechanics.push(...enhancementMechanics);

    // 4. Faction abilities (e.g., Oath of Moment)
    const factionMechanics = collectFactionAbilities(context.attackerArmy, "attacker");
    mechanics.push(...factionMechanics);

    // 5. Detachment abilities
    const detachmentMechanics = collectDetachmentAbilities(context.attackerArmy, "attacker");
    mechanics.push(...detachmentMechanics);

    // 6. Active stratagems
    const stratagemMechanics = collectStratagems(context.attackerStratagems, context);
    mechanics.push(...stratagemMechanics);

    // 7. Damaged profile mechanics (for vehicles/monsters)
    const damagedMechanics = collectDamagedMechanics(context.attacker);
    mechanics.push(...damagedMechanics);

    return mechanics;
}

/**
 * Collects all mechanics that apply to the defender.
 */
function collectDefenderMechanics(context: GameContext): Mechanic[] {
    const mechanics: Mechanic[] = [];

    // 1. Unit abilities (including attached leader)
    const unitAbilities = collectUnitAbilities(context.defender, "defender");
    mechanics.push(...unitAbilities);

    // 2. Enhancement (defenders can have enhancements too)
    const enhancementMechanics = collectEnhancement(context.defender.enhancement);
    mechanics.push(...enhancementMechanics);

    // 3. Faction abilities
    const factionMechanics = collectFactionAbilities(context.defenderArmy, "defender");
    mechanics.push(...factionMechanics);

    // 4. Detachment abilities
    const detachmentMechanics = collectDetachmentAbilities(context.defenderArmy, "defender");
    mechanics.push(...detachmentMechanics);

    // 5. Active stratagems
    const stratagemMechanics = collectStratagems(context.defenderStratagems, context);
    mechanics.push(...stratagemMechanics);

    // 6. Damaged profile mechanics (for vehicles/monsters)
    const damagedMechanics = collectDamagedMechanics(context.defender);
    mechanics.push(...damagedMechanics);

    // Note: Defenders don't have weapon attributes affecting their defense
    // (weapon attributes are offensive)

    return mechanics;
}

/**
 * Filters mechanics to only those relevant for a specific roll type.
 *
 * @param mechanics - Array of mechanics to filter
 * @param rollType - "h" for hit, "w" for wound, "s" for save
 * @returns Filtered mechanics
 */
export function filterMechanicsByRollType(mechanics: Mechanic[], rollType: "h" | "w" | "s"): Mechanic[] {
    return mechanics.filter((mechanic) => {
        // Roll modifiers for this roll type
        if ((mechanic.effect === "rollBonus" || mechanic.effect === "rollPenalty") && mechanic.attribute === rollType) {
            return true;
        }

        // Rerolls for this roll type
        if (mechanic.effect === "reroll" && mechanic.attribute === rollType) {
            return true;
        }

        // Auto-success for this roll type
        if (mechanic.effect === "autoSuccess" && mechanic.attribute === rollType) {
            return true;
        }

        return false;
    });
}

/**
 * Gets all mechanics that add abilities.
 */
export function filterAbilityMechanics(mechanics: Mechanic[]): Mechanic[] {
    return mechanics.filter((mechanic) => mechanic.effect === "addsAbility");
}

/**
 * Gets all mechanics that add keywords.
 */
export function filterKeywordMechanics(mechanics: Mechanic[]): Mechanic[] {
    return mechanics.filter((mechanic) => mechanic.effect === "addsKeyword");
}

/**
 * Gets all mechanics that set static numbers.
 */
export function filterStaticNumberMechanics(mechanics: Mechanic[]): Mechanic[] {
    return mechanics.filter((mechanic) => mechanic.effect === "staticNumber");
}

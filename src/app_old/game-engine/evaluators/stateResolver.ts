import type { Entity, Attribute, GameContext, UnitContext, CombatStatus, CombatStatusFlag } from "../types";
import type { Datasheet, Model, WeaponProfile } from "../../types";

/**
 * Entity state containing all relevant information for condition evaluation.
 */
export interface EntityState {
    datasheet?: Datasheet;
    model?: Model;
    weapon?: WeaponProfile;
    combatStatus?: CombatStatus;
    keywords: string[];
    abilities: string[];
}

/**
 * Resolves which UnitContext an entity reference points to.
 */
function resolveEntityToUnit(entity: Entity, context: GameContext, perspective: "attacker" | "defender"): UnitContext | null {
    switch (entity) {
        case "thisUnit":
        case "thisModel":
            return perspective === "attacker" ? context.attacker : context.defender;

        case "targetUnit":
        case "targetModel":
        case "opposingUnit":
        case "opposingModel":
            return perspective === "attacker" ? context.defender : context.attacker;

        case "thisArmy":
        case "opponentArmy":
            // Army-level, no unit context
            return null;

        default:
            return null;
    }
}

/**
 * Extracts keywords from a datasheet.
 */
function extractKeywords(datasheet: Datasheet): string[] {
    if (!datasheet.keywords) {
        return [];
    }

    return datasheet.keywords.map((k: { keyword: string }) => k.keyword.toUpperCase());
}

/**
 * Extracts ability names from a datasheet.
 */
function extractAbilities(datasheet: Datasheet): string[] {
    if (!datasheet.abilities) {
        return [];
    }

    return datasheet.abilities.map((a: { name: string }) => a.name.toUpperCase());
}

/**
 * Resolves the full state for an entity.
 *
 * @param entity - The entity to resolve
 * @param context - The game context
 * @param perspective - Which side we're evaluating from
 * @returns The entity's state
 */
export function resolveEntityState(entity: Entity, context: GameContext, perspective: "attacker" | "defender"): EntityState {
    const unit = resolveEntityToUnit(entity, context, perspective);

    if (!unit) {
        // Army-level entity
        return {
            keywords: [],
            abilities: [],
        };
    }

    const datasheet = unit.datasheet;
    const keywords = extractKeywords(datasheet);
    const abilities = extractAbilities(datasheet);

    // Add keywords from attached leader
    if (unit.attachedLeader) {
        keywords.push(...extractKeywords(unit.attachedLeader));
        abilities.push(...extractAbilities(unit.attachedLeader));
    }

    return {
        datasheet,
        model: unit.selectedModel,
        weapon: unit.selectedWeapon,
        combatStatus: unit.state,
        keywords: [...new Set(keywords)], // Deduplicate
        abilities: [...new Set(abilities)], // Deduplicate
    };
}

/**
 * Gets a specific attribute value from an entity.
 *
 * @param entity - The entity to query
 * @param attribute - The attribute to get
 * @param context - The game context
 * @param perspective - Which side we're evaluating from
 * @returns The attribute value, or null if not found
 */
export function getEntityAttributeValue(entity: Entity, attribute: Attribute, context: GameContext, perspective: "attacker" | "defender"): number | string | boolean | null {
    const state = resolveEntityState(entity, context, perspective);

    // Model attributes
    const modelAttributes = ["m", "t", "sv", "invSv", "w", "ld", "oc"];
    if (modelAttributes.includes(attribute) && state.model) {
        return state.model[attribute as keyof Model] ?? null;
    }

    // Weapon attributes
    const weaponAttributes = ["range", "a", "bsWs", "s", "ap", "d"];
    if (weaponAttributes.includes(attribute) && state.weapon) {
        return state.weapon[attribute as keyof WeaponProfile] ?? null;
    }

    return null;
}

/**
 * Checks if an entity has a specific state flag.
 *
 * @param entity - The entity to check
 * @param stateName - The state flag to check
 * @param context - The game context
 * @param perspective - Which side we're evaluating from
 * @returns Whether the state flag is true
 */
export function checkEntityState(entity: Entity, stateName: string, context: GameContext, perspective: "attacker" | "defender"): boolean {
    // Handle special state checks first (these don't depend on combatStatus)
    switch (stateName) {
        case "hasLeader":
        case "isLeadingUnit":
        case "leadingUnit":
        case "leading": {
            const unit = resolveEntityToUnit(entity, context, perspective);
            return unit?.attachedLeader != null;
        }

        case "isAttached": {
            const unit = resolveEntityToUnit(entity, context, perspective);
            return unit?.attachedLeader != null;
        }

        case "isOathOfMomentTarget": {
            // Oath of Moment: check if the target unit matches the attacker's OoM target
            // This applies when checking targetUnit from attacker's perspective
            if (entity === "targetUnit" || entity === "opposingUnit") {
                const targetId = context.defender.datasheet.id;
                return context.attackerArmy.oathOfMomentTarget === targetId;
            }
            return false;
        }
    }

    // For other states, check combatStatus
    const state = resolveEntityState(entity, context, perspective);

    if (!state.combatStatus) {
        return false;
    }

    // Check if stateName is a valid CombatStatusFlag directly
    if (stateName in state.combatStatus) {
        return state.combatStatus[stateName as CombatStatusFlag];
    }

    return false;
}

/**
 * Checks if an entity has a specific keyword.
 */
export function entityHasKeyword(entity: Entity, keyword: string, context: GameContext, perspective: "attacker" | "defender"): boolean {
    const state = resolveEntityState(entity, context, perspective);
    return state.keywords.includes(keyword.toUpperCase());
}

/**
 * Checks if an entity has any of the specified keywords.
 */
export function entityHasAnyKeyword(entity: Entity, keywords: string[], context: GameContext, perspective: "attacker" | "defender"): boolean {
    const state = resolveEntityState(entity, context, perspective);
    return keywords.some((k) => state.keywords.includes(k.toUpperCase()));
}

/**
 * Checks if an entity has a specific ability.
 */
export function entityHasAbility(entity: Entity, ability: string, context: GameContext, perspective: "attacker" | "defender"): boolean {
    const state = resolveEntityState(entity, context, perspective);
    return state.abilities.includes(ability.toUpperCase());
}

/**
 * Checks if an entity has any of the specified abilities.
 */
export function entityHasAnyAbility(entity: Entity, abilities: string[], context: GameContext, perspective: "attacker" | "defender"): boolean {
    const state = resolveEntityState(entity, context, perspective);
    return abilities.some((a) => state.abilities.includes(a.toUpperCase()));
}

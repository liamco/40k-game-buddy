import type { UnitSelectItem } from "../../CombatPhase/utils/combatUtils";
import type { Weapon, WeaponProfile } from "#types/Weapons";
import type { EngagementForceItem } from "#types/Engagements";

/**
 * Movement behavior types that effects can be relevant to
 */
export type MovementType = "hold" | "move" | "advance" | "fallBack" | "charge";

/**
 * Source types for movement effects - supports future expansion
 */
export type EffectSourceType = "weapon" | "unitAbility" | "detachmentAbility" | "stratagem" | "factionAbility";

/**
 * Source information for a movement effect
 */
export interface EffectSource {
    type: EffectSourceType;
    name: string;
    attribute?: string; // For weapon attributes like "ASSAULT", "HEAVY"
}

/**
 * A movement-related effect that should be displayed to the player
 */
export interface MovementEffect {
    description: string;
    source: EffectSource;
    relevantMovement: MovementType[];
}

/**
 * Movement-relevant weapon attributes and their effects
 */
const WEAPON_ATTRIBUTE_EFFECTS: Record<string, { description: string; relevantMovement: MovementType[] }> = {
    ASSAULT: {
        description: "Can advance and shoot",
        relevantMovement: ["advance"],
    },
    HEAVY: {
        description: "Gets +1 to hit if holding",
        relevantMovement: ["hold"],
    },
    LANCE: {
        description: "Gets +1 to wound after charging",
        relevantMovement: ["charge"],
    },
};

/**
 * Standard ability names (from OpenAI extraction) mapped to their movement effects
 */
const ABILITY_MOVEMENT_EFFECTS: Record<string, { description: string; relevantMovement: MovementType[] }> = {
    "CHARGE AFTER ADVANCING": {
        description: "Can advance and charge",
        relevantMovement: ["advance"],
    },
    "SHOOT AFTER FALLING BACK": {
        description: "Can shoot after falling back",
        relevantMovement: ["fallBack"],
    },
    "CHARGE AFTER FALLING BACK": {
        description: "Can charge after falling back",
        relevantMovement: ["fallBack"],
    },
    "SHOOT AFTER ADVANCING": {
        description: "Can advance and shoot",
        relevantMovement: ["advance"],
    },
    "FELL BACK": {
        // From Adaptable Predators - eligible to shoot and charge after falling back
        description: "Can shoot and charge after falling back",
        relevantMovement: ["fallBack"],
    },
};

/**
 * Extract movement effects from a unit's weapons and abilities
 */
function extractEffectsFromUnit(unit: EngagementForceItem): MovementEffect[] {
    const effects: MovementEffect[] = [];

    // 1. Scan weapon attributes (ASSAULT, HEAVY, LANCE)
    if (unit.wargear) {
        for (const weapon of unit.wargear) {
            for (const profile of weapon.profiles) {
                for (const attr of profile.attributes) {
                    const attrUpper = attr.toUpperCase();
                    const effectDef = WEAPON_ATTRIBUTE_EFFECTS[attrUpper];
                    if (effectDef) {
                        effects.push({
                            description: effectDef.description,
                            source: {
                                type: "weapon",
                                name: profile.name,
                                attribute: attrUpper,
                            },
                            relevantMovement: effectDef.relevantMovement,
                        });
                    }
                }
            }
        }
    }

    // 2. Scan unit abilities for movement-related mechanics
    if (unit.abilities) {
        for (const ability of unit.abilities) {
            if (ability.mechanics && Array.isArray(ability.mechanics)) {
                for (const mechanic of ability.mechanics) {
                    // Check for addsAbility effect with movement-related abilities
                    if (mechanic.effect === "addsAbility" && mechanic.abilities && Array.isArray(mechanic.abilities)) {
                        for (const abilityName of mechanic.abilities) {
                            const abilityUpper = abilityName.toUpperCase();
                            const effectDef = ABILITY_MOVEMENT_EFFECTS[abilityUpper];
                            if (effectDef) {
                                effects.push({
                                    description: effectDef.description,
                                    source: {
                                        type: "unitAbility",
                                        name: ability.name,
                                    },
                                    relevantMovement: effectDef.relevantMovement,
                                });
                            }
                        }
                    }

                    // Check for conditional bonuses with movement-related states
                    if (mechanic.conditions && Array.isArray(mechanic.conditions)) {
                        for (const condition of mechanic.conditions) {
                            // Handle isStationary condition (relevant to hold)
                            if (condition.state === "isStationary" && condition.value === true) {
                                // This indicates a bonus when stationary
                                const bonusDesc = describeMechanicBonus(mechanic);
                                if (bonusDesc) {
                                    effects.push({
                                        description: bonusDesc,
                                        source: {
                                            type: "unitAbility",
                                            name: ability.name,
                                        },
                                        relevantMovement: ["hold"],
                                    });
                                }
                            }
                            // Handle hasChargedThisTurn condition (relevant to charge)
                            if (condition.state === "hasChargedThisTurn" && condition.value === true) {
                                const bonusDesc = describeMechanicBonus(mechanic);
                                if (bonusDesc) {
                                    effects.push({
                                        description: bonusDesc,
                                        source: {
                                            type: "unitAbility",
                                            name: ability.name,
                                        },
                                        relevantMovement: ["charge"],
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return effects;
}

/**
 * Describe a mechanic's bonus for display purposes
 */
function describeMechanicBonus(mechanic: any): string | null {
    if (mechanic.effect === "rollBonus" && mechanic.attribute && mechanic.value) {
        const attrNames: Record<string, string> = {
            h: "hit",
            w: "wound",
            a: "attacks",
            s: "strength",
            ap: "AP",
            d: "damage",
        };
        const attrName = attrNames[mechanic.attribute] || mechanic.attribute;
        const sign = mechanic.value > 0 ? "+" : "";
        return `${sign}${mechanic.value} to ${attrName}`;
    }
    return null;
}

/**
 * Extract all movement effects from a unit.
 * Since units are now pre-merged at engagement creation, this simply extracts from the single unit.
 */
export function getMovementEffects(unitItem: UnitSelectItem): MovementEffect[] {
    return extractEffectsFromUnit(unitItem.item);
}

/**
 * Get unique badges for movement-relevant attributes/abilities.
 * Returns unique badges like "ASSAULT", "HEAVY", "BOUNDING LEAP"
 */
export function getMovementRelevantBadges(unitItem: UnitSelectItem): string[] {
    const badges = new Set<string>();
    const effects = getMovementEffects(unitItem);

    for (const effect of effects) {
        if (effect.source.type === "weapon" && effect.source.attribute) {
            // For weapons, show the attribute (ASSAULT, HEAVY, LANCE)
            badges.add(effect.source.attribute);
        } else if (effect.source.type === "unitAbility") {
            // For abilities, show the ability name
            badges.add(effect.source.name.toUpperCase());
        }
    }

    return Array.from(badges);
}

/**
 * Group effects by description, consolidating multiple weapons with the same attribute
 */
export interface GroupedMovementEffect {
    description: string;
    sources: EffectSource[];
    relevantMovement: MovementType[];
}

export function groupMovementEffects(effects: MovementEffect[]): GroupedMovementEffect[] {
    const grouped = new Map<string, GroupedMovementEffect>();

    for (const effect of effects) {
        const key = effect.description;
        const existing = grouped.get(key);

        if (existing) {
            // Check if this exact source already exists
            const sourceExists = existing.sources.some((s) => s.type === effect.source.type && s.name === effect.source.name && s.attribute === effect.source.attribute);

            if (!sourceExists) {
                existing.sources.push(effect.source);
            }
        } else {
            grouped.set(key, {
                description: effect.description,
                sources: [effect.source],
                relevantMovement: effect.relevantMovement,
            });
        }
    }

    return Array.from(grouped.values());
}

/**
 * Filter effects to only those relevant to a specific movement type
 */
export function filterEffectsByMovement(effects: MovementEffect[], movementType: MovementType): MovementEffect[] {
    return effects.filter((e) => e.relevantMovement.includes(movementType));
}

/**
 * Format the source attribution for display (e.g., "BOLT RIFLE HAS HEAVY")
 */
export function formatSourceAttribution(source: EffectSource): string {
    const name = source.name.toUpperCase();

    if (source.type === "weapon" && source.attribute) {
        return `${name} has ${source.attribute}`;
    }

    return `Unit has ${name}`;
}

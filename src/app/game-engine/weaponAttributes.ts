/**
 * Weapon attribute to mechanic conversion
 * Maps weapon keywords (HEAVY, TORRENT, etc.) to structured mechanics
 */

import type { Mechanic } from "./types/Mechanic";
import type { SpecialEffect, SpecialEffectType } from "./types/ModifierResult";
import { createEffectSource, type EffectSource } from "./types/EffectSource";

/**
 * Parse a weapon attribute string and return its mechanic and/or special effect
 */
export interface WeaponAttributeResult {
    mechanic: Mechanic | null;
    specialEffect: SpecialEffect | null;
}

/**
 * Convert a weapon attribute to a mechanic
 */
export function parseWeaponAttribute(attribute: string, weaponName: string): WeaponAttributeResult {
    const attr = attribute.toUpperCase().trim();
    const source = createEffectSource("weaponAttribute", weaponName, { attribute: attr });

    // TORRENT - auto-hit (handled via mechanic, specialEffect for UI badge only)
    if (attr === "TORRENT") {
        return {
            mechanic: {
                entity: "thisUnit",
                effect: "autoSuccess",
                attribute: "h",
                value: true,
            },
            specialEffect: {
                type: "torrent",
                value: true,
                source,
            },
        };
    }

    // HEAVY - +1 to hit if stationary
    if (attr === "HEAVY") {
        return {
            mechanic: {
                entity: "thisUnit",
                effect: "rollBonus",
                attribute: "h",
                value: 1,
                conditions: [
                    {
                        entity: "thisUnit",
                        state: "isStationary",
                        operator: "equals",
                        value: true,
                    },
                ],
            },
            specialEffect: {
                type: "heavy",
                value: true,
                source,
            },
        };
    }

    // ASSAULT - can shoot after advancing (no combat modifier, but track as effect)
    if (attr === "ASSAULT") {
        return {
            mechanic: null,
            specialEffect: {
                type: "assault",
                value: true,
                source,
            },
        };
    }

    // RAPID FIRE X - +X attacks at half range
    if (attr.startsWith("RAPID FIRE")) {
        const value = parseInt(attr.replace("RAPID FIRE", "").trim(), 10) || 1;
        return {
            mechanic: {
                entity: "thisUnit",
                effect: "rollBonus",
                attribute: "a",
                value,
                conditions: [
                    {
                        entity: "targetUnit",
                        state: "inHalfRange",
                        operator: "equals",
                        value: true,
                    },
                ],
            },
            specialEffect: {
                type: "rapidFire",
                value,
                source,
            },
        };
    }

    // LANCE - +1 to wound on charge
    if (attr === "LANCE") {
        return {
            mechanic: {
                entity: "thisUnit",
                effect: "rollBonus",
                attribute: "w",
                value: 1,
                conditions: [
                    {
                        entity: "thisUnit",
                        state: "hasChargedThisTurn",
                        operator: "equals",
                        value: true,
                    },
                ],
            },
            specialEffect: {
                type: "lance",
                value: true,
                source,
            },
        };
    }

    // LETHAL HITS - critical hits auto-wound
    if (attr === "LETHAL HITS") {
        return {
            mechanic: {
                entity: "thisUnit",
                effect: "addsAbility",
                abilities: ["LETHAL HITS"],
                value: true,
            },
            specialEffect: {
                type: "lethalHits",
                value: true,
                source,
            },
        };
    }

    // SUSTAINED HITS X - critical hits generate extra hits
    if (attr.startsWith("SUSTAINED HITS")) {
        const value = parseInt(attr.replace("SUSTAINED HITS", "").trim(), 10) || 1;
        return {
            mechanic: {
                entity: "thisUnit",
                effect: "addsAbility",
                abilities: ["SUSTAINED HITS"],
                value,
            },
            specialEffect: {
                type: "sustainedHits",
                value,
                source,
            },
        };
    }

    // DEVASTATING WOUNDS - critical wounds deal mortal wounds
    if (attr === "DEVASTATING WOUNDS") {
        return {
            mechanic: {
                entity: "thisUnit",
                effect: "addsAbility",
                abilities: ["DEVASTATING WOUNDS"],
                value: true,
            },
            specialEffect: {
                type: "devastatingWounds",
                value: true,
                source,
            },
        };
    }

    // IGNORES COVER (handled via mechanic, specialEffect for UI badge only)
    if (attr === "IGNORES COVER") {
        return {
            mechanic: {
                entity: "targetUnit",
                effect: "ignoreModifier",
                attribute: "s",
                value: "cover",
            },
            specialEffect: {
                type: "ignoresCover",
                value: true,
                source,
            },
        };
    }

    // PRECISION - can target characters
    if (attr === "PRECISION") {
        return {
            mechanic: null,
            specialEffect: {
                type: "precision",
                value: true,
                source,
            },
        };
    }

    // MELTA X - +X damage at half range
    if (attr.startsWith("MELTA")) {
        const value = parseInt(attr.replace("MELTA", "").trim(), 10) || 1;
        return {
            mechanic: {
                entity: "thisUnit",
                effect: "rollBonus",
                attribute: "d",
                value,
                conditions: [
                    {
                        entity: "targetUnit",
                        state: "inHalfRange",
                        operator: "equals",
                        value: true,
                    },
                ],
            },
            specialEffect: {
                type: "melta",
                value,
                source,
            },
        };
    }

    // HAZARDOUS - risk of mortal wounds to self
    if (attr === "HAZARDOUS") {
        return {
            mechanic: null,
            specialEffect: {
                type: "hazardous",
                value: true,
                source,
            },
        };
    }

    // BLAST - +1 attack per 5 models in target
    if (attr === "BLAST") {
        return {
            mechanic: null, // Complex calculation, handled separately
            specialEffect: {
                type: "blast",
                value: true,
                source,
            },
        };
    }

    // INDIRECT FIRE - can target without LOS but -1 to hit and defender gets cover
    if (attr === "INDIRECT FIRE") {
        return {
            mechanic: null, // Complex conditional, handled separately
            specialEffect: {
                type: "indirect",
                value: true,
                source,
            },
        };
    }

    // ANTI-KEYWORD X+ - critical wound on X+ against keyword
    const antiMatch = attr.match(/^ANTI-(.+)\s+(\d)\+$/);
    if (antiMatch) {
        const keyword = antiMatch[1];
        const threshold = parseInt(antiMatch[2], 10);
        return {
            mechanic: {
                entity: "thisUnit",
                effect: "addsAbility",
                abilities: [`ANTI-${keyword}`],
                value: threshold,
                conditions: [
                    {
                        entity: "targetUnit",
                        keywords: [keyword],
                        operator: "includes",
                        value: keyword,
                    },
                ],
            },
            specialEffect: {
                type: "antiKeyword",
                value: `${keyword} ${threshold}+`,
                source,
            },
        };
    }

    // Unknown attribute
    return {
        mechanic: null,
        specialEffect: null,
    };
}

/**
 * Extract all mechanics and special effects from a weapon's attributes
 */
export function extractWeaponMechanics(
    attributes: string[],
    weaponName: string
): {
    mechanics: Mechanic[];
    specialEffects: SpecialEffect[];
} {
    const mechanics: Mechanic[] = [];
    const specialEffects: SpecialEffect[] = [];

    for (const attr of attributes) {
        const result = parseWeaponAttribute(attr, weaponName);
        if (result.mechanic) {
            mechanics.push(result.mechanic);
        }
        if (result.specialEffect) {
            specialEffects.push(result.specialEffect);
        }
    }

    return { mechanics, specialEffects };
}

/**
 * Check if weapon has a specific attribute
 */
export function hasWeaponAttribute(attributes: string[], attributeName: string): boolean {
    const target = attributeName.toUpperCase();
    return attributes.some((attr) => attr.toUpperCase().startsWith(target));
}

/**
 * Get the numeric value from a parameterized attribute (e.g., "SUSTAINED HITS 2" -> 2)
 */
export function getAttributeValue(attributes: string[], attributeName: string): number | null {
    const target = attributeName.toUpperCase();
    const attr = attributes.find((a) => a.toUpperCase().startsWith(target));
    if (!attr) return null;

    const match = attr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
}

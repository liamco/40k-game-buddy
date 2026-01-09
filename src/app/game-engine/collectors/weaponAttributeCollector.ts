import type { Mechanic, MechanicSource } from "../types";
import type { WeaponProfile } from "../../types";

/**
 * Maps weapon attributes (like HEAVY, TORRENT) to structured mechanics.
 * This normalizes weapon rules into the same format as ability mechanics.
 */

type WeaponAttributeConverter = (value?: string) => Mechanic;

const createSource = (name: string): MechanicSource => ({
    type: "weapon",
    name,
});

/**
 * Parses a numeric value from weapon attributes like "SUSTAINED HITS 2" or "BLAST"
 */
function parseAttributeValue(attr: string, keyword: string): string | undefined {
    const match = attr.match(new RegExp(`${keyword}\\s*(\\d+)?`, "i"));
    return match?.[1];
}

/**
 * Weapon attribute converters.
 * Each converts a weapon attribute string to a Mechanic.
 */
const WEAPON_ATTRIBUTE_CONVERTERS: Record<string, WeaponAttributeConverter> = {
    HEAVY: () => ({
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
        source: createSource("HEAVY"),
    }),

    TORRENT: () => ({
        entity: "thisUnit",
        effect: "autoSuccess",
        attribute: "h",
        value: true,
        source: createSource("TORRENT"),
    }),

    "IGNORES COVER": () => ({
        entity: "targetUnit",
        effect: "addsKeyword",
        keywords: ["IGNORES COVER"],
        value: true,
        source: createSource("IGNORES COVER"),
    }),

    PRECISION: () => ({
        entity: "thisUnit",
        effect: "addsAbility",
        abilities: ["PRECISION"],
        value: true,
        source: createSource("PRECISION"),
    }),

    "LETHAL HITS": () => ({
        entity: "thisUnit",
        effect: "autoSuccess",
        attribute: "w",
        value: true,
        conditions: [
            {
                entity: "thisUnit",
                attribute: "h",
                operator: "equals",
                value: "critical", // On a critical hit (unmodified 6)
            },
        ],
        source: createSource("LETHAL HITS"),
    }),

    "DEVASTATING WOUNDS": () => ({
        entity: "thisUnit",
        effect: "mortalWounds",
        value: true,
        conditions: [
            {
                entity: "thisUnit",
                attribute: "w",
                operator: "equals",
                value: "critical", // On a critical wound (unmodified 6)
            },
        ],
        source: createSource("DEVASTATING WOUNDS"),
    }),

    "TWIN-LINKED": () => ({
        entity: "thisUnit",
        effect: "reroll",
        attribute: "w",
        value: "failed",
        source: createSource("TWIN-LINKED"),
    }),

    LANCE: () => ({
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
        source: createSource("LANCE"),
    }),

    // ANTI-X abilities: Wound rolls of X+ are critical wounds (auto-wound) against targets with keyword.
    // The effective wound target becomes the minimum of (S vs T target) and (ANTI threshold).
    "ANTI-INFANTRY 4+": () => ({
        entity: "thisUnit",
        effect: "criticalWoundThreshold",
        value: 4,
        conditions: [
            {
                entity: "targetUnit",
                keywords: ["INFANTRY"],
                operator: "includes",
                value: true,
            },
        ],
        source: createSource("ANTI-INFANTRY 4+"),
    }),

    "ANTI-VEHICLE 4+": () => ({
        entity: "thisUnit",
        effect: "criticalWoundThreshold",
        value: 4,
        conditions: [
            {
                entity: "targetUnit",
                keywords: ["VEHICLE"],
                operator: "includes",
                value: true,
            },
        ],
        source: createSource("ANTI-VEHICLE 4+"),
    }),

    "ANTI-MONSTER 4+": () => ({
        entity: "thisUnit",
        effect: "criticalWoundThreshold",
        value: 4,
        conditions: [
            {
                entity: "targetUnit",
                keywords: ["MONSTER"],
                operator: "includes",
                value: true,
            },
        ],
        source: createSource("ANTI-MONSTER 4+"),
    }),

    MELTA: () => ({
        entity: "thisUnit",
        effect: "rollBonus",
        attribute: "d",
        value: "D6", // Extra D6 damage at half range
        conditions: [
            {
                entity: "targetUnit",
                state: "withinHalfRange",
                operator: "equals",
                value: true,
            },
        ],
        source: createSource("MELTA"),
    }),

    HAZARDOUS: () => ({
        entity: "thisUnit",
        effect: "addsAbility",
        abilities: ["HAZARDOUS"],
        value: true,
        source: createSource("HAZARDOUS"),
    }),

    INDIRECT: () => ({
        entity: "thisUnit",
        effect: "addsAbility",
        abilities: ["INDIRECT FIRE"],
        value: true,
        source: createSource("INDIRECT FIRE"),
    }),

    ASSAULT: () => ({
        entity: "thisUnit",
        effect: "addsAbility",
        abilities: ["ASSAULT"],
        value: true,
        source: createSource("ASSAULT"),
    }),

    PISTOL: () => ({
        entity: "thisUnit",
        effect: "addsAbility",
        abilities: ["PISTOL"],
        value: true,
        source: createSource("PISTOL"),
    }),
};

/**
 * Handles parameterized weapon attributes like "SUSTAINED HITS 2" or "RAPID FIRE 2"
 */
function convertParameterizedAttribute(attr: string): Mechanic | null {
    // SUSTAINED HITS X
    if (attr.startsWith("SUSTAINED HITS")) {
        const value = parseAttributeValue(attr, "SUSTAINED HITS");
        return {
            entity: "thisUnit",
            effect: "rollBonus",
            attribute: "a", // Extra attacks
            value: parseInt(value || "1"),
            conditions: [
                {
                    entity: "thisUnit",
                    attribute: "h",
                    operator: "equals",
                    value: "critical",
                },
            ],
            source: createSource(attr),
        };
    }

    // RAPID FIRE X
    if (attr.startsWith("RAPID FIRE")) {
        const value = parseAttributeValue(attr, "RAPID FIRE");
        return {
            entity: "thisUnit",
            effect: "rollBonus",
            attribute: "a",
            value: parseInt(value || "1"),
            conditions: [
                {
                    entity: "targetUnit",
                    state: "withinHalfRange",
                    operator: "equals",
                    value: true,
                },
            ],
            source: createSource(attr),
        };
    }

    // BLAST
    if (attr === "BLAST") {
        return {
            entity: "thisUnit",
            effect: "rollBonus",
            attribute: "a",
            value: "perModel", // +1 attack per 5 models in target unit
            conditions: [
                {
                    entity: "targetUnit",
                    attribute: "modelCount",
                    operator: "greaterThanOrEqualTo",
                    value: 5,
                },
            ],
            source: createSource("BLAST"),
        };
    }

    // ANTI-X Y+ pattern (handles various anti-keyword abilities)
    // Wound rolls of Y+ are critical wounds (auto-wound) against targets with keyword X.
    // The effective wound target becomes the minimum of (S vs T target) and (ANTI threshold).
    const antiMatch = attr.match(/ANTI-(\w+)\s+(\d)\+/i);
    if (antiMatch) {
        const [, keyword, threshold] = antiMatch;
        return {
            entity: "thisUnit",
            effect: "criticalWoundThreshold",
            value: parseInt(threshold),
            conditions: [
                {
                    entity: "targetUnit",
                    keywords: [keyword.toUpperCase()],
                    operator: "includes",
                    value: true,
                },
            ],
            source: createSource(attr),
        };
    }

    // MELTA X pattern
    if (attr.startsWith("MELTA")) {
        const value = parseAttributeValue(attr, "MELTA");
        return {
            entity: "thisUnit",
            effect: "rollBonus",
            attribute: "d",
            value: value ? parseInt(value) : "D6",
            conditions: [
                {
                    entity: "targetUnit",
                    state: "withinHalfRange",
                    operator: "equals",
                    value: true,
                },
            ],
            source: createSource(attr),
        };
    }

    return null;
}

/**
 * Converts a single weapon attribute string to a Mechanic (if applicable).
 */
export function convertWeaponAttribute(attr: string): Mechanic | null {
    // Normalize the attribute for lookup
    const normalizedAttr = attr.toUpperCase().trim();

    // Check for exact match first
    const converter = WEAPON_ATTRIBUTE_CONVERTERS[normalizedAttr];
    if (converter) {
        return converter();
    }

    // Try parameterized attributes
    return convertParameterizedAttribute(normalizedAttr);
}

/**
 * Collects all mechanics from a weapon's attributes.
 */
export function collectWeaponAttributes(weapon: WeaponProfile | undefined): Mechanic[] {
    if (!weapon?.attributes) {
        return [];
    }

    const mechanics: Mechanic[] = [];

    for (const attr of weapon.attributes) {
        const mechanic = convertWeaponAttribute(attr);
        if (mechanic) {
            mechanics.push(mechanic);
        }
    }

    return mechanics;
}

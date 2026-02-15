import type { UnitSelectItem } from "../../CombatPhase/utils/combatUtils";
import type { EngagementForceItem } from "#types/Engagements.tsx";
import { type EffectSource, type EffectSourceType, formatSourceAttribution } from "../../MovementPhase/utils/movementEffects";

// Re-export for convenience
export type { EffectSource, EffectSourceType };
export { formatSourceAttribution };

/**
 * A charge-related effect that should be displayed to the player
 */
export interface ChargeEffect {
    description: string;
    source: EffectSource;
}

/**
 * Charge eligibility result
 */
export interface ChargeEligibility {
    eligible: boolean;
    reason?: string;
}

/**
 * Weapon attributes relevant to charging
 */
const WEAPON_ATTRIBUTE_EFFECTS: Record<string, { description: string }> = {
    LANCE: {
        description: "Gets +1 to wound after charging",
    },
};

/**
 * Ability names that grant charge permissions after specific movement types
 */
const CHARGE_PERMISSION_ABILITIES: Record<string, { description: string; permitsAfter: "advance" | "fallBack" }> = {
    "CHARGE AFTER ADVANCING": {
        description: "Can advance and charge",
        permitsAfter: "advance",
    },
    "CHARGE AFTER FALLING BACK": {
        description: "Can charge after falling back",
        permitsAfter: "fallBack",
    },
    "FELL BACK": {
        description: "Can shoot and charge after falling back",
        permitsAfter: "fallBack",
    },
};

// Type alias for engagement abilities with leader tracking
interface EngagementAbility {
    name: string;
    mechanics?: any[];
    isFromLeader?: boolean;
    sourceUnitName?: string;
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
 * Extract charge-relevant effects from a unit
 */
function extractChargeEffects(unit: EngagementForceItem): ChargeEffect[] {
    const effects: ChargeEffect[] = [];

    // 1. Scan weapon attributes (LANCE)
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
                        });
                    }
                }
            }
        }
    }

    // 2. Scan unit abilities for charge-related mechanics
    if (unit.abilities) {
        for (const ability of unit.abilities) {
            const engAbility = ability as EngagementAbility;
            const isFromLeader = engAbility.isFromLeader ?? false;
            const leaderName = isFromLeader ? engAbility.sourceUnitName : undefined;

            if (ability.mechanics && Array.isArray(ability.mechanics)) {
                for (const mechanic of ability.mechanics) {
                    // Check for addsAbility with charge permission abilities
                    if (mechanic.effect === "addsAbility" && mechanic.abilities && Array.isArray(mechanic.abilities)) {
                        for (const abilityName of mechanic.abilities) {
                            const abilityUpper = abilityName.toUpperCase();
                            const permDef = CHARGE_PERMISSION_ABILITIES[abilityUpper];
                            if (permDef) {
                                effects.push({
                                    description: permDef.description,
                                    source: {
                                        type: "unitAbility",
                                        name: ability.name,
                                        isFromLeader,
                                        leaderName,
                                    },
                                });
                            }
                        }
                    }

                    // Check for hasChargedThisTurn conditions (charge bonuses)
                    if (mechanic.conditions && Array.isArray(mechanic.conditions)) {
                        for (const condition of mechanic.conditions) {
                            if (condition.state === "hasChargedThisTurn" && condition.value === true) {
                                const bonusDesc = describeMechanicBonus(mechanic);
                                if (bonusDesc) {
                                    effects.push({
                                        description: bonusDesc,
                                        source: {
                                            type: "unitAbility",
                                            name: ability.name,
                                            isFromLeader,
                                            leaderName,
                                        },
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
 * Check whether a unit has a charge-permission ability for a given movement type
 */
function hasChargePermission(unit: EngagementForceItem, movementType: "advance" | "fallBack"): boolean {
    if (!unit.abilities) return false;

    for (const ability of unit.abilities) {
        if (ability.mechanics && Array.isArray(ability.mechanics)) {
            for (const mechanic of ability.mechanics) {
                if (mechanic.effect === "addsAbility" && mechanic.abilities && Array.isArray(mechanic.abilities)) {
                    for (const abilityName of mechanic.abilities) {
                        const abilityUpper = abilityName.toUpperCase();
                        const permDef = CHARGE_PERMISSION_ABILITIES[abilityUpper];
                        if (permDef && permDef.permitsAfter === movementType) {
                            return true;
                        }
                    }
                }
            }
        }
    }

    return false;
}

/**
 * Determine whether a unit is eligible to declare a charge based on its movement behaviour
 */
export function getChargeEligibility(unitItem: UnitSelectItem): ChargeEligibility {
    const { item } = unitItem;

    if (item.combatState.isDestroyed) {
        return { eligible: false, reason: "Unit is destroyed" };
    }

    const movement = item.combatState.movementBehaviour;

    // No movement selected, hold, or normal move — eligible
    if (movement == null || movement === "hold" || movement === "move") {
        return { eligible: true };
    }

    if (movement === "advance") {
        if (hasChargePermission(item, "advance")) {
            return { eligible: true };
        }
        return { eligible: false, reason: "Unit advanced this turn" };
    }

    if (movement === "fallBack") {
        if (hasChargePermission(item, "fallBack")) {
            return { eligible: true };
        }
        return { eligible: false, reason: "Unit fell back this turn" };
    }

    return { eligible: true };
}

/**
 * Get all charge-relevant effects for a unit
 */
export function getChargeEffects(unitItem: UnitSelectItem): ChargeEffect[] {
    return extractChargeEffects(unitItem.item);
}

/**
 * Get unique badges for charge-relevant attributes/abilities
 */
export function getChargeRelevantBadges(unitItem: UnitSelectItem): string[] {
    const badges = new Set<string>();
    const effects = getChargeEffects(unitItem);

    for (const effect of effects) {
        if (effect.source.type === "weapon" && effect.source.attribute) {
            badges.add(effect.source.attribute);
        } else if (effect.source.type === "unitAbility") {
            badges.add(effect.source.name.toUpperCase());
        }
    }

    return Array.from(badges);
}

/**
 * Group effects by description, consolidating multiple sources
 */
export interface GroupedChargeEffect {
    description: string;
    sources: EffectSource[];
}

export function groupChargeEffects(effects: ChargeEffect[]): GroupedChargeEffect[] {
    const grouped = new Map<string, GroupedChargeEffect>();

    for (const effect of effects) {
        const key = effect.description;
        const existing = grouped.get(key);

        if (existing) {
            const sourceExists = existing.sources.some((s) => s.type === effect.source.type && s.name === effect.source.name && s.attribute === effect.source.attribute);

            if (!sourceExists) {
                existing.sources.push(effect.source);
            }
        } else {
            grouped.set(key, {
                description: effect.description,
                sources: [effect.source],
            });
        }
    }

    return Array.from(grouped.values());
}

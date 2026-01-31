/**
 * Effect source types for attribution and conflict resolution
 */

/**
 * Categories of effect sources, ordered by typical application priority
 */
export type EffectSourceType =
    | "coreRule"
    | "factionAbility"
    | "detachmentRule"
    | "unitAbility"
    | "leaderAbility"
    | "enhancement"
    | "weaponAttribute"
    | "weaponAbility"
    | "stratagem";

/**
 * Priority values for each source type (higher = applied later, can override)
 */
export const SOURCE_PRIORITIES: Record<EffectSourceType, number> = {
    coreRule: 0,
    factionAbility: 10,
    detachmentRule: 20,
    unitAbility: 30,
    leaderAbility: 40,
    enhancement: 50,
    weaponAttribute: 60,
    weaponAbility: 70,
    stratagem: 100,
};

/**
 * Normalized representation of where an effect comes from.
 * Used for display attribution and conflict resolution.
 */
export interface EffectSource {
    type: EffectSourceType;
    name: string;
    sourceUnitName?: string;
    sourceId?: string;
    attribute?: string;
    priority: number;
}

/**
 * Create an EffectSource with appropriate priority
 */
export function createEffectSource(
    type: EffectSourceType,
    name: string,
    options?: Partial<Omit<EffectSource, "type" | "name" | "priority">>
): EffectSource {
    return {
        type,
        name,
        priority: SOURCE_PRIORITIES[type],
        ...options,
    };
}

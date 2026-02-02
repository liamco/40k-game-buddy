import { ArmyListItem, ModelInstance } from "./Lists";
import { Ability } from "./Units";
import { Weapon } from "./Weapons";

/**
 * Tracks the source unit for combined units (leader + bodyguard merged)
 */
export interface SourceUnit {
    listItemId: string;
    datasheetId: string;
    name: string;
    isLeader: boolean;
}

/**
 * Extended ability with source unit tagging for combined units.
 * Allows tracking which leader granted an ability.
 */
export interface EngagementAbility extends Ability {
    sourceUnitName?: string;
    isFromLeader?: boolean;
}

/**
 * Extended model instance with source unit tagging for combined units
 */
export interface EngagementModelInstance extends ModelInstance {
    sourceUnitName?: string;
}

/**
 * Extended weapon with source unit tagging for combined units
 */
export type EngagementWargear = Weapon & {
    sourceUnitName?: string;
};

export type EngagementType = "boarding-actions" | "wh-40k";
export type EngagementSize = "combat-patrol" | "incursion" | "strike-force" | "onslaught";

export type EngagementPhase = "command" | "movement" | "shooting" | "charge" | "fight";

export interface Engagement {
    id: string;
    name?: string;
    type: EngagementType;
    size: EngagementSize;
    engagementForceA: EngagementForce;
    engagementForceB: EngagementForce;
    engagementForceC?: EngagementForce;
    engagementForceD?: EngagementForce;
    activeForceId?: string;
    currentPhase: EngagementPhase;
    currentTurn: number;
    createdAt: number;
    updatedAt: number;
}

export interface EngagementForce {
    sourceListId: string;
    name: string;
    factionId: string;
    factionName: string;
    factionSlug: string;
    factionIcon?: string;
    detachmentSlug?: string;
    detachmentName?: string;
    totalPointsCost: number;
    items: EngagementForceItem[];
}

export type EngagementForceItem = Omit<ArmyListItem, "availableWargear" | "modelInstances" | "abilities"> & {
    wargear: EngagementWargear[];
    modelInstances?: EngagementModelInstance[];
    /** Abilities with source tracking for combined units */
    abilities?: EngagementAbility[];
    combatState: EngagementForceItemCombatState;
    /** For combined units: tracks the original source units (leaders + bodyguard) */
    sourceUnits?: SourceUnit[];
};

export interface EngagementForceItemCombatState {
    modelCount: number;
    unitStrength: "full" | "belowStarting" | "belowHalf";
    deadModelIds: string[];
    currentWounds: number;
    isDamaged: boolean;
    isDestroyed: boolean;
    isBattleShocked: boolean;
    movementBehaviour: "hold" | "move" | "advance" | "fallBack";
    hasShot: boolean;
    hasCharged: boolean;
    hasFought: boolean;
    isInObjectiveRange: "none" | "friendly" | "enemy" | "contested";
    isInEngagementRange: boolean;
    isInCover: boolean;
}

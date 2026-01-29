import { ArmyListItem } from "./Lists";
import { Weapon } from "./Weapons";

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

export type EngagementForceItem = Omit<ArmyListItem, "availableWargear"> & {
    wargear: Weapon[];
    combatState: EngagementForceItemCombatState;
};

export interface EngagementForceItemCombatState {
    modelCount: number;
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

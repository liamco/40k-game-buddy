export * from "./Detachments";
export * from "./Engagements";
export * from "./Enhancements";
export * from "./Factions";
export * from "./Lists";
export * from "./Models";
export * from "./States";
export * from "./Units";
export * from "./Weapons";

// Loadout constraint types
export interface LoadoutConstraint {
    type: "simple" | "ratio" | "threshold" | "addition";
    maxSelections: number;
    ratio?: number;
    threshold?: number;
}

// Unit weapons split by type
export interface UnitWeapons {
    ranged: Weapon[];
    melee: Weapon[];
}

// Game phase type
export type GamePhase = "command" | "movement" | "shooting" | "charge" | "fight";

// Combat state for a unit
export interface UnitCombatState {
    currentWounds?: number;
    isBattleShocked?: boolean;
    hasAdvanced?: boolean;
    hasFallenBack?: boolean;
    isInCover?: boolean;
    oathOfMomentTarget?: boolean;
}

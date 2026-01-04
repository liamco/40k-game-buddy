export type GamePhase = "COMMAND" | "MOVEMENT" | "SHOOTING" | "CHARGE" | "FIGHT";
export type GameTurn = "YOURS" | "OPPONENTS" | "EITHER";

// Faction and Datasheet types for list management
export type FactionIndex = Omit<Faction, "datasheets">

export interface Faction {
    id: string;
    slug: string;
    name: string;
    datasheets: Datasheet[];
    detachments?: Detachment[];
    dataVersion: string;
    datasheetCount: number;
    detachmentCount: number;
}

export interface Detachment {
    slug: string;
    name: string;
    abilities?: any[];
    enhancements?: any[];
    [key: string]: any;
}

export interface ArmyList {
    id: string;
    name: string;
    factionId: string;
    factionName: string;
    factionSlug: string;
    detachmentSlug?: string;
    detachmentName?: string;
    items: ArmyListItem[];
    createdAt: number;
    updatedAt: number;
}

// ArmyListItem extends Datasheet with list-specific metadata
export type ArmyListItem = Datasheet & {
    listItemId: string; // Unique ID for this list entry (allows same unit multiple times)
    quantity?: number;
    pointsCost?: number;
}

export interface Datasheet {
    id: string;
    name: string;
    factionId: string;
    slug: string;
    factionSlug: string;
    role: string;
    roleLabel: string;
    legend?: string;
    loadout?: string;
    transport?: string;
    abilities?: any[];
    keywords?: any[];
    models?: Model[];
    options?: any[];
    wargear: Weapon[];
    unitComposition?: any[];
    modelCosts?: number;
    path: string;
    isForgeWorld?: boolean;
    isLegends?: boolean;
    [key: string]: any; // Allow for additional properties
}

export interface Ability {
    description:string;
    id:string;
    factionId:string;
    legend:string;
    name:string;
    type:string;
    parameter:number|string;
}

export interface Model {
    datasheetId: string,
    name: string,
    m: number,
    t: number,
    sv: number,
    invSv: number|null,
    invSvDescr: string,
    w: number,
    ld: number,
    oc: number,
    baseSize: string,
    baseSizeDescr: string
}

export interface Weapon {
    name: string;
    datasheetId:string;
    id:string;
    type: "Ranged"|"Melee";
    profiles:WeaponProfile[];
}

export interface WeaponProfile {
    name:string;
    attributes:string[];
    a:string | number;
    ap:number;
    bsWs:number|string;
    d:string | number;
    s:number;
    range:number;
}

export interface Stratagem {
    id: string;
    name: string;
    type: string;
    factionId?: string;
    detachment?: string,
    detachmentId?: string,
    cpCost: number;
    phase: GamePhase[] & "ANY";
    turn: GameTurn;
    legend: string;
    conditions?: string[];
    keywords?: string[];
    faction?: string;
}

export interface Modifiers {
    inCover: boolean;
    inRangeOfObjective: boolean;
    stationaryThisTurn: boolean;
}

export interface AttackResult {
    toHit: number;
    autoHit: boolean;
    toWound: number;
    toSave: number;
    invulnSave: boolean;
    feelNoPain: number | null;
    hitBonuses: { label: string; value: number }[];
    hitPenalties: { label: string; value: number }[];
    woundBonuses: { label: string; value: number }[];
    woundPenalties: { label: string; value: number }[];
    saveBonuses: { label: string; value: number }[];
    savePenalties: { label: string; value: number }[];
}
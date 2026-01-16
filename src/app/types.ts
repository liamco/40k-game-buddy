export type GamePhase = "COMMAND" | "MOVEMENT" | "SHOOTING" | "CHARGE" | "FIGHT";
export type GameTurn = "YOURS" | "OPPONENTS" | "EITHER";

// Faction and Datasheet types for list management
export type FactionIndex = Omit<Faction, "datasheets">;

export interface FactionStateFlag {
    name: string;
    label: string;
}

export interface FactionAbility {
    id: string;
    name: string;
    type: "Faction";
    description: string;
    legend?: string;
    mechanics?: any[];
}

export interface Faction {
    id: string;
    slug: string;
    name: string;
    datasheets: Datasheet[];
    detachments?: Detachment[];
    factionAbilities?: FactionAbility[];
    factionStateFlags?: FactionStateFlag[];
    dataVersion: string;
    datasheetCount: number;
    detachmentCount: number;
}

export interface Detachment {
    slug: string;
    name: string;
    abilities?: any[];
    enhancements?: Enhancement[];
    supplementSlug?: string; // e.g., "black-templars", "blood-angels" - used to filter datasheets by supplement
    [key: string]: any;
}

export interface Enhancement {
    id: string;
    name: string;
    description?: string;
    legend?: string;
    cost?: number;
    factionId?: string;
    detachment?: string;
    detachmentId?: number;
    mechanics?: any[];
}

// Leader attachment conditions extracted from leaderFooter text
export interface LeaderCondition {
    allowedExistingLeaderKeywords?: string[]; // Can attach if existing leader has one of these keywords
    allowsAnyExistingLeader?: boolean; // Can attach alongside any existing leader
    equipmentRequirements?: {
        // Equipment restrictions for attaching to specific units
        targetUnitKeywords: string[];
        requiredEquipment: string;
    }[];
    maxOfThisType?: number; // Maximum count of this leader type per unit
    mustAttach?: boolean; // Leader must be attached (cannot be standalone)
}

// Damaged profile mechanic (parsed from damagedDescription)
export interface DamagedMechanic {
    entity: string; // e.g., "thisModel"
    effect: string; // e.g., "rollPenalty", "statPenalty", "statBonus"
    attribute: string; // e.g., "h" (hit), "oc", "a" (attacks)
    value: number;
    conditions?: {
        weapon?: string;
        operator?: string;
        value?: string;
    }[];
}

// Reference to a leader or unit (used in leadBy and leading)
export interface LeaderReference {
    listItemId: string; // Unique list item ID - stable even when names change
    id: string; // Datasheet ID
    name: string; // Display name (may change if duplicates are added)
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

// Combat state stored per unit for session persistence
export interface UnitCombatState {
    modelCount?: number; // Current model count (for tracking casualties)
    isDamaged?: boolean; // Whether the unit is damaged (bracketed)
}

// ArmyListItem extends Datasheet with list-specific metadata
export type ArmyListItem = Datasheet & {
    listItemId: string; // Unique ID for this list entry (allows same unit multiple times)
    quantity?: number;
    pointsCost?: number;
    compositionCounts?: { [line: number]: number }; // Store counts for each unitComposition line
    leading?: LeaderReference; // Unit this leader is attached to
    leadBy?: LeaderReference[]; // Leaders attached to this unit (supports multiple)
    enhancement?: { id: string; name: string; cost?: number }; // Enhancement attached to this leader
    loadoutSelections?: { [optionLine: number]: number }; // Track loadout option selections (count per option)
    removedWeapons?: { [weaponId: string]: boolean }; // Track removed default weapons (excluded from attack resolver)
    combatState?: UnitCombatState; // Persisted combat state (model count, damaged status)
};

// Parsed constraint from option description text
export interface LoadoutConstraint {
    type: "ratio" | "threshold" | "simple" | "addition";
    ratio?: number; // For "every N models" patterns
    threshold?: number; // For "if unit contains N models" patterns
    maxSelections: number; // How many times this option can be selected
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
    factionAbilityIds?: string[];
    keywords?: any[];
    models?: Model[];
    options?: any[];
    wargear: Weapon[];
    unitComposition?: any[];
    modelCosts?: number;
    path: string;
    isForgeWorld?: boolean;
    isLegends?: boolean;
    leaderConditions?: LeaderCondition; // Conditions for multi-leader attachment
    damagedW?: string; // Wound range for damaged profile (e.g., "1-4")
    damagedDescription?: string; // Text description of damaged effects
    damagedThreshold?: number; // Upper bound of damagedW (e.g., 4)
    damagedMechanics?: DamagedMechanic[]; // Parsed mechanics for damaged profile
    supplementSlug?: string; // e.g., "codex", "black-templars" - used to filter by detachment supplement
    [key: string]: any; // Allow for additional properties
}

export interface Ability {
    description: string;
    id: string;
    factionId: string;
    legend: string;
    name: string;
    type: string;
    parameter: number | string;
}

export interface Model {
    datasheetId: string;
    name: string;
    m: number;
    t: number;
    sv: number;
    invSv: number | null;
    invSvDescr: string;
    w: number;
    ld: number;
    oc: number;
    baseSize: string;
    baseSizeDescr: string;
}

export interface Weapon {
    name: string;
    datasheetId: string;
    id: string;
    type: "Ranged" | "Melee";
    profiles: WeaponProfile[];
}

export interface WeaponProfile {
    name: string;
    attributes: string[];
    a: string | number;
    ap: number;
    bsWs: number | string;
    d: string | number;
    s: number;
    range: number;
}

export interface Stratagem {
    id: string;
    name: string;
    type: string;
    factionId?: string;
    detachment?: string;
    detachmentId?: string;
    cpCost: number;
    phase: GamePhase[] & "ANY";
    turn: GameTurn;
    legend: string;
    description?: string;
    conditions?: string[];
    keywords?: string[];
    faction?: string;
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

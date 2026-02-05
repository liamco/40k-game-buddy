import { Model } from "./Models";
import { Weapon } from "./Weapons";
import type { Mechanic } from "#game-engine/types/Mechanic";

// Import WargearOptionDef from parser module for use in this file
import type { WargearOptionDef as ParsedWargearOptionDef, TargetingType, ActionType, TargetingDef, ActionDef, ConstraintsDef, WeaponRef, WeaponChoice } from "../modules/Lists/ViewList/components/UnitDetailsView/WargearTab/parser/types";

// Re-export for external use
export type { TargetingType, ActionType, TargetingDef, ActionDef, ConstraintsDef, WeaponRef, WeaponChoice };
export type WargearOptionDef = ParsedWargearOptionDef;

export type AbilityType = "Core" | "Faction" | "Datasheet" | "Wargear";

export interface Ability {
    name: string;
    type: AbilityType;
    id?: string;
    legend?: string;
    factionId?: string;
    description?: string;
    parameter?: string;
    mechanics?: Mechanic[];
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

// Consolidated damaged profile data
export interface DamagedProfile {
    range: string; // Original text like "1-4"
    threshold: number; // Upper bound (e.g., 4)
    description: string; // Text description of damaged effects
    mechanics: DamagedMechanic[]; // Parsed mechanics
}

// Leader attachment conditions extracted from leaderFooter text
export interface LeaderConditions {
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

// Consolidated leader data
export interface LeaderData {
    description: string; // HTML description of leader ability (from leaderHead)
    footer: string; // HTML footer text with attachment rules
    conditions: LeaderConditions | null; // Parsed conditions
    attachableUnits: string[]; // Array of unit names this can lead
}

// Raw wargear option from source data
export interface RawWargearOption {
    datasheetId: string;
    line: number;
    button: string;
    description: string;
}

// Wargear options container (within consolidated wargear object)
export interface WargearOptionsContainer {
    raw: RawWargearOption[]; // Raw option text from source data
    parsed: WargearOptionDef[]; // Parsed option definitions
    allParsed: boolean; // True if all options were successfully parsed
}

// Wargear ability (equipment that provides bonuses rather than attack profiles)
export interface WargearAbility {
    id: string; // Unique identifier (format: {datasheetId}:{slug})
    name: string; // Display name (e.g., "Storm Shield")
    description?: string; // Ability text describing the effect
    mechanics?: Mechanic[]; // Parsed game effects for calculations
    eligibility?: EligibilityRule[]; // Which models can select this ability
}

// Default loadout structure with raw HTML and parsed weapon IDs
export interface DefaultLoadout {
    raw: string; // Raw HTML text describing default equipment
    parsed: string[]; // Weapon/ability IDs for the primary model type
}

// Valid loadout group for a specific model type
// Note: targeting has moved to weapon.eligibility - this is for loadout validation only
export interface ValidLoadoutGroup {
    modelType: string; // "any" (fallback), "all" (unit-wide), or specific type name
    items: string[][]; // Array of valid loadouts (each is array of weapon/ability IDs)
}

// Consolidated wargear data
export interface WargearData {
    defaultLoadout: DefaultLoadout; // Default equipment with raw HTML and parsed IDs
    weapons: Weapon[]; // Available weapon profiles for this unit
    abilities: WargearAbility[]; // Wargear abilities (shields, equipment bonuses, etc.)
    options: WargearOptionsContainer; // Wargear customization options
    validLoadouts: ValidLoadoutGroup[]; // Pre-computed valid loadout combinations by model type
    loadoutsParsed: boolean; // true if validLoadouts were successfully generated (validation can be applied)
}

// Consolidated supplement data
export interface SupplementData {
    key: string; // e.g., "codex", "black-templars"
    slug: string; // e.g., "codex", "black-templars" (may be empty for non-SM factions)
    name: string; // e.g., "Codex", "Black Templars"
    label: string; // e.g., "None", "Black Templars"
    isSupplement: boolean; // true if from a chapter supplement (not base codex)
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
    transport?: string;
    abilities?: Ability[];
    factionAbilityIds?: string[];
    keywords?: any[];
    models?: Model[];
    unitComposition?: any[];
    modelCosts?: number;
    path: string;
    isForgeWorld?: boolean;
    isLegends?: boolean;

    // Consolidated properties
    supplement?: SupplementData; // Consolidated supplement data
    damaged?: DamagedProfile | null; // Consolidated damaged profile data (null if no damaged profile)
    leader?: LeaderData | null; // Consolidated leader data (null if not a leader)
    wargear?: WargearData; // Consolidated wargear (weapons + options)
    leadsUnits?: DatasheetReference[]; // Units this character can lead (attach to as a leader)

    [key: string]: any; // Allow for additional properties
}

// Reference to a datasheet (used in leadsUnits array)
export interface DatasheetReference {
    id: string; // Datasheet ID
    slug: string; // Datasheet slug
}

// Reference to a leader or unit (used in leadBy and leading)
export interface LeaderReference {
    listItemId: string; // Unique list item ID - stable even when names change
    id: string; // Datasheet ID
    name: string; // Display name (may change if duplicates are added)
}

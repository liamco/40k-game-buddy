/**
 * Wargear Parser Types
 *
 * These types define the structure of parsed wargear options.
 * A WargearOptionDef is created once when a datasheet loads and cached.
 */

// ============================================================================
// TARGETING TYPES - Who can take the option
// ============================================================================

export type TargetingType =
    | "this-model" // Single model unit, or "this model" in text
    | "specific-model" // "The Sergeant's...", "The Exarch's..."
    | "n-model-specific" // "1 Battle Sister...", "2 Marines..."
    | "all-models" // "All models in this unit..."
    | "any-number" // "Any number of models..."
    | "ratio" // "For every N models..."
    | "ratio-capped" // "For every N models, up to M..."
    | "up-to-n" // "Up to N models..."
    | "each-model-type" // "Each Retributor's..."
    | "conditional" // "If this model is equipped with..."
    | "this-unit" // "This unit can be equipped..."
    | "if-unit-size" // "If this unit contains 20 models..."
    | "unknown"; // Could not parse - wargearParsed will be false

export interface TargetingDef {
    type: TargetingType;
    modelType?: string; // For specific-model, n-model-specific, each-model-type, ratio (e.g., "Terminator" in "1 Terminator's")
    count?: number; // For n-model-specific and ratio (e.g., "1" in "1 Terminator's storm bolter")
    ratio?: number; // For ratio types (e.g., "5" in "for every 5 models")
    maxPerRatio?: number; // For ratio-capped (e.g., "2" in "up to 2")
    maxTotal?: number; // For up-to-n
    condition?: TargetingCondition; // For conditional
    unitSizeThreshold?: number; // For if-unit-size
}

export interface TargetingCondition {
    type: "equipped-with" | "not-equipped-with" | "already-equipped";
    weaponName?: string;
    weaponNames?: string[]; // For "equipped with X and Y"
}

// ============================================================================
// ACTION TYPES - What the option does
// ============================================================================

export type ActionType =
    | "replace" // Replace weapon(s) with choice(s)
    | "add" // Add weapon(s) without replacing
    | "unknown"; // Could not parse

export interface ActionDef {
    type: ActionType;
    removes: WeaponRef[]; // Weapons being replaced (empty for 'add')
    adds: WeaponChoice[]; // Weapons that can be chosen
    isChoiceList: boolean; // true = pick one from list, false = single option
}

export interface WeaponRef {
    name: string;
    count: number; // Usually 1, but can be "2 bolt pistols"
}

export interface WeaponChoice {
    weapons: WeaponRef[]; // Single weapon or package (e.g., "power fist and storm bolter")
    isPackage: boolean; // true if multiple weapons come together
}

// ============================================================================
// CONSTRAINT TYPES - Additional rules
// ============================================================================

export interface ConstraintsDef {
    restrictedWeapons?: string[]; // "(that model's boltgun cannot be replaced)"
    noDuplicates?: boolean; // "cannot take duplicates"
    allowDuplicates?: boolean; // "can take duplicates"
    mustBeDifferent?: boolean; // "two different weapons"
    maxSelections?: number; // "up to two of the following"
}

// ============================================================================
// MAIN PARSED OPTION TYPE
// ============================================================================

export interface WargearOptionDef {
    line: number; // Option line from datasheet
    rawText: string; // Original text for reference/debugging
    wargearParsed: boolean; // false if targeting or action is 'unknown'
    targeting: TargetingDef;
    action: ActionDef;
    constraints: ConstraintsDef;
}

// ============================================================================
// RAW INPUT TYPE (from datasheet)
// ============================================================================

export interface RawWargearOption {
    datasheetId: string;
    line: number;
    button: string;
    description: string;
}

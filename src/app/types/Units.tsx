import { Model } from "./Models";
import { DamagedMechanic } from "./States";
import { Weapon } from "./Weapons";
import type { Mechanic } from "#game-engine/types/Mechanic";

export type AbilityType = "Core" | "Faction" | "Datasheet";

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
    abilities?: Ability[];
    factionAbilityIds?: string[];
    keywords?: any[];
    models?: Model[];
    options?: any[];
    availableWargear: Weapon[];
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

// Reference to a leader or unit (used in leadBy and leading)
export interface LeaderReference {
    listItemId: string; // Unique list item ID - stable even when names change
    id: string; // Datasheet ID
    name: string; // Display name (may change if duplicates are added)
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

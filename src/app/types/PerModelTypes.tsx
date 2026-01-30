import { DamagedMechanic } from "./States";
import { LeaderCondition } from "./Units";
import { Weapon } from "./Weapons";

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
    models?: TestModel[];
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

export interface TestModelArchetype {
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

export interface TestModel {
    archetype: TestModelArchetype;
    loadout: Weapon[];
}

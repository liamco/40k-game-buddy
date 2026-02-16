import { Detachment } from "./Detachments";
import { EngagementForceItem } from "./Engagements";
import { Datasheet } from "./Units";
import { Entity } from "../game-engine/types/Mechanic";

// Faction and Datasheet types for list management
export type FactionIndex = Omit<Faction, "datasheets">;

export interface FactionStateFlag {
    name: string;
    label: string;
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

export interface FactionAbilityInterface {
    type: FactionAbilityUIType;
    value: string;
    scope: Entity;
}

export interface FactionAbility {
    id: string;
    name: string;
    type: "Faction";
    description: string;
    legend?: string;
    mechanics?: any[];
    phase?: string[];
    interface?: FactionAbilityInterface;
}

type FactionAbilityUIType = "singleSelect" | "multiSelect";

type FactionAbilityUIOptions = EngagementForceItem[];

export interface FactionAbilityUI {
    type: FactionAbilityUIType;
    name: string;
    value: string[];
    scope: Entity;
    options: FactionAbilityUIOptions;
}

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

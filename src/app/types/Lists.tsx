import { Datasheet, LeaderReference } from "./Units";

export interface ArmyList {
    id: string;
    name: string;
    factionId: string;
    factionName: string;
    factionSlug: string;
    factionIcon?: string;
    detachmentSlug?: string;
    detachmentName?: string;
    items: ArmyListItem[];
    totalPointsCost: number;
    createdAt: number;
    updatedAt: number;
    warlordItemId?: string; // listItemId of the designated warlord
}

export type WarlordEligibility = {
    canBeWarlord: boolean;
    mustBeWarlord: boolean; // Supreme Commander units must be warlord
    reason?: string; // Why ineligible, if applicable
};

/**
 * Represents a single model instance in an army list unit.
 * Created when a unit is added to a list, stored on ArmyListItem.
 */
export interface ModelInstance {
    instanceId: string; // Unique: "{listItemId}-{modelTypeSlug}-{index}"
    modelType: string; // From unitComposition: "Tactical Sergeant", "Tactical Marine"
    modelTypeLine: number; // unitComposition line number (for stats lookup)
    loadout: string[]; // Array of weapon IDs from availableWargear
    defaultLoadout: string[]; // Original loadout at creation (for detecting customization)
}

export type ArmyListItem = Datasheet & {
    listItemId: string; // Unique ID for this list entry (allows same unit multiple times)
    quantity?: number;
    pointsCost?: number;
    leading?: LeaderReference; // Unit this leader is attached to
    leadBy?: LeaderReference[]; // Leaders attached to this unit (supports multiple)
    enhancement?: { id: string; name: string; cost?: number }; // Enhancement attached to this leader

    // Per-model weapon tracking
    modelInstances?: ModelInstance[]; // Each model with its loadout
};

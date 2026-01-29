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

export type ArmyListItem = Datasheet & {
    listItemId: string; // Unique ID for this list entry (allows same unit multiple times)
    quantity?: number;
    pointsCost?: number;
    compositionCounts?: { [line: number]: number }; // Store counts for each unitComposition line
    leading?: LeaderReference; // Unit this leader is attached to
    leadBy?: LeaderReference[]; // Leaders attached to this unit (supports multiple)
    enhancement?: { id: string; name: string; cost?: number }; // Enhancement attached to this leader
    loadoutSelections?: { [optionLine: number]: number }; // Track loadout option selections (count per option)
    loadoutWeaponChoices?: { [optionLine: number]: string[] }; // Track which weapon was chosen for each slot (for multi-choice options)
    removedWeapons?: { [weaponId: string]: boolean }; // Track removed default weapons (excluded from attack resolver)
};

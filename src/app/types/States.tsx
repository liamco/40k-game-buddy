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

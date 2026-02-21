import { Enhancement } from "./Enhancements";

export interface Stratagem {
    id: string;
    factionId: string;
    name: string;
    type: string;
    cpCost: number;
    legend: string;
    turn: "YOURS" | "OPPONENTS" | "EITHER";
    phase: string[];
    detachment: string;
    detachmentId: string | number;
    description: string;
}

export interface Detachment {
    slug: string;
    name: string;
    abilities?: any[];
    enhancements?: Enhancement[];
    stratagems?: Stratagem[];
    supplementSlug?: string; // e.g., "black-templars", "blood-angels" - used to filter datasheets by supplement
    [key: string]: any;
}

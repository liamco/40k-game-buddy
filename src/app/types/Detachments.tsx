import { Enhancement } from "./Enhancements";

export interface Detachment {
    slug: string;
    name: string;
    abilities?: any[];
    enhancements?: Enhancement[];
    supplementSlug?: string; // e.g., "black-templars", "blood-angels" - used to filter datasheets by supplement
    [key: string]: any;
}

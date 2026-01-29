import factionsIndexData from "../data/output/index.json";
import type { Faction, Datasheet, Faction, Stratagem, FactionIndex } from "../types";

// Use Vite's import.meta.glob for dynamic imports
// Note: The paths must match exactly, so we'll use a function to construct them
// Data is loaded from src/app/data/output (generated data directory)
const factionModules = import.meta.glob("../data/output/factions/*/faction.json", {
    eager: false,
    import: "default",
});

const datasheetModules = import.meta.glob("../data/output/factions/*/datasheets/*.json", {
    eager: false,
    import: "default",
});

const globalStratagemModules = import.meta.glob("../data/output/core-stratagems.json", {
    eager: false,
    import: "default",
});

const factionConfigModules = import.meta.glob("../data/mappings/*/faction-config.json", {
    eager: false,
    import: "default",
});

export interface FactionConfig {
    factionIcon?: string;
    detachmentSupplements?: Record<string, string>;
}

// Load faction data from JSON
export async function loadFactionData(slug: string): Promise<Faction | null> {
    try {
        // Construct the exact path that matches the glob pattern
        const modulePath = `../data/factions/${slug}/faction.json`;

        // Find the matching module - the key might have a different format
        const moduleKey = Object.keys(factionModules).find((key) => key.includes(`/${slug}/faction.json`));

        if (!moduleKey) {
            console.error(`Faction module not found: ${slug}`);
            return null;
        }

        const module = factionModules[moduleKey];
        if (!module) {
            console.error(`Faction module loader not found: ${slug}`);
            return null;
        }

        const data = (await module()) as Faction;

        return data;
    } catch (error) {
        console.error(`Error loading faction ${slug}:`, error);
        return null;
    }
}

// Load datasheet data from JSON
export async function loadDatasheetData(factionSlug: string, datasheetId: string): Promise<Datasheet | null> {
    try {
        // Find the matching module
        const moduleKey = Object.keys(datasheetModules).find((key) => key.includes(`/${factionSlug}/datasheets/${datasheetId}.json`));

        if (!moduleKey) {
            console.error(`Datasheet module not found: ${datasheetId}`);
            return null;
        }

        const module = datasheetModules[moduleKey];
        if (!module) {
            console.error(`Datasheet module loader not found: ${datasheetId}`);
            return null;
        }

        const data = (await module()) as Datasheet;
        return data;
    } catch (error) {
        console.error(`Error loading datasheet ${datasheetId}:`, error);
        return null;
    }
}

// Load global stratagems from JSON
export async function loadGlobalStratagemData(): Promise<Stratagem[] | null> {
    try {
        // Get the first (and only) module key from the glob
        const moduleKeys = Object.keys(globalStratagemModules);
        if (moduleKeys.length === 0) {
            console.error(`Stratagems JSON not found`);
            return null;
        }

        const moduleKey = moduleKeys[0];
        const module = globalStratagemModules[moduleKey];
        if (!module) {
            console.error(`Stratagems module loader not found`);
            return null;
        }

        const data = (await module()) as Stratagem[];

        return data;
    } catch (error) {
        console.error(`Error loading global stratagems`, error);
        return null;
    }
}

// Load detachment stratagems from JSON
export async function loadFactionStratagemData(factionSlug: string, detachmentSlug: string): Promise<Stratagem[] | null> {
    try {
        // Construct the exact path that matches the glob pattern
        const modulePath = `../data/factions/${factionSlug}/faction.json`;

        // Find the matching module - the key might have a different format
        const moduleKey = Object.keys(factionModules).find((key) => key.includes(`/${factionSlug}/faction.json`));

        if (!moduleKey) {
            console.error(`Faction module not found: ${factionSlug}`);
            return null;
        }

        const module = factionModules[moduleKey];
        if (!module) {
            console.error(`Faction module loader not found: ${factionSlug}`);
            return null;
        }

        const data = (await module()) as Faction;

        const detachment = data.detachments?.find((detachment) => detachment.slug === detachmentSlug);
        if (!detachment) {
            console.error(`Detachment not found: ${detachmentSlug}`);
            return null;
        }

        return detachment.stratagems || [];
    } catch (error) {
        console.error(`Error loading faction ${factionSlug}:`, error);
        return null;
    }
}

// Load faction config from mappings folder
export async function loadFactionConfig(slug: string): Promise<FactionConfig | null> {
    try {
        const moduleKey = Object.keys(factionConfigModules).find((key) => key.includes(`/${slug}/faction-config.json`));

        if (!moduleKey) {
            // Config file doesn't exist for this faction - that's okay
            return null;
        }

        const module = factionConfigModules[moduleKey];
        if (!module) {
            return null;
        }

        const data = (await module()) as FactionConfig;
        return data;
    } catch (error) {
        console.error(`Error loading faction config for ${slug}:`, error);
        return null;
    }
}

// Get all factions from index
export function getAllFactions(): FactionIndex[] {
    return factionsIndexData as FactionIndex[];
}

// Get faction by slug
export function getFactionBySlug(slug: string): FactionIndex | undefined {
    const factions = getAllFactions();
    return factions.find((f) => f.slug === slug);
}

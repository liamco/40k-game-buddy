import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";

import { getAllFactions, loadFactionData, loadFactionConfig, loadDatasheetData } from "../../utils/depotDataLoader";
import { getUnitById } from "../../utils/unitHelpers";
import type { Faction, FactionIndex, ArmyList, ArmyListItem, Datasheet, LoadoutConstraint, UnitWeapons, LeaderReference, LeaderCondition, UnitCombatState, Enhancement, Weapon, WarlordEligibility, ModelInstance } from "../../types";

/**
 * Result of multi-leader attachment validation
 */
export interface MultiLeaderValidationResult {
    canAttach: boolean;
    reason?: string;
    wouldReplace?: boolean; // If true, attaching would replace the existing leader(s)
}

/**
 * Validates whether a leader can attach to a unit that already has leaders attached.
 * This checks the leader's leaderConditions against the existing leaders' keywords.
 *
 * @param newLeader - The leader attempting to attach
 * @param existingLeaders - Leaders already attached to the target unit
 * @returns Validation result with canAttach boolean and optional reason
 */
export function validateMultiLeaderAttachment(newLeader: ArmyListItem, existingLeaders: ArmyListItem[]): MultiLeaderValidationResult {
    // If no existing leaders, always can attach
    if (existingLeaders.length === 0) {
        return { canAttach: true };
    }

    const leaderConditions: LeaderCondition | undefined = newLeader.leaderConditions;

    // If the new leader has no leaderConditions, it cannot join existing leaders
    if (!leaderConditions) {
        return {
            canAttach: false,
            wouldReplace: true,
            reason: `${newLeader.name} cannot join a unit that already has a leader attached`,
        };
    }

    // If allowsAnyExistingLeader is true, can always join
    if (leaderConditions.allowsAnyExistingLeader) {
        return { canAttach: true };
    }

    // Check if any existing leader has keywords matching allowedExistingLeaderKeywords
    if (leaderConditions.allowedExistingLeaderKeywords && leaderConditions.allowedExistingLeaderKeywords.length > 0) {
        const allowedKeywords = leaderConditions.allowedExistingLeaderKeywords.map((k) => k.toUpperCase());

        // Check each existing leader
        for (const existingLeader of existingLeaders) {
            // Keywords can be either strings or objects with a 'keyword' property
            const existingKeywords: string[] = (existingLeader.keywords || [])
                .map((k: string | { keyword: string }) => {
                    if (typeof k === "string") {
                        return k.toUpperCase();
                    } else if (k && typeof k === "object" && "keyword" in k) {
                        return (k.keyword || "").toUpperCase();
                    }
                    return "";
                })
                .filter((k: string) => k.length > 0);

            // Check if any of the existing leader's keywords match the allowed keywords
            const hasMatchingKeyword = allowedKeywords.some((allowed) => existingKeywords.some((existing) => existing.includes(allowed) || allowed.includes(existing)));

            if (hasMatchingKeyword) {
                return { canAttach: true };
            }
        }

        // No matching keywords found
        return {
            canAttach: false,
            wouldReplace: true,
            reason: `${newLeader.name} can only join if the existing leader has ${allowedKeywords.join(" or ")} keyword`,
        };
    }

    // No conditions allow joining
    return {
        canAttach: false,
        wouldReplace: true,
        reason: `${newLeader.name} cannot join a unit that already has a leader attached`,
    };
}

/**
 * Determines if a unit can be designated as warlord.
 * Characters can be warlords. Supreme Commanders MUST be the warlord.
 * Some units explicitly cannot be warlord (e.g., "LAST SURVIVOR" ability).
 */
export function getWarlordEligibility(unit: ArmyListItem): WarlordEligibility {
    // Check for Character keyword
    const hasCharacterKeyword = unit.keywords?.some((k) => {
        const keyword = typeof k === "string" ? k : k.keyword;
        return keyword?.toUpperCase() === "CHARACTER";
    });

    if (!hasCharacterKeyword) {
        return { canBeWarlord: false, mustBeWarlord: false, reason: "Not a Character" };
    }

    // Check for Supreme Commander ability - must be warlord
    const hasSupremeCommander = unit.abilities?.some((a) => a.name?.toUpperCase() === "SUPREME COMMANDER");

    if (hasSupremeCommander) {
        return { canBeWarlord: true, mustBeWarlord: true };
    }

    // Check for abilities that prevent being warlord (e.g., "LAST SURVIVOR")
    // Look for descriptions containing "cannot be selected as your Warlord" or similar
    const cannotBeWarlordAbility = unit.abilities?.find((a) => {
        const description = a.description?.toLowerCase() || "";
        return description.includes("cannot be selected as your warlord") || description.includes("cannot be your warlord");
    });

    if (cannotBeWarlordAbility) {
        return { canBeWarlord: false, mustBeWarlord: false, reason: cannotBeWarlordAbility.name || "Cannot be Warlord" };
    }

    return { canBeWarlord: true, mustBeWarlord: false };
}

const STORAGE_KEY = "battle-cogitator-army-lists";

// Calculate points for a single item
function calculateItemPointsHelper(item: ArmyListItem): number {
    if (!item.unitComposition || item.unitComposition.length === 0) {
        return item.modelCosts?.[0]?.cost ?? 0;
    }

    // Use modelInstances if available, otherwise fall back to unitComposition min values
    let totalModels = 0;
    if (item.modelInstances && item.modelInstances.length > 0) {
        totalModels = item.modelInstances.length;
    } else {
        item.unitComposition.forEach((comp) => {
            totalModels += comp.min ?? 0;
        });
    }

    if (item.modelCosts && Array.isArray(item.modelCosts)) {
        const validCosts = item.modelCosts.filter((cost) => cost.count !== undefined && cost.count >= totalModels);
        if (validCosts.length > 0) {
            validCosts.sort((a, b) => (a.count || 0) - (b.count || 0));
            return validCosts[0].cost;
        }
        const sortedCosts = [...item.modelCosts].filter((cost) => cost.count !== undefined).sort((a, b) => (b.count || 0) - (a.count || 0));
        if (sortedCosts.length > 0) {
            return sortedCosts[0].cost;
        }
        return item.modelCosts[0]?.cost ?? 0;
    }
    return 0;
}

// Helper to calculate total points for a list's items
function calculateListPoints(items: ArmyListItem[]): number {
    return items.reduce((total, item) => {
        const unitPoints = calculateItemPointsHelper(item);
        const enhancementPoints = item.enhancement?.cost ?? 0;
        return total + unitPoints + enhancementPoints;
    }, 0);
}

// Finalize a list update by recalculating points and updating timestamp
function finalizeList(list: ArmyList, items: ArmyListItem[]): ArmyList {
    return {
        ...list,
        items,
        totalPointsCost: calculateListPoints(items),
        updatedAt: Date.now(),
    };
}

// Helper function to extract base name (without suffix)
function getBaseName(name: string): string {
    const suffixPattern = /\s+(Primus|Secundus|Tertius|Quartus|Quintus|Septimus|Sextus|Octus|India|Juliet|Kilo|Lima|Mike|November|Oscar|Papa|Quebec|Romeo|Sierra|Tango|Uniform|Victor|Whiskey|Xray|Yankee|Zulu)$/i;
    return name.replace(suffixPattern, "").trim();
}

// Helper function to get suffix letter for index
function getSuffixLetter(index: number): string {
    const suffixes = ["Primus", "Secundus", "Tertius", "Quartus", "Quintus", "Septimus", "Sextus", "Octus", "India", "Juliet", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa", "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whiskey", "Xray", "Yankee", "Zulu"];
    return suffixes[index] || `Unit ${index + 1}`;
}

// Parse loadout HTML to extract weapon names in order
function parseLoadoutWeapons(loadout: string): string[] {
    if (!loadout) return [];
    const text = loadout.replace(/<[^>]*>/g, " ").trim();
    const match = text.match(/equipped with:\s*(.+?)\.?$/i);
    if (!match) return [];
    return match[1]
        .split(";")
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length > 0);
}

/**
 * Extract model type name from unitComposition description.
 * Examples:
 * - "1 Tactical Sergeant" -> "Tactical Sergeant"
 * - "4-9 Tactical Marines" -> "Tactical Marine" (singularized)
 * - "1 Relic Terminator Sergeant" -> "Relic Terminator Sergeant"
 */
function extractModelTypeFromDescription(description: string): string {
    // Strip HTML tags
    const text = description.replace(/<[^>]*>/g, "").trim();

    // Remove leading number/range pattern: "1 ", "4-9 ", "0-1 ", etc.
    const withoutCount = text.replace(/^\d+(-\d+)?\s+/, "");

    // Singularize if ends with 's' and is plural form
    // Common 40k patterns: Marines -> Marine, Terminators -> Terminator, Bikers -> Biker
    let modelType = withoutCount;
    if (modelType.endsWith("ies")) {
        // e.g., "Uries" -> "Ury" (rare but handle it)
        modelType = modelType.slice(0, -3) + "y";
    } else if (modelType.endsWith("s") && !modelType.endsWith("ss")) {
        // Remove trailing 's' for plurals, but not for words ending in 'ss' (e.g., "Lass")
        modelType = modelType.slice(0, -1);
    }

    return modelType;
}

/**
 * Create a URL-friendly slug from model type.
 */
function slugifyModelType(modelType: string): string {
    return modelType
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

/**
 * Parse loadout string to extract default weapons per model type.
 * Returns a Map where keys are model type names and values are arrays of weapon names.
 *
 * Handles patterns like:
 * - "Every model is equipped with: bolt pistol; boltgun."
 * - "The Sergeant is equipped with: plasma pistol. Every Marine is equipped with: boltgun."
 * - "The Biker Sergeant and every Space Marine Biker is equipped with: bolt pistol."
 */
function parseLoadoutByModelType(loadout: string, unitComposition: any[]): Map<string, string[]> {
    const result = new Map<string, string[]>();

    if (!loadout || !unitComposition?.length) {
        return result;
    }

    // Get all model types from unit composition
    const modelTypes = unitComposition.map((comp) => extractModelTypeFromDescription(comp.description || ""));

    // Split loadout by <br> to handle multiple sections
    const sections = loadout.split(/<br\s*\/?>/i).filter((s) => s.trim());

    for (const section of sections) {
        // Strip HTML and extract the pattern
        const text = section.replace(/<[^>]*>/g, " ").trim();

        // Extract "equipped with:" weapons
        const equipMatch = text.match(/equipped with:\s*(.+?)\.?$/i);
        if (!equipMatch) continue;

        const weapons = equipMatch[1]
            .split(";")
            .map((w) => w.trim().toLowerCase())
            .filter((w) => w.length > 0);

        // Determine which model types this applies to
        const lowerText = text.toLowerCase();

        if (lowerText.includes("every model") || lowerText.includes("this model")) {
            // Applies to all model types
            for (const modelType of modelTypes) {
                result.set(modelType, [...(result.get(modelType) || []), ...weapons]);
            }
        } else {
            // Check which model types are mentioned
            for (const modelType of modelTypes) {
                const lowerModelType = modelType.toLowerCase();
                // Check for exact match or "and every X" pattern
                if (lowerText.includes(lowerModelType) || lowerText.includes(`every ${lowerModelType}`)) {
                    result.set(modelType, [...(result.get(modelType) || []), ...weapons]);
                }
            }

            // If no specific match found but section starts with "The X", try to match first model type (usually sergeant)
            if (result.size === 0 && lowerText.startsWith("the ")) {
                const firstModelType = modelTypes[0];
                if (firstModelType) {
                    result.set(firstModelType, weapons);
                }
            }
        }
    }

    // If we still have model types with no loadout, give them the default from first section
    const defaultWeapons = parseLoadoutWeapons(loadout);
    for (const modelType of modelTypes) {
        if (!result.has(modelType) && defaultWeapons.length > 0) {
            result.set(modelType, defaultWeapons);
        }
    }

    return result;
}

/**
 * Find weapon ID from availableWargear by name (case-insensitive, fuzzy).
 */
function findWeaponIdByName(availableWargear: Weapon[], weaponName: string): string | null {
    const nameLower = weaponName.toLowerCase();
    const weapon = availableWargear.find((w) => {
        const wNameLower = w.name.toLowerCase();
        return wNameLower === nameLower || wNameLower.includes(nameLower) || nameLower.includes(wNameLower);
    });
    return weapon?.id ?? null;
}

/**
 * Generate default model instances for a unit based on its composition.
 * Each model gets the appropriate default loadout for its type.
 */
function generateDefaultModelInstances(unit: ArmyListItem, listItemId: string): ModelInstance[] {
    const instances: ModelInstance[] = [];

    if (!unit.unitComposition || !unit.availableWargear) {
        return instances;
    }

    // Parse default loadouts per model type
    const loadoutByType = parseLoadoutByModelType(unit.loadout || "", unit.unitComposition);

    // Generate instances for each composition line
    for (const comp of unit.unitComposition) {
        const line = comp.line || 1;
        const modelType = extractModelTypeFromDescription(comp.description || "");
        const modelTypeSlug = slugifyModelType(modelType);

        // Get count - use min as default
        const count = comp.min || 1;

        // Get default weapon names for this model type
        const defaultWeaponNames = loadoutByType.get(modelType) || [];

        // Convert weapon names to IDs
        const defaultLoadout: string[] = [];
        for (const weaponName of defaultWeaponNames) {
            const weaponId = findWeaponIdByName(unit.availableWargear, weaponName);
            if (weaponId) {
                defaultLoadout.push(weaponId);
            }
        }

        // Create instances
        for (let i = 0; i < count; i++) {
            instances.push({
                instanceId: `${listItemId}-${modelTypeSlug}-${i}`,
                modelType,
                modelTypeLine: line,
                loadout: [...defaultLoadout],
                defaultLoadout: [...defaultLoadout],
            });
        }
    }

    return instances;
}

/**
 * Resolve the active wargear for a unit based on modelInstances.
 * Returns a flat array of Weapon objects that the unit currently has equipped.
 * This is used when creating EngagementForceItems to pre-compute the active weapons.
 */
export function resolveUnitWargear(unit: ArmyListItem): Weapon[] {
    if (!unit.availableWargear) {
        return [];
    }

    // Use modelInstances if available
    if (unit.modelInstances && unit.modelInstances.length > 0) {
        const weaponIds = new Set<string>();
        unit.modelInstances.forEach((m) => m.loadout.forEach((id) => weaponIds.add(id)));

        return Array.from(weaponIds)
            .map((id) => unit.availableWargear!.find((w) => w.id === id))
            .filter((w): w is Weapon => w !== undefined);
    }

    // Fallback: return default weapons from loadout string
    const defaultWeaponNames = parseLoadoutWeapons(unit.loadout || "").map((w) => w.toLowerCase());

    return unit.availableWargear.filter((weapon) => {
        const weaponNameLower = weapon.name.toLowerCase();
        return defaultWeaponNames.some((defaultName) => weaponNameLower.includes(defaultName) || defaultName.includes(weaponNameLower));
    });
}

// Parse option description to extract constraint information
function parseOptionConstraint(description: string, totalModels: number): LoadoutConstraint {
    const normalized = description.replace(/<[^>]*>/g, " ").trim();

    const ratioMatch = normalized.match(/for every (\d+) models/i);
    if (ratioMatch) {
        const ratio = parseInt(ratioMatch[1], 10);
        return { type: "ratio", ratio, maxSelections: Math.floor(totalModels / ratio) };
    }

    const thresholdMatch = normalized.match(/if this unit contains (\d+) models/i);
    if (thresholdMatch) {
        const threshold = parseInt(thresholdMatch[1], 10);
        return { type: "threshold", threshold, maxSelections: totalModels >= threshold ? 1 : 0 };
    }

    const countMatch = normalized.match(/^(\d+)\s+\w+(?:'s)?.*can be replaced/i);
    if (countMatch) {
        return { type: "simple", maxSelections: parseInt(countMatch[1], 10) };
    }

    if (/this model's.*can be replaced/i.test(normalized)) {
        return { type: "simple", maxSelections: 1 };
    }

    if (/can be equipped with/i.test(normalized)) {
        return { type: "addition", maxSelections: 1 };
    }

    return { type: "simple", maxSelections: 1 };
}

// Parse weapons from an option description (e.g., "1 assault cannon" -> ["assault cannon"])
function parseWeaponsFromOption(description: string): string[] {
    const weapons: string[] = [];

    // First, check if description contains <li> list items - parse these before stripping HTML
    // This preserves the semantic structure of "one of the following" lists
    if (description.includes("<li>")) {
        const liMatches = description.matchAll(/<li>(.+?)<\/li>/gi);
        for (const match of liMatches) {
            // Strip any nested HTML from the list item content
            const itemText = match[1].replace(/<[^>]*>/g, " ").trim();
            // Parse weapons from this list item (may contain multiple weapons joined by "and")
            const itemWeapons = parseWeaponsFromText(itemText);
            weapons.push(...itemWeapons);
        }
    }

    // If we found weapons from <li> tags, return them
    if (weapons.length > 0) {
        return [...new Set(weapons)];
    }

    // Otherwise, fall back to parsing the plain text after stripping HTML
    const normalized = description.replace(/<[^>]*>/g, " ").trim();
    const plainTextWeapons = parseWeaponsFromText(normalized);
    return [...new Set(plainTextWeapons)];
}

// Helper to parse weapon names from plain text (no HTML)
function parseWeaponsFromText(text: string): string[] {
    const weapons: string[] = [];

    // Match patterns like "1 assault cannon", "1 heavy flamer", etc.
    // Use word boundary or common delimiters to find weapon boundaries
    const weaponMatches = text.matchAll(/(\d+)\s+([a-z][a-z\s-]+?)(?=\.|,|;|$|\)|\*|and\s+\d)/gi);
    for (const match of weaponMatches) {
        let weaponName = match[2].trim();
        // Remove trailing punctuation or asterisks
        weaponName = weaponName.replace(/[\.\*]+$/, "").trim();
        if (weaponName && weaponName.length > 2 && !weaponName.match(/^(model|unit|this)/i)) {
            weapons.push(weaponName);
        }
    }

    return weapons;
}

// Parse option to determine what weapons are replaced and what are added
function parseOptionWeaponChanges(description: string): { replacesWeapons: string[]; addsWeapons: string[] } {
    // Create a normalized version for pattern matching, but keep original for weapon extraction
    const normalizedForMatching = description
        .replace(/<[^>]*>/g, " ")
        .trim()
        .toLowerCase();

    const replacesWeapons: string[] = [];
    const addsWeapons: string[] = [];

    // Pattern: "X can be replaced with Y"
    const replaceMatch = normalizedForMatching.match(/(.+?)\s+can be replaced with\s+(.+)/i);
    if (replaceMatch) {
        // Extract what's being replaced
        let replacedPart = replaceMatch[1];

        // Handle "This model's X" pattern - strip the prefix
        // Matches: "this model's", "this models", "model's", "models" (handles any apostrophe variant)
        replacedPart = replacedPart.replace(/^(this\s+)?model\W?s?\s+/i, "");

        // Handle patterns like "1 heavy flamer" or "heavy flamer and chainsword"
        const replacedMatches = replacedPart.matchAll(/(\d+\s+)?([a-z][a-z\s-]+?)(?:\s+and\s+|$)/gi);
        let foundMatch = false;
        for (const match of replacedMatches) {
            const weaponName = match[2]?.trim();
            if (weaponName && weaponName.length > 2) {
                replacesWeapons.push(weaponName);
                foundMatch = true;
            }
        }

        // If regex didn't find anything, just use the cleaned replacedPart directly
        if (!foundMatch && replacedPart.trim().length > 2) {
            // Remove leading numbers like "1 " or "2 "
            const cleanedName = replacedPart.replace(/^\d+\s+/, "").trim();
            if (cleanedName.length > 2) {
                replacesWeapons.push(cleanedName);
            }
        }

        // Extract what's being added - use original description to preserve <li> tags
        // Find the portion after "can be replaced with" in the original HTML
        const replaceIndex = description.toLowerCase().indexOf("can be replaced with");
        if (replaceIndex !== -1) {
            const addedPart = description.substring(replaceIndex + "can be replaced with".length);
            const addedWeapons = parseWeaponsFromOption(addedPart);
            addsWeapons.push(...addedWeapons);
        }
    }

    // Pattern: "can be equipped with X" (addition, no replacement)
    const equipMatch = normalizedForMatching.match(/can be equipped with\s+(.+)/i);
    if (equipMatch && !replaceMatch) {
        // Use original description to preserve <li> tags
        const equipIndex = description.toLowerCase().indexOf("can be equipped with");
        if (equipIndex !== -1) {
            const addedPart = description.substring(equipIndex + "can be equipped with".length);
            const addedWeapons = parseWeaponsFromOption(addedPart);
            addsWeapons.push(...addedWeapons);
        }
    }

    return {
        replacesWeapons: [...new Set(replacesWeapons)],
        addsWeapons: [...new Set(addsWeapons)],
    };
}

interface ListManagerContextType {
    // Lists state
    lists: ArmyList[];
    setLists: React.Dispatch<React.SetStateAction<ArmyList[]>>;
    listsLoaded: boolean;

    // Faction data
    factions: FactionIndex[];
    factionData: Faction | null;
    loadFactionDataBySlug: (slug: string) => Promise<void>;

    // List operations
    createList: (name: string, faction: FactionIndex, detachmentSlug?: string, detachmentName?: string) => Promise<ArmyList>;
    deleteList: (listId: string) => void;
    getListById: (listId: string) => ArmyList | undefined;

    // Item operations
    addDatasheetToList: (list: ArmyList, datasheet: Datasheet) => Promise<ArmyList>;
    removeItemFromList: (list: ArmyList, itemId: string) => ArmyList;
    updateListItem: (list: ArmyList, itemId: string, updates: Partial<ArmyListItem>) => ArmyList;
    updateItemCombatState: (listId: string, itemId: string, combatState: Partial<UnitCombatState>) => void;

    // Model instance operations
    addModelInstance: (list: ArmyList, unitId: string, compositionLine: number) => ArmyList;
    removeModelInstance: (list: ArmyList, unitId: string, compositionLine: number) => ArmyList;
    getModelCountForLine: (unit: ArmyListItem, line: number) => number;
    updateModelLoadout: (list: ArmyList, unitId: string, instanceId: string, newLoadout: string[], optionSelections?: Record<number, string>) => ArmyList;
    updateAllModelLoadouts: (list: ArmyList, unitId: string, loadoutUpdater: (instance: ModelInstance) => string[]) => ArmyList;
    updateUnitWideSelection: (list: ArmyList, unitId: string, optionLine: number, newWeaponId: string, oldWeaponId: string) => ArmyList;

    // Attachment operations
    attachLeaderToUnit: (list: ArmyList, leaderItemId: string, targetUnitItemId: string, forceReplace?: boolean) => ArmyList;
    detachLeaderFromUnit: (list: ArmyList, leaderItemId: string) => ArmyList;
    attachEnhancementToLeader: (list: ArmyList, leaderItemId: string, enhancement: { id: string; name: string; cost?: number }) => ArmyList;
    canAttachLeaderToUnit: (list: ArmyList, leaderItemId: string, targetUnitItemId: string) => MultiLeaderValidationResult;

    // Helper functions
    calculateItemPoints: (item: ArmyListItem) => number;
    calculateTotalModels: (item: ArmyListItem) => number;
    calculateListTotalPoints: (item: ArmyList) => number;
    parseLoadoutWeapons: (loadout: string) => string[];
    parseOptionConstraint: (description: string, totalModels: number) => LoadoutConstraint;

    // Enhancement helpers
    getDetachmentEnhancements: (list: ArmyList, unit: ArmyListItem) => Enhancement[];
    getUsedEnhancements: (list: ArmyList, excludeItemId?: string) => Map<string, string>;

    // Wargear helpers
    getUnitWeapons: (unit: ArmyListItem) => UnitWeapons;
    getDefaultLoadout: (unit: ArmyListItem) => string[];

    // Warlord helpers
    setWarlord: (list: ArmyList, itemId: string | null) => ArmyList;
    getWarlord: (list: ArmyList) => ArmyListItem | undefined;
    getEligibleWarlords: (list: ArmyList) => ArmyListItem[];
}

const ListManagerContext = createContext<ListManagerContextType | null>(null);

export function useListManager() {
    const context = useContext(ListManagerContext);
    if (!context) {
        throw new Error("useListManager must be used within a ListManagerProvider");
    }
    return context;
}

interface ListManagerProviderProps {
    children: ReactNode;
}

export function ListManagerProvider({ children }: ListManagerProviderProps) {
    const [lists, setLists] = useState<ArmyList[]>([]);
    const [listsLoaded, setListsLoaded] = useState(false);
    const [factionData, setFactionData] = useState<Faction | null>(null);

    const factions = useMemo(() => getAllFactions(), []);

    // Load lists from localStorage on mount (with migrations)
    useEffect(() => {
        async function loadAndMigrateLists() {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const parsedLists = JSON.parse(stored);

                    // Migrate lists with async datasheet refresh
                    const migratedLists = await Promise.all(
                        parsedLists.map(async (list: ArmyList) => {
                            // First pass: basic migrations
                            let migratedItems = await Promise.all(
                                list.items.map(async (item: ArmyListItem) => {
                                    let migratedItem = { ...item };

                                    // Migration 1: Convert leadBy from object to array format
                                    if (migratedItem.leadBy && !Array.isArray(migratedItem.leadBy)) {
                                        migratedItem.leadBy = [migratedItem.leadBy as unknown as LeaderReference];
                                    }

                                    // Migration 4: Generate modelInstances if missing
                                    if (!migratedItem.modelInstances) {
                                        migratedItem.modelInstances = generateDefaultModelInstances(migratedItem, migratedItem.listItemId);
                                    }

                                    // Always refresh key fields from source datasheet
                                    // This ensures data stays in sync if datasheet files are updated
                                    try {
                                        const freshDatasheet = await loadDatasheetData(list.factionSlug, migratedItem.id);
                                        if (freshDatasheet) {
                                            migratedItem.leaderConditions = freshDatasheet.leaderConditions;
                                            migratedItem.abilities = freshDatasheet.abilities;
                                            migratedItem.leaders = freshDatasheet.leaders;
                                        }
                                    } catch (err) {
                                        console.warn(`Failed to refresh datasheet ${migratedItem.id}:`, err);
                                    }

                                    return migratedItem;
                                })
                            );

                            // Second pass: Migration 2 - Add listItemId to LeaderReference objects
                            // This needs to happen after all items are loaded so we can look up listItemIds
                            migratedItems = migratedItems.map((item) => {
                                let migratedItem = { ...item };

                                // Migrate leading reference
                                if (migratedItem.leading && !migratedItem.leading.listItemId) {
                                    const targetItem = migratedItems.find((i) => i.id === migratedItem.leading?.id && i.name === migratedItem.leading?.name);
                                    if (targetItem) {
                                        migratedItem.leading = {
                                            listItemId: targetItem.listItemId,
                                            id: migratedItem.leading.id,
                                            name: migratedItem.leading.name,
                                        };
                                    } else {
                                        // Target not found, clear the invalid reference
                                        delete migratedItem.leading;
                                    }
                                }

                                // Migrate leadBy references
                                if (migratedItem.leadBy && migratedItem.leadBy.length > 0) {
                                    const migratedLeadBy = migratedItem.leadBy
                                        .map((ref) => {
                                            if (ref.listItemId) return ref; // Already migrated
                                            const leaderItem = migratedItems.find((i) => i.id === ref.id && i.name === ref.name);
                                            if (leaderItem) {
                                                return {
                                                    listItemId: leaderItem.listItemId,
                                                    id: ref.id,
                                                    name: ref.name,
                                                };
                                            }
                                            return null; // Leader not found, remove invalid reference
                                        })
                                        .filter((ref): ref is LeaderReference => ref !== null);

                                    if (migratedLeadBy.length > 0) {
                                        migratedItem.leadBy = migratedLeadBy;
                                    } else {
                                        delete migratedItem.leadBy;
                                    }
                                }

                                return migratedItem;
                            });

                            // Migration 3: Add totalPointsCost if missing
                            const totalPointsCost = list.totalPointsCost ?? calculateListPoints(migratedItems);

                            return { ...list, items: migratedItems, totalPointsCost };
                        })
                    );

                    setLists(migratedLists);
                } catch (error) {
                    console.error("Error loading lists:", error);
                }
            }
            setListsLoaded(true);
        }

        loadAndMigrateLists();
    }, []);

    // Save lists to localStorage whenever they change (only after initial load)
    useEffect(() => {
        if (!listsLoaded) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
        window.dispatchEvent(new Event("listsUpdated"));
    }, [lists, listsLoaded]);

    const loadFactionDataBySlug = useCallback(async (slug: string) => {
        const data = await loadFactionData(slug);
        if (data) {
            setFactionData(data);
        }
    }, []);

    const getListById = useCallback(
        (listId: string) => {
            return lists.find((l) => l.id === listId);
        },
        [lists]
    );

    const createList = useCallback(async (name: string, faction: FactionIndex, detachmentSlug?: string, detachmentName?: string): Promise<ArmyList> => {
        // Load faction config to check for faction icon
        const factionConfig = await loadFactionConfig(faction.slug);

        const newList: ArmyList = {
            id: Date.now().toString(),
            name: name.trim(),
            factionId: faction.id,
            factionName: faction.name,
            factionSlug: faction.slug,
            factionIcon: factionConfig?.factionIcon,
            detachmentSlug,
            detachmentName,
            items: [],
            totalPointsCost: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setLists((prev) => [...prev, newList]);
        return newList;
    }, []);

    const deleteList = useCallback((listId: string) => {
        setLists((prev) => prev.filter((l) => l.id !== listId));
    }, []);

    const calculateTotalModels = useCallback((item: ArmyListItem): number => {
        // Count from modelInstances
        if (item.modelInstances && item.modelInstances.length > 0) {
            return item.modelInstances.length;
        }

        // Fallback to unitComposition min values
        if (!item.unitComposition || item.unitComposition.length === 0) {
            return 1;
        }
        let total = 0;
        item.unitComposition.forEach((comp) => {
            if (comp.description === "OR") return;
            total += comp.min ?? 0;
        });
        return total;
    }, []);

    const calculateListTotalPoints = useCallback((list: ArmyList | undefined): number => {
        if (!list) return 0;
        return calculateListPoints(list.items);
    }, []);

    const calculateItemPoints = useCallback((item: ArmyListItem): number => {
        return calculateItemPointsHelper(item);
    }, []);

    const addDatasheetToList = useCallback(async (list: ArmyList, datasheet: Datasheet): Promise<ArmyList> => {
        const fullDatasheet = await loadDatasheetData(list.factionSlug, datasheet.id);
        if (!fullDatasheet) {
            console.error("Failed to load full datasheet data");
            return list;
        }

        const baseName = getBaseName(fullDatasheet.name);
        const duplicateItems = list.items.filter((item) => getBaseName(item.name) === baseName);

        let updatedItems = [...list.items];

        if (duplicateItems.length > 0) {
            // Build a map of listItemId -> new name for items being renamed
            const renameMap = new Map<string, string>();
            duplicateItems.forEach((dup, index) => {
                const itemBaseName = getBaseName(dup.name);
                renameMap.set(dup.listItemId, `${itemBaseName} ${getSuffixLetter(index)}`);
            });

            updatedItems = updatedItems.map((item) => {
                let updatedItem = { ...item };

                // Rename this item if it's a duplicate
                const newName = renameMap.get(item.listItemId);
                if (newName) {
                    updatedItem.name = newName;
                }

                // Update leading reference if the target was renamed
                if (updatedItem.leading && renameMap.has(updatedItem.leading.listItemId)) {
                    updatedItem.leading = {
                        ...updatedItem.leading,
                        name: renameMap.get(updatedItem.leading.listItemId)!,
                    };
                }

                // Update leadBy references if any leaders were renamed
                if (updatedItem.leadBy && updatedItem.leadBy.length > 0) {
                    updatedItem.leadBy = updatedItem.leadBy.map((ref) => {
                        if (renameMap.has(ref.listItemId)) {
                            return { ...ref, name: renameMap.get(ref.listItemId)! };
                        }
                        return ref;
                    });
                }

                return updatedItem;
            });

            const newSuffixIndex = duplicateItems.length;
            const listItemId = `${datasheet.id}-${Date.now()}`;

            // Create a temporary item to generate model instances
            const tempItem: ArmyListItem = {
                ...fullDatasheet,
                name: `${baseName} ${getSuffixLetter(newSuffixIndex)}`,
                listItemId,
                pointsCost: datasheet.modelCosts,
            };

            const newItem: ArmyListItem = {
                ...tempItem,
                modelInstances: generateDefaultModelInstances(tempItem, listItemId),
            };
            updatedItems.push(newItem);
        } else {
            const listItemId = `${datasheet.id}-${Date.now()}`;

            // Create a temporary item to generate model instances
            const tempItem: ArmyListItem = {
                ...fullDatasheet,
                listItemId,
                pointsCost: datasheet.modelCosts,
            };

            const newItem: ArmyListItem = {
                ...tempItem,
                modelInstances: generateDefaultModelInstances(tempItem, listItemId),
            };
            updatedItems.push(newItem);
        }

        let updatedList = finalizeList(list, updatedItems);

        // Auto-assign warlord for Supreme Commander units
        const newItem = updatedItems[updatedItems.length - 1];
        const eligibility = getWarlordEligibility(newItem);
        if (eligibility.mustBeWarlord) {
            updatedList = { ...updatedList, warlordItemId: newItem.listItemId };
        }

        setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
        return updatedList;
    }, []);

    const removeItemFromList = useCallback((list: ArmyList, itemId: string): ArmyList => {
        const itemToRemove = getUnitById(list.items, itemId);
        if (!itemToRemove) return list;

        let updatedItems = list.items.map((item) => {
            // If removed item was a leader, remove it from the target unit's leadBy array
            if (itemToRemove.leading) {
                if (item.listItemId === itemToRemove.leading.listItemId) {
                    const newLeadBy = (item.leadBy || []).filter((l) => l.listItemId !== itemToRemove.listItemId);
                    if (newLeadBy.length === 0) {
                        const { leadBy, ...rest } = item;
                        return rest;
                    }
                    return { ...item, leadBy: newLeadBy };
                }
            }
            // If removed item had leaders attached, remove leading from those leaders
            if (itemToRemove.leadBy && itemToRemove.leadBy.length > 0) {
                const isLeaderOfRemovedItem = itemToRemove.leadBy.some((l) => l.listItemId === item.listItemId);
                if (isLeaderOfRemovedItem) {
                    const { leading, ...rest } = item;
                    return rest;
                }
            }
            return item;
        });

        updatedItems = updatedItems.filter((item) => item.listItemId !== itemId);

        let updatedList = finalizeList(list, updatedItems);

        // Clear warlord if the removed item was the warlord
        if (list.warlordItemId === itemId) {
            updatedList = { ...updatedList, warlordItemId: undefined };
        }

        setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
        return updatedList;
    }, []);

    const updateListItem = useCallback((list: ArmyList, itemId: string, updates: Partial<ArmyListItem>): ArmyList => {
        const updatedItems = list.items.map((item) => (item.listItemId === itemId ? { ...item, ...updates } : item));
        const updatedList = finalizeList(list, updatedItems);
        setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
        return updatedList;
    }, []);

    const updateItemCombatState = useCallback((listId: string, itemId: string, combatStateUpdates: Partial<UnitCombatState>) => {
        setLists((prev) =>
            prev.map((list) => {
                if (list.id !== listId) return list;
                const updatedItems = list.items.map((item) => {
                    if (item.listItemId !== itemId) return item;
                    const existingCombatState = item.combatState || {};
                    return {
                        ...item,
                        combatState: { ...existingCombatState, ...combatStateUpdates },
                    };
                });
                // Combat state doesn't affect points, but use finalizeList for consistency
                return finalizeList(list, updatedItems);
            })
        );
    }, []);

    // Get model count for a specific composition line
    const getModelCountForLine = useCallback((unit: ArmyListItem, line: number): number => {
        // Count from modelInstances
        if (unit.modelInstances && unit.modelInstances.length > 0) {
            return unit.modelInstances.filter((m) => m.modelTypeLine === line).length;
        }
        // Fallback to unitComposition min values
        const comp = unit.unitComposition?.find((c) => (c.line || 1) === line);
        return comp?.min ?? 0;
    }, []);

    // Add a model instance to a unit
    const addModelInstance = useCallback(
        (list: ArmyList, unitId: string, compositionLine: number): ArmyList => {
            const unit = getUnitById(list.items, unitId);
            if (!unit) return list;

            const comp = unit.unitComposition?.find((c) => (c.line || 1) === compositionLine);
            if (!comp) return list;

            const currentCount = getModelCountForLine(unit, compositionLine);
            const max = comp.max ?? 999;
            if (currentCount >= max) return list; // At max already

            const modelType = extractModelTypeFromDescription(comp.description);
            const defaultLoadout = getDefaultLoadoutForModelType(unit, modelType);
            const index = currentCount;

            const newInstance: ModelInstance = {
                instanceId: `${unit.listItemId}-${slugifyModelType(modelType)}-${index}`,
                modelType,
                modelTypeLine: compositionLine,
                loadout: defaultLoadout,
                defaultLoadout: [...defaultLoadout],
            };

            const updatedUnit: ArmyListItem = {
                ...unit,
                modelInstances: [...(unit.modelInstances ?? []), newInstance],
            };

            const updatedItems = list.items.map((item) => (item.listItemId === unitId ? updatedUnit : item));
            const updatedList = finalizeList(list, updatedItems);
            setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
            return updatedList;
        },
        [getModelCountForLine]
    );

    // Remove a model instance from a unit (removes last of that type)
    const removeModelInstance = useCallback(
        (list: ArmyList, unitId: string, compositionLine: number): ArmyList => {
            const unit = getUnitById(list.items, unitId);
            if (!unit || !unit.modelInstances) return list;

            const comp = unit.unitComposition?.find((c) => (c.line || 1) === compositionLine);
            if (!comp) return list;

            const currentCount = getModelCountForLine(unit, compositionLine);
            const min = comp.min ?? 0;
            if (currentCount <= min) return list; // At min already

            // Find and remove the last instance of this model type
            const instances = [...unit.modelInstances];
            const lastIndex = instances.findLastIndex((m) => m.modelTypeLine === compositionLine);

            if (lastIndex === -1) return list;

            instances.splice(lastIndex, 1);

            const updatedUnit: ArmyListItem = {
                ...unit,
                modelInstances: instances,
            };

            const updatedItems = list.items.map((item) => (item.listItemId === unitId ? updatedUnit : item));
            const updatedList = finalizeList(list, updatedItems);
            setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
            return updatedList;
        },
        [getModelCountForLine]
    );

    // Update a specific model's loadout
    const updateModelLoadout = useCallback((list: ArmyList, unitId: string, instanceId: string, newLoadout: string[], optionSelections?: Record<number, string>): ArmyList => {
        const unit = getUnitById(list.items, unitId);
        if (!unit || !unit.modelInstances) return list;

        const updatedInstances = unit.modelInstances.map((instance) => {
            if (instance.instanceId !== instanceId) return instance;
            const updated = { ...instance, loadout: newLoadout };
            if (optionSelections !== undefined) {
                updated.optionSelections = optionSelections;
            }
            return updated;
        });

        const updatedUnit: ArmyListItem = {
            ...unit,
            modelInstances: updatedInstances,
        };

        const updatedItems = list.items.map((item) => (item.listItemId === unitId ? updatedUnit : item));
        const updatedList = finalizeList(list, updatedItems);
        setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
        return updatedList;
    }, []);

    // Update all model loadouts in a unit at once (avoids race conditions from multiple updateModelLoadout calls)
    const updateAllModelLoadouts = useCallback((list: ArmyList, unitId: string, loadoutUpdater: (instance: ModelInstance) => string[]): ArmyList => {
        const unit = getUnitById(list.items, unitId);
        if (!unit || !unit.modelInstances) return list;

        const updatedInstances = unit.modelInstances.map((instance) => ({
            ...instance,
            loadout: loadoutUpdater(instance),
        }));

        const updatedUnit: ArmyListItem = {
            ...unit,
            modelInstances: updatedInstances,
        };

        const updatedItems = list.items.map((item) => (item.listItemId === unitId ? updatedUnit : item));
        const updatedList = finalizeList(list, updatedItems);
        setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
        return updatedList;
    }, []);

    // Update unit-wide selection (for "All models in this unit" options)
    // This updates all models that don't have a per-model ratio override
    const updateUnitWideSelection = useCallback((list: ArmyList, unitId: string, optionLine: number, newWeaponId: string, oldWeaponId: string): ArmyList => {
        const unit = getUnitById(list.items, unitId);
        if (!unit || !unit.modelInstances) return list;

        // Update unitWideSelections
        const newUnitWideSelections = { ...(unit.unitWideSelections || {}) };
        newUnitWideSelections[optionLine] = newWeaponId;

        // Update each model that doesn't have a per-model ratio override
        const updatedInstances = unit.modelInstances.map((instance) => {
            // Check if model has a per-model option selection that overrides the unit-wide weapon
            // (i.e., they've selected a ratio option like strangleweb instead of the unit-wide default)
            const hasRatioOverride =
                instance.optionSelections &&
                Object.entries(instance.optionSelections).some(([line, selectedId]) => {
                    // Skip the unit-wide option line itself
                    if (parseInt(line, 10) === optionLine) return false;
                    // If they've selected something other than the old unit-wide weapon, they have an override
                    return selectedId !== oldWeaponId && selectedId !== newWeaponId;
                });

            if (hasRatioOverride) {
                // Keep existing loadout - model has a ratio option selected
                return instance;
            }

            // Replace old weapon with new in loadout
            const newLoadout = instance.loadout.map((id) => (id === oldWeaponId ? newWeaponId : id));

            return { ...instance, loadout: newLoadout };
        });

        const updatedUnit: ArmyListItem = {
            ...unit,
            unitWideSelections: newUnitWideSelections,
            modelInstances: updatedInstances,
        };

        const updatedItems = list.items.map((item) => (item.listItemId === unitId ? updatedUnit : item));
        const updatedList = finalizeList(list, updatedItems);
        setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
        return updatedList;
    }, []);

    // Helper to get default loadout for a model type
    function getDefaultLoadoutForModelType(unit: ArmyListItem, modelType: string): string[] {
        if (!unit.loadout || !unit.availableWargear) return [];

        const loadoutByType = parseLoadoutByModelType(unit.loadout, unit.unitComposition || []);
        const weaponNames = loadoutByType.get(modelType) || loadoutByType.get("Every model") || [];

        return weaponNames.map((name) => findWeaponIdByName(unit.availableWargear!, name)).filter((id): id is string => id !== null);
    }

    // Validate if a leader can attach to a unit (considering existing leaders)
    const canAttachLeaderToUnit = useCallback((list: ArmyList, leaderItemId: string, targetUnitItemId: string): MultiLeaderValidationResult => {
        const leaderItem = getUnitById(list.items, leaderItemId);
        const targetUnitItem = getUnitById(list.items, targetUnitItemId);

        if (!leaderItem || !targetUnitItem) {
            return { canAttach: false, reason: "Leader or target unit not found" };
        }

        // Get existing leaders attached to the target unit
        const existingLeaderRefs = targetUnitItem.leadBy || [];
        const existingLeaders = existingLeaderRefs.map((ref) => getUnitById(list.items, ref.listItemId)).filter((item): item is ArmyListItem => item !== undefined);

        return validateMultiLeaderAttachment(leaderItem, existingLeaders);
    }, []);

    const attachLeaderToUnit = useCallback((list: ArmyList, leaderItemId: string, targetUnitItemId: string, forceReplace: boolean = false): ArmyList => {
        const leaderItem = getUnitById(list.items, leaderItemId);
        const targetUnitItem = getUnitById(list.items, targetUnitItemId);
        if (!leaderItem || !targetUnitItem) return list;

        // Get existing leaders attached to the target unit
        const existingLeaderRefs = targetUnitItem.leadBy || [];
        const existingLeaders = existingLeaderRefs.map((ref) => getUnitById(list.items, ref.listItemId)).filter((item): item is ArmyListItem => item !== undefined);

        // Validate multi-leader attachment
        const validation = validateMultiLeaderAttachment(leaderItem, existingLeaders);

        // If can't attach as additional leader, determine whether to replace or reject
        const shouldReplace = !validation.canAttach && (forceReplace || validation.wouldReplace);

        // Find previous target if this leader was already attached somewhere
        const previousTargetItem = leaderItem.leading ? getUnitById(list.items, leaderItem.leading.listItemId) : null;

        const updatedItems = list.items.map((item) => {
            // Update the leader with new target
            if (item.listItemId === leaderItemId) {
                const { leading, ...rest } = item;
                return { ...rest, leading: { listItemId: targetUnitItem.listItemId, id: targetUnitItem.id, name: targetUnitItem.name } };
            }
            // Update target unit's leadBy array
            if (item.listItemId === targetUnitItemId) {
                // Check if this leader is already in the array (shouldn't happen, but safety check)
                const alreadyAttached = existingLeaderRefs.some((l) => l.listItemId === leaderItem.listItemId);
                if (alreadyAttached) {
                    return item;
                }

                if (shouldReplace && existingLeaders.length > 0) {
                    // Replace existing leaders - clear leadBy and add only the new leader
                    return { ...item, leadBy: [{ listItemId: leaderItem.listItemId, id: leaderItem.id, name: leaderItem.name }] };
                } else {
                    // Add to existing leaders
                    return { ...item, leadBy: [...existingLeaderRefs, { listItemId: leaderItem.listItemId, id: leaderItem.id, name: leaderItem.name }] };
                }
            }
            // Remove leader from previous target's leadBy array
            if (previousTargetItem && item.listItemId === previousTargetItem.listItemId) {
                const newLeadBy = (item.leadBy || []).filter((l) => l.listItemId !== leaderItem.listItemId);
                if (newLeadBy.length === 0) {
                    const { leadBy, ...rest } = item;
                    return rest;
                }
                return { ...item, leadBy: newLeadBy };
            }
            // If replacing, remove leading from the old leaders that are being replaced
            if (shouldReplace && existingLeaders.some((el) => el.listItemId === item.listItemId)) {
                const { leading, ...rest } = item;
                return rest;
            }
            // Remove this leader from any other unit's leadBy array (shouldn't happen, but safety)
            if (item.leadBy?.some((l) => l.listItemId === leaderItem.listItemId) && item.listItemId !== targetUnitItemId) {
                const newLeadBy = item.leadBy.filter((l) => l.listItemId !== leaderItem.listItemId);
                if (newLeadBy.length === 0) {
                    const { leadBy, ...rest } = item;
                    return rest;
                }
                return { ...item, leadBy: newLeadBy };
            }
            return item;
        });

        const updatedList = finalizeList(list, updatedItems);
        setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
        return updatedList;
    }, []);

    const detachLeaderFromUnit = useCallback((list: ArmyList, leaderItemId: string): ArmyList => {
        const leaderItem = getUnitById(list.items, leaderItemId);
        if (!leaderItem?.leading) return list;

        const targetUnitItem = getUnitById(list.items, leaderItem.leading.listItemId);

        const updatedItems = list.items.map((item) => {
            // Remove leading from the leader
            if (item.listItemId === leaderItemId) {
                const { leading, ...rest } = item;
                return rest;
            }
            // Remove this specific leader from the target unit's leadBy array
            if (targetUnitItem && item.listItemId === targetUnitItem.listItemId) {
                const newLeadBy = (item.leadBy || []).filter((l) => l.listItemId !== leaderItem.listItemId);
                if (newLeadBy.length === 0) {
                    const { leadBy, ...rest } = item;
                    return rest;
                }
                return { ...item, leadBy: newLeadBy };
            }
            return item;
        });

        const updatedList = finalizeList(list, updatedItems);
        setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
        return updatedList;
    }, []);

    const attachEnhancementToLeader = useCallback((list: ArmyList, leaderItemId: string, enhancement: { id: string; name: string; cost?: number }): ArmyList => {
        const updatedItems = list.items.map((item) => {
            if (item.listItemId === leaderItemId) {
                if (item.enhancement?.id === enhancement.id) {
                    const { enhancement: _, ...rest } = item;
                    return rest;
                }
                return { ...item, enhancement: { id: enhancement.id, name: enhancement.name, cost: enhancement.cost } };
            }
            return item;
        });

        const updatedList = finalizeList(list, updatedItems);
        setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
        return updatedList;
    }, []);

    // Get enhancements for the selected detachment, filtered by unit eligibility
    const getDetachmentEnhancements = useCallback(
        (list: ArmyList, unit: ArmyListItem): Enhancement[] => {
            if (!list?.detachmentSlug || !factionData?.detachments || !unit) {
                return [];
            }

            const unitKeywords = (unit.keywords || []).map((k) => k.keyword.toUpperCase().trim());

            if (!unitKeywords.includes("CHARACTER")) {
                return [];
            }

            const detachment = factionData.detachments.find((d) => d.slug === list.detachmentSlug);
            const allEnhancements = detachment?.enhancements || [];

            const stripHtmlAndNormalize = (html: string): string => {
                return html
                    .replace(/<[^>]*>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()
                    .toUpperCase();
            };

            return allEnhancements.filter((enhancement) => {
                if (!enhancement.description) return true;

                const normalizedDescription = stripHtmlAndNormalize(enhancement.description);
                const modelOnlyMatch = normalizedDescription.match(/(.+?)\s+MODEL\s+ONLY/i);

                if (modelOnlyMatch) {
                    const requirementText = modelOnlyMatch[1].trim();

                    if (requirementText.includes(" OR ")) {
                        const keywords = requirementText.split(" OR ").map((k) => k.trim());
                        return keywords.some((keyword) => {
                            return unitKeywords.some((unitKeyword) => {
                                return unitKeyword === keyword || unitKeyword.includes(keyword) || keyword.includes(unitKeyword) || keyword.split(" ").every((word) => unitKeyword.includes(word));
                            });
                        });
                    } else {
                        const requiredKeyword = requirementText.trim();
                        return unitKeywords.some((unitKeyword) => {
                            return unitKeyword === requiredKeyword || unitKeyword.includes(requiredKeyword) || requiredKeyword.includes(unitKeyword) || requiredKeyword.split(" ").every((word) => unitKeyword.includes(word));
                        });
                    }
                }

                return true;
            });
        },
        [factionData]
    );

    // Track which enhancements are already used by other units in a list
    const getUsedEnhancements = useCallback((list: ArmyList, excludeItemId?: string): Map<string, string> => {
        const usedMap = new Map<string, string>();
        list.items.forEach((item) => {
            if (excludeItemId && item.listItemId === excludeItemId) return;
            if (item.enhancement) {
                usedMap.set(item.enhancement.id, item.name);
            }
        });
        return usedMap;
    }, []);

    // Get the default loadout weapon names from the unit's loadout string
    const getDefaultLoadout = useCallback((unit: ArmyListItem): string[] => {
        return parseLoadoutWeapons(unit.loadout || "");
    }, []);

    // Get unit's current weapons accounting for loadout selections
    const getUnitWeapons = useCallback(
        (unit: ArmyListItem): UnitWeapons => {
            if (!unit.availableWargear) {
                return { ranged: [], melee: [] };
            }

            // If unit has modelInstances, collect unique weapons from all models
            if (unit.modelInstances && unit.modelInstances.length > 0) {
                const weaponIds = new Set<string>();
                unit.modelInstances.forEach((m) => m.loadout.forEach((id) => weaponIds.add(id)));

                const activeWeapons = Array.from(weaponIds)
                    .map((id) => unit.availableWargear!.find((w) => w.id === id))
                    .filter((w): w is Weapon => w !== undefined);

                const ranged = activeWeapons.filter((w) => w.type === "Ranged");
                const melee = activeWeapons.filter((w) => w.type === "Melee");

                return { ranged, melee };
            }

            // Fallback: return default weapons from loadout string
            const defaultWeaponNames = getDefaultLoadout(unit).map((w) => w.toLowerCase());

            const activeWeapons: Weapon[] = unit.availableWargear.filter((weapon) => {
                const weaponNameLower = weapon.name.toLowerCase();
                return defaultWeaponNames.some((defaultName) => weaponNameLower.includes(defaultName) || defaultName.includes(weaponNameLower));
            });

            const ranged = activeWeapons.filter((w) => w.type === "Ranged");
            const melee = activeWeapons.filter((w) => w.type === "Melee");

            return { ranged, melee };
        },
        [getDefaultLoadout]
    );

    // Set or clear the warlord for a list
    const setWarlord = useCallback(
        (list: ArmyList, itemId: string | null): ArmyList => {
            const updatedList: ArmyList = {
                ...list,
                warlordItemId: itemId || undefined,
                updatedAt: Date.now(),
            };
            setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
            return updatedList;
        },
        [setLists]
    );

    // Get the current warlord unit from a list
    const getWarlord = useCallback((list: ArmyList): ArmyListItem | undefined => {
        return getUnitById(list.items, list.warlordItemId);
    }, []);

    // Get all units eligible to be warlord in a list
    const getEligibleWarlords = useCallback((list: ArmyList): ArmyListItem[] => {
        return list.items.filter((item) => getWarlordEligibility(item).canBeWarlord);
    }, []);

    const value: ListManagerContextType = {
        lists,
        setLists,
        listsLoaded,
        factions,
        factionData,
        loadFactionDataBySlug,
        createList,
        deleteList,
        getListById,
        addDatasheetToList,
        removeItemFromList,
        updateListItem,
        updateItemCombatState,
        addModelInstance,
        removeModelInstance,
        getModelCountForLine,
        updateModelLoadout,
        updateAllModelLoadouts,
        updateUnitWideSelection,
        attachLeaderToUnit,
        detachLeaderFromUnit,
        attachEnhancementToLeader,
        canAttachLeaderToUnit,
        calculateItemPoints,
        calculateTotalModels,
        calculateListTotalPoints,
        parseLoadoutWeapons,
        parseOptionConstraint,
        getDetachmentEnhancements,
        getUsedEnhancements,
        getUnitWeapons,
        getDefaultLoadout,
        setWarlord,
        getWarlord,
        getEligibleWarlords,
    };

    return <ListManagerContext.Provider value={value}>{children}</ListManagerContext.Provider>;
}

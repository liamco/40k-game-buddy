import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";

import { getAllFactions, loadFactionData, loadFactionConfig, loadDatasheetData } from "../../utils/depotDataLoader";
import type { Faction, FactionIndex, ArmyList, ArmyListItem, Datasheet, LoadoutConstraint, LoadoutOption, UnitWeapons, LeaderReference, LeaderCondition, UnitCombatState, Enhancement, Weapon, WarlordEligibility } from "../../types";

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

    let totalModels = 0;
    item.unitComposition.forEach((comp, idx) => {
        const line = comp.line || idx + 1;
        const count = item.compositionCounts?.[line] ?? comp.min ?? 0;
        totalModels += count;
    });

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
 * Resolve the active wargear for a unit based on loadout, selections, and removals.
 * Returns a flat array of Weapon objects that the unit currently has equipped.
 * This is used when creating EngagementForceItems to pre-compute the active weapons.
 */
export function resolveUnitWargear(unit: ArmyListItem): Weapon[] {
    if (!unit.availableWargear) {
        return [];
    }

    const defaultWeaponNames = parseLoadoutWeapons(unit.loadout || "").map((w) => w.toLowerCase());
    const loadoutSelections = unit.loadoutSelections || {};
    const removedWeapons = unit.removedWeapons || {};

    // Start with default weapons from availableWargear that match the loadout string
    let activeWeapons: Weapon[] = unit.availableWargear.filter((weapon) => {
        const weaponNameLower = weapon.name.toLowerCase();
        const isDefault = defaultWeaponNames.some((defaultName) => weaponNameLower.includes(defaultName) || defaultName.includes(weaponNameLower));

        // Check if explicitly removed
        if (removedWeapons[weapon.id]) {
            return false;
        }

        return isDefault;
    });

    // Add weapons from loadout selections
    if (unit.options) {
        unit.options.forEach((option: any, idx: number) => {
            const line = option.line || idx + 1;
            const selectionCount = loadoutSelections[line] || 0;

            if (selectionCount > 0 && option.description) {
                const addedWeaponNames = parseWeaponsFromOption(option.description);

                addedWeaponNames.forEach((weaponName) => {
                    const matchingWeapon = unit.availableWargear!.find((w) => w.name.toLowerCase() === weaponName.toLowerCase());
                    if (matchingWeapon && !activeWeapons.some((w) => w.id === matchingWeapon.id)) {
                        activeWeapons.push(matchingWeapon);
                    }
                });
            }
        });
    }

    return activeWeapons;
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
    getLoadoutOptions: (unit: ArmyListItem) => LoadoutOption[];
    updateLoadoutSelection: (list: ArmyList, unitId: string, optionLine: number, count: number) => ArmyList;
    updateLoadoutWeaponChoice: (list: ArmyList, unitId: string, optionLine: number, slotIndex: number, weaponName: string | null) => ArmyList;
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
        if (!item.unitComposition || item.unitComposition.length === 0) {
            return 1;
        }
        let total = 0;
        item.unitComposition.forEach((comp, idx) => {
            if (comp.description === "OR") return;
            const line = comp.line || idx + 1;
            const count = item.compositionCounts?.[line] ?? comp.min ?? 0;
            total += count;
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
            const compositionCounts: { [line: number]: number } = {};
            if (fullDatasheet.unitComposition && Array.isArray(fullDatasheet.unitComposition)) {
                fullDatasheet.unitComposition.forEach((comp, idx) => {
                    const line = comp.line || idx + 1;
                    compositionCounts[line] = comp.min ?? 0;
                });
            }

            const newItem: ArmyListItem = {
                ...fullDatasheet,
                name: `${baseName} ${getSuffixLetter(newSuffixIndex)}`,
                listItemId: `${datasheet.id}-${Date.now()}`,
                pointsCost: datasheet.modelCosts,
                compositionCounts: Object.keys(compositionCounts).length > 0 ? compositionCounts : undefined,
            };
            updatedItems.push(newItem);
        } else {
            const compositionCounts: { [line: number]: number } = {};
            if (fullDatasheet.unitComposition && Array.isArray(fullDatasheet.unitComposition)) {
                fullDatasheet.unitComposition.forEach((comp, idx) => {
                    const line = comp.line || idx + 1;
                    compositionCounts[line] = comp.min ?? 0;
                });
            }

            const newItem: ArmyListItem = {
                ...fullDatasheet,
                listItemId: `${datasheet.id}-${Date.now()}`,
                pointsCost: datasheet.modelCosts,
                compositionCounts: Object.keys(compositionCounts).length > 0 ? compositionCounts : undefined,
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
        const itemToRemove = list.items.find((item) => item.listItemId === itemId);
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

    // Validate if a leader can attach to a unit (considering existing leaders)
    const canAttachLeaderToUnit = useCallback((list: ArmyList, leaderItemId: string, targetUnitItemId: string): MultiLeaderValidationResult => {
        const leaderItem = list.items.find((item) => item.listItemId === leaderItemId);
        const targetUnitItem = list.items.find((item) => item.listItemId === targetUnitItemId);

        if (!leaderItem || !targetUnitItem) {
            return { canAttach: false, reason: "Leader or target unit not found" };
        }

        // Get existing leaders attached to the target unit
        const existingLeaderRefs = targetUnitItem.leadBy || [];
        const existingLeaders = existingLeaderRefs.map((ref) => list.items.find((item) => item.listItemId === ref.listItemId)).filter((item): item is ArmyListItem => item !== undefined);

        return validateMultiLeaderAttachment(leaderItem, existingLeaders);
    }, []);

    const attachLeaderToUnit = useCallback((list: ArmyList, leaderItemId: string, targetUnitItemId: string, forceReplace: boolean = false): ArmyList => {
        const leaderItem = list.items.find((item) => item.listItemId === leaderItemId);
        const targetUnitItem = list.items.find((item) => item.listItemId === targetUnitItemId);
        if (!leaderItem || !targetUnitItem) return list;

        // Get existing leaders attached to the target unit
        const existingLeaderRefs = targetUnitItem.leadBy || [];
        const existingLeaders = existingLeaderRefs.map((ref) => list.items.find((item) => item.listItemId === ref.listItemId)).filter((item): item is ArmyListItem => item !== undefined);

        // Validate multi-leader attachment
        const validation = validateMultiLeaderAttachment(leaderItem, existingLeaders);

        // If can't attach as additional leader, determine whether to replace or reject
        const shouldReplace = !validation.canAttach && (forceReplace || validation.wouldReplace);

        // Find previous target if this leader was already attached somewhere
        const previousTargetItem = leaderItem.leading ? list.items.find((item) => item.listItemId === leaderItem.leading?.listItemId) : null;

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
        const leaderItem = list.items.find((item) => item.listItemId === leaderItemId);
        if (!leaderItem?.leading) return list;

        const targetUnitItem = list.items.find((item) => item.listItemId === leaderItem.leading?.listItemId);

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

            const defaultWeaponNames = getDefaultLoadout(unit).map((w) => w.toLowerCase());
            const loadoutSelections = unit.loadoutSelections || {};
            const loadoutWeaponChoices = unit.loadoutWeaponChoices || {};
            const removedWeapons = unit.removedWeapons || {};

            // Start with default weapons from availableWargear that match the loadout string
            let activeWeapons: Weapon[] = unit.availableWargear.filter((weapon) => {
                // Check if weapon is in default loadout
                const weaponNameLower = weapon.name.toLowerCase();
                const isDefault = defaultWeaponNames.some((defaultName) => weaponNameLower.includes(defaultName) || defaultName.includes(weaponNameLower));

                // Check if explicitly removed
                if (removedWeapons[weapon.id]) {
                    return false;
                }

                return isDefault;
            });

            // Add weapons from loadout selections
            if (unit.options) {
                unit.options.forEach((option, idx) => {
                    const line = option.line || idx + 1;
                    const selectionCount = loadoutSelections[line] || 0;

                    if (selectionCount > 0 && option.description) {
                        // Check if this option has explicit weapon choices
                        const weaponChoices = loadoutWeaponChoices[line];
                        if (weaponChoices && weaponChoices.length > 0) {
                            // Use the explicitly chosen weapons
                            weaponChoices.forEach((weaponName) => {
                                const matchingWeapon = unit.availableWargear?.find((w) => w.name.toLowerCase() === weaponName.toLowerCase());
                                if (matchingWeapon && !activeWeapons.some((w) => w.id === matchingWeapon.id)) {
                                    activeWeapons.push(matchingWeapon);
                                }
                            });
                        } else {
                            // Fall back to parsing option to find what weapons it adds (for single-choice options)
                            const addedWeaponNames = parseWeaponsFromOption(option.description);

                            // For single-choice options, add the first weapon
                            if (addedWeaponNames.length === 1) {
                                const matchingWeapon = unit.availableWargear?.find((w) => w.name.toLowerCase() === addedWeaponNames[0].toLowerCase());
                                if (matchingWeapon && !activeWeapons.some((w) => w.id === matchingWeapon.id)) {
                                    activeWeapons.push(matchingWeapon);
                                }
                            }
                        }
                    }
                });
            }

            // Split by type
            const ranged = activeWeapons.filter((w) => w.type === "Ranged");
            const melee = activeWeapons.filter((w) => w.type === "Melee");

            return { ranged, melee };
        },
        [getDefaultLoadout]
    );

    // Get enriched loadout options with constraint info
    const getLoadoutOptions = useCallback(
        (unit: ArmyListItem): LoadoutOption[] => {
            if (!unit.options || unit.options.length === 0) {
                return [];
            }

            const totalModels = calculateTotalModels(unit);
            const loadoutSelections = unit.loadoutSelections || {};

            return unit.options.map((option, idx) => {
                const line = option.line || idx + 1;
                const constraint = parseOptionConstraint(option.description || "", totalModels);
                const isNote = option.button === "*";

                // Parse weapons that would be replaced/added
                const { replacesWeapons, addsWeapons } = parseOptionWeaponChanges(option.description || "");

                return {
                    line,
                    description: option.description || "",
                    button: option.button || "•",
                    constraint,
                    currentSelections: loadoutSelections[line] || 0,
                    replacesWeapons,
                    addsWeapons,
                    isNote,
                };
            });
        },
        [calculateTotalModels]
    );

    // Update loadout selection for a unit
    const updateLoadoutSelection = useCallback(
        (list: ArmyList, unitId: string, optionLine: number, count: number): ArmyList => {
            const unit = list.items.find((item) => item.listItemId === unitId);
            if (!unit) return list;

            const option = unit.options?.find((o) => o.line === optionLine);
            if (!option) return list;

            const totalModels = calculateTotalModels(unit);
            const constraint = parseOptionConstraint(option.description || "", totalModels);

            // Clamp count to valid range
            const clampedCount = Math.max(0, Math.min(count, constraint.maxSelections));

            const currentSelections = unit.loadoutSelections || {};
            const newSelections = { ...currentSelections, [optionLine]: clampedCount };

            // Track removed weapons if this option replaces default weapons
            const { replacesWeapons } = parseOptionWeaponChanges(option.description || "");
            let newRemovedWeapons = { ...(unit.removedWeapons || {}) };

            if (clampedCount > 0 && replacesWeapons.length > 0) {
                // Mark replaced weapons as removed
                replacesWeapons.forEach((weaponName) => {
                    const weapon = unit.availableWargear?.find((w) => w.name.toLowerCase() === weaponName.toLowerCase());
                    if (weapon) {
                        newRemovedWeapons[weapon.id] = true;
                    }
                });
            } else if (clampedCount === 0 && replacesWeapons.length > 0) {
                // Restore replaced weapons
                replacesWeapons.forEach((weaponName) => {
                    const weapon = unit.availableWargear?.find((w) => w.name.toLowerCase() === weaponName.toLowerCase());
                    if (weapon) {
                        delete newRemovedWeapons[weapon.id];
                    }
                });
            }

            return updateListItem(list, unitId, {
                loadoutSelections: newSelections,
                removedWeapons: Object.keys(newRemovedWeapons).length > 0 ? newRemovedWeapons : undefined,
            });
        },
        [calculateTotalModels, updateListItem]
    );

    // Update weapon choice for a specific slot in a multi-choice option
    const updateLoadoutWeaponChoice = useCallback(
        (list: ArmyList, unitId: string, optionLine: number, slotIndex: number, weaponName: string | null): ArmyList => {
            const unit = list.items.find((item) => item.listItemId === unitId);
            if (!unit) return list;

            const currentChoices = unit.loadoutWeaponChoices || {};
            const currentSlotChoices = [...(currentChoices[optionLine] || [])];

            if (weaponName === null) {
                // Remove the slot
                currentSlotChoices.splice(slotIndex, 1);
            } else if (slotIndex < currentSlotChoices.length) {
                // Update existing slot
                currentSlotChoices[slotIndex] = weaponName;
            } else {
                // Add new slot
                currentSlotChoices.push(weaponName);
            }

            const newChoices = { ...currentChoices };
            if (currentSlotChoices.length > 0) {
                newChoices[optionLine] = currentSlotChoices;
            } else {
                delete newChoices[optionLine];
            }

            // Update loadoutSelections count to match number of choices
            const currentSelections = unit.loadoutSelections || {};
            const newSelections = { ...currentSelections, [optionLine]: currentSlotChoices.length };

            return updateListItem(list, unitId, {
                loadoutSelections: newSelections,
                loadoutWeaponChoices: Object.keys(newChoices).length > 0 ? newChoices : undefined,
            });
        },
        [updateListItem]
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
        if (!list.warlordItemId) return undefined;
        return list.items.find((item) => item.listItemId === list.warlordItemId);
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
        getLoadoutOptions,
        updateLoadoutSelection,
        updateLoadoutWeaponChoice,
        getDefaultLoadout,
        setWarlord,
        getWarlord,
        getEligibleWarlords,
    };

    return <ListManagerContext.Provider value={value}>{children}</ListManagerContext.Provider>;
}

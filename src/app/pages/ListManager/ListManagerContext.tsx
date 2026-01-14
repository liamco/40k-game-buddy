import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";

import { getAllFactions, loadFactionData, loadDatasheetData } from "../../utils/depotDataLoader";
import type { Faction, FactionIndex, ArmyList, ArmyListItem, Datasheet, LoadoutConstraint, LeaderReference, LeaderCondition } from "../../types";

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

const STORAGE_KEY = "battle-cogitator-army-lists";

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
    createList: (name: string, faction: FactionIndex, detachmentSlug?: string, detachmentName?: string) => ArmyList;
    deleteList: (listId: string) => void;
    getListById: (listId: string) => ArmyList | undefined;

    // Item operations
    addDatasheetToList: (list: ArmyList, datasheet: Datasheet) => Promise<ArmyList>;
    removeItemFromList: (list: ArmyList, itemId: string) => ArmyList;
    updateListItem: (list: ArmyList, itemId: string, updates: Partial<ArmyListItem>) => ArmyList;

    // Attachment operations
    attachLeaderToUnit: (list: ArmyList, leaderItemId: string, targetUnitItemId: string, forceReplace?: boolean) => ArmyList;
    detachLeaderFromUnit: (list: ArmyList, leaderItemId: string) => ArmyList;
    attachEnhancementToLeader: (list: ArmyList, leaderItemId: string, enhancement: { id: string; name: string; cost?: number }) => ArmyList;
    canAttachLeaderToUnit: (list: ArmyList, leaderItemId: string, targetUnitItemId: string) => MultiLeaderValidationResult;

    // Helper functions
    calculateItemPoints: (item: ArmyListItem) => number;
    calculateTotalModels: (item: ArmyListItem) => number;
    parseLoadoutWeapons: (loadout: string) => string[];
    parseOptionConstraint: (description: string, totalModels: number) => LoadoutConstraint;
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

                            return { ...list, items: migratedItems };
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

    const createList = useCallback((name: string, faction: FactionIndex, detachmentSlug?: string, detachmentName?: string): ArmyList => {
        const newList: ArmyList = {
            id: Date.now().toString(),
            name: name.trim(),
            factionId: faction.id,
            factionName: faction.name,
            factionSlug: faction.slug,
            detachmentSlug,
            detachmentName,
            items: [],
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

    const calculateItemPoints = useCallback((item: ArmyListItem): number => {
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

        const updatedList: ArmyList = { ...list, items: updatedItems, updatedAt: Date.now() };
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

        const updatedList: ArmyList = { ...list, items: updatedItems, updatedAt: Date.now() };
        setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
        return updatedList;
    }, []);

    const updateListItem = useCallback((list: ArmyList, itemId: string, updates: Partial<ArmyListItem>): ArmyList => {
        const updatedItems = list.items.map((item) => (item.listItemId === itemId ? { ...item, ...updates } : item));
        const updatedList: ArmyList = { ...list, items: updatedItems, updatedAt: Date.now() };
        setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
        return updatedList;
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

        const updatedList: ArmyList = { ...list, items: updatedItems, updatedAt: Date.now() };
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

        const updatedList: ArmyList = { ...list, items: updatedItems, updatedAt: Date.now() };
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

        const updatedList: ArmyList = { ...list, items: updatedItems, updatedAt: Date.now() };
        setLists((prev) => prev.map((l) => (l.id === list.id ? updatedList : l)));
        return updatedList;
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
        attachLeaderToUnit,
        detachLeaderFromUnit,
        attachEnhancementToLeader,
        canAttachLeaderToUnit,
        calculateItemPoints,
        calculateTotalModels,
        parseLoadoutWeapons,
        parseOptionConstraint,
    };

    return <ListManagerContext.Provider value={value}>{children}</ListManagerContext.Provider>;
}

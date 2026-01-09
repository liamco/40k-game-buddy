import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";

import { getAllFactions, loadFactionData, loadDatasheetData } from "../../utils/depotDataLoader";
import type { Faction, FactionIndex, ArmyList, ArmyListItem, Datasheet, LoadoutConstraint } from "../../types";

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
    attachLeaderToUnit: (list: ArmyList, leaderItemId: string, targetUnitItemId: string) => ArmyList;
    detachLeaderFromUnit: (list: ArmyList, leaderItemId: string) => ArmyList;
    attachEnhancementToLeader: (list: ArmyList, leaderItemId: string, enhancement: { id: string; name: string; cost?: number }) => ArmyList;

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

    // Load lists from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setLists(JSON.parse(stored));
            } catch (error) {
                console.error("Error loading lists:", error);
            }
        }
        setListsLoaded(true);
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
            updatedItems = updatedItems.map((item) => {
                const itemBaseName = getBaseName(item.name);
                if (itemBaseName === baseName) {
                    const duplicateIndex = duplicateItems.findIndex((dup) => dup.listItemId === item.listItemId);
                    if (duplicateIndex >= 0) {
                        return { ...item, name: `${itemBaseName} ${getSuffixLetter(duplicateIndex)}` };
                    }
                }
                return item;
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
            if (itemToRemove.leading) {
                if (item.id === itemToRemove.leading.id && item.name === itemToRemove.leading.name) {
                    const { leadBy, ...rest } = item;
                    return rest;
                }
            }
            if (itemToRemove.leadBy) {
                if (item.id === itemToRemove.leadBy.id && item.name === itemToRemove.leadBy.name) {
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

    const attachLeaderToUnit = useCallback((list: ArmyList, leaderItemId: string, targetUnitItemId: string): ArmyList => {
        const leaderItem = list.items.find((item) => item.listItemId === leaderItemId);
        const targetUnitItem = list.items.find((item) => item.listItemId === targetUnitItemId);
        if (!leaderItem || !targetUnitItem) return list;

        const previousTargetItem = leaderItem.leading ? list.items.find((item) => item.id === leaderItem.leading?.id && item.name === leaderItem.leading?.name) : null;

        const updatedItems = list.items.map((item) => {
            if (item.listItemId === leaderItemId) {
                const { leading, ...rest } = item;
                return { ...rest, leading: { id: targetUnitItem.id, name: targetUnitItem.name } };
            }
            if (item.listItemId === targetUnitItemId) {
                const { leadBy, ...rest } = item;
                return { ...rest, leadBy: { id: leaderItem.id, name: leaderItem.name } };
            }
            if (previousTargetItem && item.listItemId === previousTargetItem.listItemId) {
                const { leadBy, ...rest } = item;
                return rest;
            }
            if (item.leadBy?.id === leaderItem.id && item.listItemId !== targetUnitItemId) {
                const { leadBy, ...rest } = item;
                return rest;
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

        const targetUnitItem = list.items.find((item) => item.id === leaderItem.leading?.id && item.name === leaderItem.leading?.name);

        const updatedItems = list.items.map((item) => {
            if (item.listItemId === leaderItemId) {
                const { leading, ...rest } = item;
                return rest;
            }
            if (targetUnitItem && item.listItemId === targetUnitItem.listItemId) {
                const { leadBy, ...rest } = item;
                return rest;
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
        calculateItemPoints,
        calculateTotalModels,
        parseLoadoutWeapons,
        parseOptionConstraint,
    };

    return <ListManagerContext.Provider value={value}>{children}</ListManagerContext.Provider>;
}

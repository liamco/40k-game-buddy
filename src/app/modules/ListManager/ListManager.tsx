import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Trash2, X, Search } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../../components/ui/command";

import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { getAllFactions, loadFactionData, getFactionBySlug, loadDatasheetData } from "../../utils/depotDataLoader";
import type { Faction, FactionIndex, ArmyList, ArmyListItem, Datasheet, Detachment } from "../../types";

const STORAGE_KEY = "battle-cogitator-army-lists";

export function ListManager() {
    const [lists, setLists] = useState<ArmyList[]>([]);
    const [selectedList, setSelectedList] = useState<ArmyList | null>(null);
    const [factionSearchOpen, setFactionSearchOpen] = useState(false);
    const [datasheetSearchOpen, setDatasheetSearchOpen] = useState(false);
    const [detachmentSearchOpen, setDetachmentSearchOpen] = useState(false);
    const [selectedFaction, setSelectedFaction] = useState<FactionIndex | null>(null);
    const [selectedDetachment, setSelectedDetachment] = useState<Detachment | null>(null);
    const [factionData, setFactionData] = useState<Faction | null>(null);
    const [factionSearchValue, setFactionSearchValue] = useState("");
    const [datasheetSearchValue, setDatasheetSearchValue] = useState("");
    const [detachmentSearchValue, setDetachmentSearchValue] = useState("");
    const [newListName, setNewListName] = useState("");
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ArmyListItem | null>(null);
    const [bodyguardUnits, setBodyguardUnits] = useState<Datasheet[]>([]);
    const [loadingBodyguards, setLoadingBodyguards] = useState(false);

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
    }, []);

    // Save lists to localStorage whenever they change
    useEffect(() => {
        if (lists.length > 0 || localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
            // Dispatch custom event for same-window updates
            window.dispatchEvent(new Event("listsUpdated"));
        }
    }, [lists]);

    // Load faction data when a faction is selected (for creating new list)
    useEffect(() => {
        if (selectedFaction) {
            loadFactionData(selectedFaction.slug).then((data) => {
                if (data) {
                    setFactionData(data);
                }
            });
            // Reset detachment when faction changes
            setSelectedDetachment(null);
        } else {
            setFactionData(null);
            setSelectedDetachment(null);
        }
    }, [selectedFaction]);

    // Load faction data when a list is selected
    useEffect(() => {
        if (selectedList) {
            loadFactionData(selectedList.factionSlug).then((data) => {
                if (data) {
                    setFactionData(data);
                }
                
            });
        }
    }, [selectedList]);


    // Load bodyguard units when a leader is selected
    useEffect(() => {
        const loadBodyguardUnits = async () => {
            
            if (!selectedItem || !factionData) {
                setBodyguardUnits([]);
                return;
            }
            
            if(!selectedItem.leaders.length){
                setBodyguardUnits([]);
                return;
            }

            setLoadingBodyguards(true);
            const bodyguards: Datasheet[] = [];

            // Search through all datasheets in the faction to find ones that can be led by this unit
            for (const datasheetRef of selectedItem.leaders) {
                ;
                try {
                    const fullDatasheet = await loadDatasheetData(
                        selectedItem.factionSlug,
                        datasheetRef.id
                    );
                    
                    if (fullDatasheet) {
                        bodyguards.push(fullDatasheet);
                    }
                } catch (error) {
                    console.error(`Error loading datasheet ${datasheetRef.id}:`, error);
                }
            }
            
            setBodyguardUnits(bodyguards);
            setLoadingBodyguards(false);
        };

        loadBodyguardUnits();
    }, [selectedItem, factionData]);

    // Split bodyguard units into those in the list and those not in the list
    const { unitsInList, unitsNotInList } = useMemo(() => {
        if (!selectedList || bodyguardUnits.length === 0) {
            return { unitsInList: [], unitsNotInList: [] };
        }
        
        // Create a set of leadable datasheet IDs for quick lookup
        const leadableDatasheetIds = new Set(bodyguardUnits.map(unit => unit.id));
        
        // Find all list items that match leadable datasheet IDs
        const inList: ArmyListItem[] = selectedList.items.filter(item => 
            leadableDatasheetIds.has(item.id)
        );
        
        // Find datasheets that are leadable but not in the list
        const listUnitIds = new Set(selectedList.items.map(item => item.id));
        const notInList: Datasheet[] = bodyguardUnits.filter(unit => 
            !listUnitIds.has(unit.id)
        );
        
        return { unitsInList: inList, unitsNotInList: notInList };
    }, [bodyguardUnits, selectedList]);

    // Reorder list items to group leaders with their attached units
    const orderedListItems = useMemo(() => {
        if (!selectedList) return [];
        
        const items = [...selectedList.items];
        const processed = new Set<string>();
        const ordered: ArmyListItem[] = [];
        
        // First pass: add leaders and their attached units together
        items.forEach(item => {
            if (processed.has(item.listItemId)) return;
            
            // If this item is a leader with an attached unit
            if (item.leading) {
                // Find the attached unit by matching both ID and name
                const attachedUnit = items.find(u => 
                    u.id === item.leading?.id && 
                    u.name === item.leading?.name &&
                    !processed.has(u.listItemId)
                );
                
                if (attachedUnit) {
                    // Add leader first, then attached unit
                    ordered.push(item);
                    ordered.push(attachedUnit);
                    processed.add(item.listItemId);
                    processed.add(attachedUnit.listItemId);
                } else {
                    // Leader but attached unit not found, add it alone
                    ordered.push(item);
                    processed.add(item.listItemId);
                }
            }
        });
        
        // Second pass: add units that are being led but their leader wasn't found/processed
        items.forEach(item => {
            if (processed.has(item.listItemId)) return;
            
            if (item.leadBy) {
                // Check if the leader exists and was processed
                const leader = items.find(l => 
                    l.id === item.leadBy?.id && 
                    l.name === item.leadBy?.name
                );
                
                if (!leader || !processed.has(leader.listItemId)) {
                    // Leader not found or not processed, add this unit alone
                    ordered.push(item);
                    processed.add(item.listItemId);
                }
            }
        });
        
        // Third pass: add remaining items that weren't processed
        items.forEach(item => {
            if (!processed.has(item.listItemId)) {
                ordered.push(item);
            }
        });
        
        return ordered;
    }, [selectedList]);

    const filteredFactions = useMemo(() => {
        if (!factionSearchValue) return factions;
        const search = factionSearchValue.toLowerCase();
        return factions.filter(
            (f) => f.name.toLowerCase().includes(search) || f.slug.toLowerCase().includes(search)
        );
    }, [factions, factionSearchValue]);

    const filteredDatasheets = useMemo(() => {
        if (!factionData || !datasheetSearchValue) {
            return factionData?.datasheets || [];
        }
        const search = datasheetSearchValue.toLowerCase();
        return factionData.datasheets.filter(
            (d) =>
                d.name.toLowerCase().includes(search) ||
                d.roleLabel.toLowerCase().includes(search) ||
                d.slug.toLowerCase().includes(search)
        );
    }, [factionData, datasheetSearchValue]);

    const filteredDetachments = useMemo(() => {
        if (!factionData?.detachments || !detachmentSearchValue) {
            return factionData?.detachments || [];
        }
        const search = detachmentSearchValue.toLowerCase();
        return factionData.detachments.filter(
            (d) =>
                d.name.toLowerCase().includes(search) ||
                d.slug.toLowerCase().includes(search)
        );
    }, [factionData, detachmentSearchValue]);

    const createNewList = () => {
        if (!selectedFaction || !newListName.trim()) return;

        const newList: ArmyList = {
            id: Date.now().toString(),
            name: newListName.trim(),
            factionId: selectedFaction.id,
            factionName: selectedFaction.name,
            factionSlug: selectedFaction.slug,
            detachmentSlug: selectedDetachment?.slug,
            detachmentName: selectedDetachment?.name,
            items: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        setLists([...lists, newList]);
        setSelectedList(newList);
        setNewListName("");
        setIsCreatingList(false);
        setSelectedFaction(null);
        setSelectedDetachment(null);
        setFactionData(null);
    };

    // Helper function to extract base name (without suffix)
    const getBaseName = (name: string): string => {
        // Remove common suffixes: Primus, Secundus, Tertius, etc.
        const suffixPattern = /\s+(Primus|Secundus|Tertius|Quartus|Quintus|Septimus|Sextus|Octus|India|Juliet|Kilo|Lima|Mike|November|Oscar|Papa|Quebec|Romeo|Sierra|Tango|Uniform|Victor|Whiskey|Xray|Yankee|Zulu)$/i;
        return name.replace(suffixPattern, '').trim();
    };

    // Helper function to get suffix letter for index
    const getSuffixLetter = (index: number): string => {
        const suffixes = ['Primus', 'Secundus', 'Tertius', 'Quartus', 'Quintus', 'Septimus', 'Sextus', 'Octus', 'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'Xray', 'Yankee', 'Zulu'];
        return suffixes[index] || `Unit ${index + 1}`;
    };

    const addDatasheetToList = (datasheet: Datasheet) => {
        if (!selectedList) return;
        
        // Load the full datasheet JSON file
        loadDatasheetData(selectedList.factionSlug, datasheet.id).then((fullDatasheet) => {
            if (!fullDatasheet) {
                console.error("Failed to load full datasheet data");
                return;
            }
            
            const baseName = getBaseName(fullDatasheet.name);
            
            // Find all existing items with the same base name
            const duplicateItems = selectedList.items.filter(item => 
                getBaseName(item.name) === baseName
            );
            
            let updatedItems = [...selectedList.items];
            
            // If there are duplicates, add suffixes to all of them
            if (duplicateItems.length > 0) {
                // Update all existing items with the same base name to have suffixes
                updatedItems = updatedItems.map(item => {
                    const itemBaseName = getBaseName(item.name);
                    if (itemBaseName === baseName) {
                        // Find the index of this item among duplicates (preserve order)
                        const duplicateIndex = duplicateItems.findIndex(dup => dup.listItemId === item.listItemId);
                        if (duplicateIndex >= 0) {
                            // Always update to have the correct suffix based on its position
                            return {
                                ...item,
                                name: `${itemBaseName} ${getSuffixLetter(duplicateIndex)}`
                            };
                        }
                    }
                    return item;
                });
                
                // Add suffix to new item (it will be the last one)
                const newSuffixIndex = duplicateItems.length;
                
                // Initialize composition counts from unitComposition
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
                // No duplicates, add as-is
                
                // Initialize composition counts from unitComposition
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
            
            const updatedList: ArmyList = {
                ...selectedList,
                items: updatedItems,
                updatedAt: Date.now(),
            };

            const updatedLists = lists.map((l) => (l.id === selectedList.id ? updatedList : l));
            setLists(updatedLists);
            setSelectedList(updatedList);
            setDatasheetSearchValue("");
        });
    };

    const removeItemFromList = (itemId: string) => {
        if (!selectedList) return;

        // Find the item being removed
        const itemToRemove = selectedList.items.find(item => item.listItemId === itemId);
        if (!itemToRemove) return;

        // Clean up attachment relationships before removing the item
        let updatedItems = selectedList.items.map(item => {
            // If this item is a leader being removed, remove leadBy from the unit it was leading
            if (itemToRemove.leading) {
                // Check if this is the unit that was being led
                if (item.id === itemToRemove.leading.id && item.name === itemToRemove.leading.name) {
                    const { leadBy, ...rest } = item;
                    return rest;
                }
            }
            
            // If this item is a unit being removed that was being led, remove leading from the leader
            if (itemToRemove.leadBy) {
                // Check if this is the leader that was leading the removed unit
                if (item.id === itemToRemove.leadBy.id && item.name === itemToRemove.leadBy.name) {
                    const { leading, ...rest } = item;
                    return rest;
                }
            }
            
            return item;
        });

        // Now remove the item itself
        updatedItems = updatedItems.filter((item) => item.listItemId !== itemId);

        const updatedList: ArmyList = {
            ...selectedList,
            items: updatedItems,
            updatedAt: Date.now(),
        };

        const updatedLists = lists.map((l) => (l.id === selectedList.id ? updatedList : l));
        setLists(updatedLists);
        setSelectedList(updatedList);
        
        // Clear selected item if it was removed
        if (selectedItem?.listItemId === itemId) {
            setSelectedItem(null);
        }
    };

    const attachLeaderToUnit = (leaderItemId: string, targetUnitItemId: string) => {
        if (!selectedList) return;

        const leaderItem = selectedList.items.find(item => item.listItemId === leaderItemId);
        const targetUnitItem = selectedList.items.find(item => item.listItemId === targetUnitItemId);
        
        if (!leaderItem || !targetUnitItem) return;

        // Find the previous unit this leader was leading (if any)
        const previousTargetItem = leaderItem.leading 
            ? selectedList.items.find(
                item => item.id === leaderItem.leading?.id && item.name === leaderItem.leading?.name
            )
            : null;

        const updatedItems = selectedList.items.map(item => {
            // If this is the leader, update its "leading" property
            if (item.listItemId === leaderItemId) {
                const { leading, ...rest } = item;
                return {
                    ...rest,
                    leading: {
                        id: targetUnitItem.id,
                        name: targetUnitItem.name
                    }
                };
            }
            
            // If this is the target unit, update its "leadBy" property
            if (item.listItemId === targetUnitItemId) {
                const { leadBy, ...rest } = item;
                return {
                    ...rest,
                    leadBy: {
                        id: leaderItem.id,
                        name: leaderItem.name
                    }
                };
            }
            
            // If this was the previous target unit, remove its leadBy relationship
            if (previousTargetItem && item.listItemId === previousTargetItem.listItemId) {
                const { leadBy, ...rest } = item;
                return rest;
            }
            
            // If this item was previously being led by the leader (different instance), remove that relationship
            if (item.leadBy?.id === leaderItem.id && item.listItemId !== targetUnitItemId) {
                const { leadBy, ...rest } = item;
                return rest;
            }
            
            return item;
        });

        const updatedList: ArmyList = {
            ...selectedList,
            items: updatedItems,
            updatedAt: Date.now(),
        };

        const updatedLists = lists.map((l) => (l.id === selectedList.id ? updatedList : l));
        setLists(updatedLists);
        setSelectedList(updatedList);
        
        // Update selected item if it was modified
        const updatedSelectedItem = updatedItems.find(item => item.listItemId === selectedItem?.listItemId);
        if (updatedSelectedItem) {
            setSelectedItem(updatedSelectedItem);
        }
    };

    const detachLeaderFromUnit = (leaderItemId: string) => {
        if (!selectedList) return;

        const leaderItem = selectedList.items.find(item => item.listItemId === leaderItemId);
        if (!leaderItem?.leading) return;

        // Find the target unit by matching both ID and name
        const targetUnitItem = selectedList.items.find(
            item => item.id === leaderItem.leading?.id && item.name === leaderItem.leading?.name
        );

        const updatedItems = selectedList.items.map(item => {
            // Remove leading from the leader
            if (item.listItemId === leaderItemId) {
                const { leading, ...rest } = item;
                return rest;
            }
            
            // Remove leadBy from the target unit
            if (targetUnitItem && item.listItemId === targetUnitItem.listItemId) {
                const { leadBy, ...rest } = item;
                return rest;
            }
            
            return item;
        });

        const updatedList: ArmyList = {
            ...selectedList,
            items: updatedItems,
            updatedAt: Date.now(),
        };

        const updatedLists = lists.map((l) => (l.id === selectedList.id ? updatedList : l));
        setLists(updatedLists);
        setSelectedList(updatedList);
        
        // Update selected item if it was modified
        const updatedSelectedItem = updatedItems.find(item => item.listItemId === selectedItem?.listItemId);
        if (updatedSelectedItem) {
            setSelectedItem(updatedSelectedItem);
        }
    };

    const deleteList = (listId: string) => {
        const updatedLists = lists.filter((l) => l.id !== listId);
        setLists(updatedLists);
        if (selectedList?.id === listId) {
            setSelectedList(null);
        }
    };

    // Helper function to calculate total points based on composition counts for any item
    const calculateItemPoints = useCallback((item: ArmyListItem): number => {
        // If there's no unitComposition, use the first modelCost
        if (!item.unitComposition || item.unitComposition.length === 0) {
            return item.modelCosts?.[0]?.cost ?? 0;
        }
        
        // Calculate total number of models from composition counts
        let totalModels = 0;
        item.unitComposition.forEach((comp, idx) => {
            const line = comp.line || idx + 1;
            const count = item.compositionCounts?.[line] ?? comp.min ?? 0;
            totalModels += count;
        });
        
        // Find the modelCost entry for the cost bracket that covers the total model count
        // The count in modelCosts represents the maximum number of models for that cost bracket
        // Example: count: 5, cost: 80 means 1-5 models cost 80 points
        //          count: 10, cost: 160 means 6-10 models cost 160 points
        if (item.modelCosts && Array.isArray(item.modelCosts)) {
            // Find all cost brackets that can accommodate the total models (count >= totalModels)
            const validCosts = item.modelCosts
                .filter(cost => cost.count !== undefined && cost.count >= totalModels);
            
            if (validCosts.length > 0) {
                // Sort by count ascending to find the smallest bracket that still covers totalModels
                validCosts.sort((a, b) => (a.count || 0) - (b.count || 0));
                // Use the smallest bracket (lowest count) that can accommodate the total
                return validCosts[0].cost;
            }
            
            // If no bracket can accommodate (totalModels exceeds all brackets), use the largest bracket
            const sortedCosts = [...item.modelCosts]
                .filter(cost => cost.count !== undefined)
                .sort((a, b) => (b.count || 0) - (a.count || 0));
            
            if (sortedCosts.length > 0) {
                return sortedCosts[0].cost;
            }
            
            // Fallback to first cost if no match found
            return item.modelCosts[0]?.cost ?? 0;
        }
        
        return 0;
    }, []);

    // Calculate total points based on composition counts for selected item
    const calculatedPoints = useMemo(() => {
        if (!selectedItem) return null;
        return calculateItemPoints(selectedItem);
    }, [selectedItem, calculateItemPoints]);

    // Calculate total points for the selected list
    const listTotalPoints = useMemo(() => {
        if (!selectedList) return 0;
        return selectedList.items.reduce((total, item) => {
            return total + calculateItemPoints(item);
        }, 0);
    }, [selectedList, calculateItemPoints]);

    // Get enhancements for the selected detachment, filtered by unit eligibility
    const detachmentEnhancements = useMemo(() => {
        if (!selectedList?.detachmentSlug || !factionData?.detachments) {
            return [];
        }
        
        const detachment = factionData.detachments.find(
            (d) => d.slug === selectedList.detachmentSlug
        );
        
        const allEnhancements = detachment?.enhancements || [];
        
        // Only show enhancements if the selected unit is a leader
        if (!selectedItem || !selectedItem.abilities?.some((ability) => ability.name === "Leader")) {
            return [];
        }
        
        // Get unit keywords for matching (normalize to uppercase, handle multi-word keywords)
        const unitKeywords = (selectedItem.keywords || []).map(k => k.keyword.toUpperCase().trim());
        
        // Helper function to strip HTML tags and normalize text
        const stripHtmlAndNormalize = (html: string): string => {
            return html
                .replace(/<[^>]*>/g, ' ') // Remove HTML tags
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim()
                .toUpperCase();
        };
        
        // Filter enhancements based on their description requirements
        return allEnhancements.filter(enhancement => {
            if (!enhancement.description) return true;
            
            // Strip HTML and normalize the description
            const normalizedDescription = stripHtmlAndNormalize(enhancement.description);
            
            // Check for "model only" pattern - extract keywords before "model only"
            const modelOnlyMatch = normalizedDescription.match(/(.+?)\s+MODEL\s+ONLY/i);
            if (modelOnlyMatch) {
                const requirementText = modelOnlyMatch[1].trim();
                
                // Handle "or" conditions (e.g., "WATCH MASTER or TECHMARINE")
                if (requirementText.includes(' OR ')) {
                    const keywords = requirementText.split(' OR ').map(k => k.trim());
                    // Unit must have at least one of the keywords
                    return keywords.some(keyword => {
                        // Check for exact match or if keyword is part of unit keyword
                        return unitKeywords.some(unitKeyword => {
                            // Handle multi-word keywords like "WATCH MASTER" matching "WATCH MASTER"
                            return unitKeyword === keyword || 
                                   unitKeyword.includes(keyword) || 
                                   keyword.includes(unitKeyword) ||
                                   // Handle cases where keyword might be split (e.g., "ADEPTUS ASTARTES" vs "ADEPTUS" and "ASTARTES")
                                   keyword.split(' ').every(word => unitKeyword.includes(word));
                        });
                    });
                } else {
                    // Single keyword requirement
                    const requiredKeyword = requirementText.trim();
                    // Check if any unit keyword matches
                    return unitKeywords.some(unitKeyword => {
                        // Exact match or contains match
                        return unitKeyword === requiredKeyword ||
                               unitKeyword.includes(requiredKeyword) ||
                               requiredKeyword.includes(unitKeyword) ||
                               // Handle multi-word requirements
                               requiredKeyword.split(' ').every(word => unitKeyword.includes(word));
                    });
                }
            }
            
            // If no "model only" restriction found, show the enhancement
            return true;
        });
    }, [selectedList, factionData, selectedItem]);
    
    return (
        <div className="min-h-screen bg-[#f5f5f5] p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Army Lists</h1>
                <p className="text-[#767676]">Create and manage your army lists</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column - Lists */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Your Lists</CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => setIsCreatingList(true)}
                                    className="h-8"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    New
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isCreatingList ? (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="list-name">List Name</Label>
                                        <Input
                                            id="list-name"
                                            value={newListName}
                                            onChange={(e) => setNewListName(e.target.value)}
                                            placeholder="Enter list name"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Select Faction</Label>
                                        <Popover
                                            open={factionSearchOpen}
                                            onOpenChange={setFactionSearchOpen}
                                        >
                                            <PopoverTrigger className="w-full">
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={factionSearchOpen}
                                                    className="w-full justify-between"
                                                >
                                                    {selectedFaction
                                                        ? selectedFaction.name
                                                        : "Select faction..."}
                                                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-full p-0 z-[100]"
                                                style={{
                                                    width: "var(--radix-popover-trigger-width)",
                                                }}
                                                side="bottom"
                                                align="start"
                                                sideOffset={8}
                                            >
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Search factions..."
                                                        value={factionSearchValue}
                                                        onValueChange={setFactionSearchValue}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            No faction found.
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {filteredFactions.map((faction) => (
                                                                <CommandItem
                                                                    key={faction.id}
                                                                    value={faction.name}
                                                                    onSelect={() => {
                                                                        setSelectedFaction(
                                                                            faction
                                                                        );
                                                                        setFactionSearchOpen(
                                                                            false
                                                                        );
                                                                        setFactionSearchValue(
                                                                            ""
                                                                        );
                                                                    }}
                                                                >
                                                                    {faction.name}
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="ml-2"
                                                                    >
                                                                        {faction.datasheetCount}{" "}
                                                                        units
                                                                    </Badge>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {selectedFaction && factionData?.detachments && factionData.detachments.length > 0 && (
                                        <div>
                                            <Label>Select Detachment</Label>
                                            <Popover
                                                open={detachmentSearchOpen}
                                                onOpenChange={setDetachmentSearchOpen}
                                            >
                                                <PopoverTrigger className="w-full">
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={detachmentSearchOpen}
                                                        className="w-full justify-between"
                                                    >
                                                        {selectedDetachment
                                                            ? selectedDetachment.name
                                                            : "Select detachment..."}
                                                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-full p-0 z-[100]"
                                                    style={{
                                                        width: "var(--radix-popover-trigger-width)",
                                                    }}
                                                    side="bottom"
                                                    align="start"
                                                    sideOffset={8}
                                                >
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Search detachments..."
                                                            value={detachmentSearchValue}
                                                            onValueChange={setDetachmentSearchValue}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                No detachment found.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {filteredDetachments.map((detachment) => (
                                                                    <CommandItem
                                                                        key={detachment.slug}
                                                                        value={detachment.name}
                                                                        onSelect={() => {
                                                                            setSelectedDetachment(
                                                                                detachment
                                                                            );
                                                                            setDetachmentSearchOpen(
                                                                                false
                                                                            );
                                                                            setDetachmentSearchValue(
                                                                                ""
                                                                            );
                                                                        }}
                                                                    >
                                                                        {detachment.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={createNewList}
                                            disabled={!selectedFaction || !newListName.trim()}
                                            className="flex-1"
                                        >
                                            Create List
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsCreatingList(false);
                                                setNewListName("");
                                                setSelectedFaction(null);
                                                setSelectedDetachment(null);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {lists.length === 0 ? (
                                        <p className="text-sm text-[#767676] text-center py-4">
                                            No lists yet. Create one to get started!
                                        </p>
                                    ) : (
                                        lists.map((list) => (
                                            <div
                                                key={list.id}
                                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    selectedList?.id === list.id
                                                        ? "bg-blue-50 border-blue-300"
                                                        : "bg-white border-[#e6e6e6] hover:border-blue-200"
                                                }`}
                                                onClick={() => {
                                                    setSelectedList(list);
                                                    setSelectedItem(null); // Clear selected item when switching lists
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-sm">
                                                            {list.name}
                                                        </h3>
                                                        <p className="text-xs text-[#767676] mt-1">
                                                            {list.factionName} | {list.detachmentName}
                                                        </p>
                                                        <p className="text-xs text-[#767676]">
                                                            {list.items.length} units
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteList(list.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Middle Column - List Details */}
                <div className="lg:col-span-1">
                    {selectedList ? (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{selectedList.name}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {selectedList.factionName} | {selectedList.detachmentName} • {listTotalPoints} points
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Add Datasheet */}
                                    <div>
                                        <Label>Add Unit</Label>
                                        <Popover
                                            open={datasheetSearchOpen}
                                            onOpenChange={setDatasheetSearchOpen}
                                            modal={true}
                                        >
                                            <PopoverTrigger className="w-full">
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={datasheetSearchOpen}
                                                    className="w-full justify-between mt-1"
                                                >
                                                    <span className="text-muted-foreground">
                                                        Search for a unit to add...
                                                    </span>
                                                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-full p-0 z-[100]"
                                                style={{
                                                    width: "var(--radix-popover-trigger-width)",
                                                }}
                                                side="bottom"
                                                align="start"
                                                sideOffset={8}
                                            >
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Search datasheets..."
                                                        value={datasheetSearchValue}
                                                        onValueChange={setDatasheetSearchValue}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            No datasheet found.
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {filteredDatasheets.map(
                                                                (datasheet) => (
                                                                    <CommandItem
                                                                        key={datasheet.id}
                                                                        value={datasheet.name}
                                                                        onSelect={() => {
                                                                            addDatasheetToList(
                                                                                datasheet
                                                                            );
                                                                            setDatasheetSearchOpen(
                                                                                false
                                                                            );
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <div>
                                                                                <div className="font-medium">
                                                                                    {
                                                                                        datasheet.name
                                                                                    }
                                                                                </div>
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    {
                                                                                        datasheet.roleLabel
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                            {datasheet.isLegends && (
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="ml-2"
                                                                                >
                                                                                    Legends
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </CommandItem>
                                                                )
                                                            )}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* List Items */}
                                    <div>
                                        <Label>Units in List</Label>
                                        {selectedList.items.length === 0 ? (
                                            <p className="text-sm text-[#767676] text-center py-8 border border-dashed rounded-lg mt-2">
                                                No units added yet. Use the search above to add
                                                units.
                                            </p>
                                        ) : (
                                            <div className="space-y-2 mt-2">
                                                {orderedListItems.map((item, index) => {
                                                    const isSelected = selectedItem?.listItemId === item.listItemId;
                                                    const isLeader = !!item.leading;
                                                    const isAttachedUnit = !!item.leadBy;
                                                    
                                                    // Check if this is part of a leader/unit pair
                                                    const prevItem = orderedListItems[index - 1];
                                                    const nextItem = orderedListItems[index + 1];
                                                    const isGroupedWithPrev = isAttachedUnit && prevItem?.leading?.id === item.id && prevItem?.leading?.name === item.name;
                                                    const isGroupedWithNext = isLeader && nextItem?.leadBy?.id === item.id && nextItem?.leadBy?.name === item.name;
                                                    
                                                    return (
                                                        <div
                                                            key={item.listItemId}
                                                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                                                                isSelected
                                                                    ? "bg-blue-50 border-blue-300"
                                                                    : "bg-white border-[#e6e6e6] hover:border-blue-200"
                                                            } ${isGroupedWithNext ? "mb-0 rounded-b-none border-b-0" : ""} ${isGroupedWithPrev ? "rounded-t-none" : ""}`}
                                                            onClick={() => setSelectedItem(item)}
                                                        >
                                                            <div className="flex-col flex flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-sm">{item.name}</span>
                                                                    {isLeader && (
                                                                        <Badge variant="outline" className="text-xs bg-green-100 border-green-300 text-green-700">
                                                                            Leader
                                                                        </Badge>
                                                                    )}
                                                                    {isAttachedUnit && (
                                                                        <Badge variant="outline" className="text-xs bg-blue-100 border-blue-300 text-blue-700">
                                                                            Attached
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm">{calculateItemPoints(item)} points</span>
                                                            </div>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeItemFromList(item.listItemId);
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )
                                                })
                                            }
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <p className="text-[#767676] mb-2">
                                        Select a list from the left or create a new one
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                    
                {/* Right Column - Unit Details */}
                <div className="lg:col-span-2">
                    {selectedItem ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>{selectedItem.name}</CardTitle>
                                <CardDescription>
                                    {selectedItem.roleLabel} • {calculatedPoints ?? selectedItem.modelCosts?.[0]?.cost ?? 0} points
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Legend */}
                                {selectedItem.legend && (
                                    <p className="text-sm text-[#767676] italic" dangerouslySetInnerHTML={{ __html: selectedItem.legend }} />
                                )}

                                {/* Keywords */}
                                {selectedItem.keywords && selectedItem.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedItem.keywords.map((keyword, idx) => (
                                            <Badge key={idx} variant={keyword.isFactionKeyword === "true" ? "default" : "secondary"}>
                                                {keyword.keyword}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Models */}
                                {selectedItem.models && selectedItem.models.length > 0 && (
                                    <div className="space-y-3">
                                        {selectedItem.models.map((model, idx) => (
                                            <div key={idx} className="border border-[#e6e6e6] rounded-lg p-3 bg-white">
                                                <div className="font-medium text-sm mb-2">{model.name || "Model"}</div>
                                                <div className="grid grid-cols-6 gap-2 text-xs">
                                                    <div>
                                                        <div className="font-semibold">M</div>
                                                        <div>{model.m}"</div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">T</div>
                                                        <div>{model.t}</div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">Sv</div>
                                                        <div>{model.sv}{typeof model.sv === 'number' ? "+" : ""}</div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">W</div>
                                                        <div>{model.w}</div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">Ld</div>
                                                        <div>{model.ld}{typeof model.ld === 'number' ? "+" : ""}</div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">OC</div>
                                                        <div>{model.oc}</div>
                                                    </div>
                                                </div>
                                                {model.invSv && (
                                                    <div className="mt-2 text-xs">
                                                        <span className="font-semibold">Invulnerable Save: </span>
                                                        <span>{model.invSv}+</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}


                                {/* Unit Composition */}
                                {selectedItem.unitComposition && selectedItem.unitComposition.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-sm mb-2">Unit Composition</h3>
                                        <div className="space-y-3">
                                            {selectedItem.unitComposition.map((composition, idx) => {
                                                const line = composition.line || idx + 1;
                                                const min = composition.min ?? 0;
                                                const max = composition.max ?? 999;
                                                
                                                // Initialize count to min if not set
                                                const currentCount = selectedItem.compositionCounts?.[line] ?? min;
                                                
                                                const handleCountChange = (newCount: number) => {
                                                    if (!selectedList || !selectedItem) return;
                                                    
                                                    // Clamp value between min and max
                                                    const clampedCount = Math.max(min, Math.min(max, newCount));
                                                    
                                                    const updatedItems = selectedList.items.map(item => {
                                                        if (item.listItemId === selectedItem.listItemId) {
                                                            return {
                                                                ...item,
                                                                compositionCounts: {
                                                                    ...item.compositionCounts,
                                                                    [line]: clampedCount
                                                                }
                                                            };
                                                        }
                                                        return item;
                                                    });
                                                    
                                                    const updatedList: ArmyList = {
                                                        ...selectedList,
                                                        items: updatedItems,
                                                        updatedAt: Date.now(),
                                                    };
                                                    
                                                    const updatedLists = lists.map((l) => (l.id === selectedList.id ? updatedList : l));
                                                    setLists(updatedLists);
                                                    setSelectedList(updatedList);
                                                    
                                                    // Update selected item
                                                    const updatedSelectedItem = updatedItems.find(item => item.listItemId === selectedItem.listItemId);
                                                    if (updatedSelectedItem) {
                                                        setSelectedItem(updatedSelectedItem);
                                                    }
                                                };
                                                
                                                return (
                                                    <div key={idx} className="border border-[#e6e6e6] rounded-lg p-3 bg-white">
                                                        <div className="flex items-center justify-between">
                                                            <div className="font-medium text-sm mb-1" dangerouslySetInnerHTML={{ __html: composition.description }} />
                                                            <div className="ml-4">
                                                                <Input
                                                                    type="number"
                                                                    min={min}
                                                                    max={max}
                                                                    value={currentCount}
                                                                    disabled={max === min}
                                                                    onChange={(e) => {
                                                                        const value = parseInt(e.target.value, 10);
                                                                        if (!isNaN(value)) {
                                                                            handleCountChange(value);
                                                                        }
                                                                    }}
                                                                    className="w-20 text-center"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Loadout */}
                                {selectedItem.loadout && (
                                    <div>
                                        <h3 className="font-semibold text-sm mb-2">Loadout</h3>
                                        <p className="text-sm" dangerouslySetInnerHTML={{ __html: selectedItem.loadout }} />
                                    </div>
                                )}

                                {/* Wargear */}
                                {selectedItem.wargear && selectedItem.wargear.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-sm mb-2">Wargear</h3>
                                        <div className="space-y-2">
                                            {selectedItem.wargear.map((weapon, idx) => (
                                                <div key={idx} className="border border-[#e6e6e6] rounded-lg p-3 bg-white">
                                                    <div className="font-medium text-sm mb-2">{weapon.name}</div>
                                                    {weapon.profiles && weapon.profiles.length > 0 && (
                                                        <div className="space-y-2">
                                                            {weapon.profiles.map((profile, pIdx) => (
                                                                <div key={pIdx} className="text-xs">
                                                                    <div className="grid grid-cols-6 gap-2 mb-1 font-semibold">
                                                                        <div>Range</div>
                                                                        <div>A</div>
                                                                        <div>BS</div>
                                                                        <div>S</div>
                                                                        <div>AP</div>
                                                                        <div>D</div>
                                                                    </div>
                                                                    <div className="grid grid-cols-6 gap-2">
                                                                        <div>{profile.range > 0 ? `${profile.range}"` : "Melee"}</div>
                                                                        <div>{profile.a}</div>
                                                                        <div>{profile.bsWs}{profile.bsWs !== "N/A" ? "+" : ""}</div>
                                                                        <div>{profile.s}</div>
                                                                        <div>{profile.ap}</div>
                                                                        <div>{profile.d}</div>
                                                                    </div>
                                                                    {profile.attributes && profile.attributes.length > 0 && (
                                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                                            {profile.attributes.map((attr, aIdx) => (
                                                                                <Badge key={aIdx} variant="outline" className="text-xs">
                                                                                    {attr}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Weapon Options */}
                                {selectedItem.options && selectedItem.options.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-sm mb-2">Weapon Options</h3>
                                        <div className="space-y-3">
                                            {selectedItem.options.map((option, idx) => (
                                                <div key={option.line || idx} className="border border-[#e6e6e6] rounded-lg p-3 bg-white">
                                                    <div className="text-sm" dangerouslySetInnerHTML={{ __html: option.description }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Transport */}
                                {selectedItem.transport && (
                                    <div>
                                        <h3 className="font-semibold text-sm mb-2">Transport</h3>
                                        <p className="text-sm" dangerouslySetInnerHTML={{ __html: selectedItem.transport }} />
                                    </div>
                                )}
                                
                                {/* Can Lead */}
                                {selectedItem.abilities?.some((ability) => ability.name === "Leader") && (
                                    <div>
                                        <h3 className="font-semibold text-sm mb-2">Can Lead</h3>
                                        {loadingBodyguards ? (
                                            <p className="text-sm text-[#767676]">Loading...</p>
                                        ) : bodyguardUnits.length > 0 ? (
                                            <div className="space-y-4">
                                                {/* Units in List */}
                                                {unitsInList.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-xs text-[#767676] mb-2">
                                                            In Your List ({unitsInList.length})
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {unitsInList.map((listItem) => {
                                                                const isAttached = selectedItem?.leading?.id === listItem.id && 
                                                                                   selectedItem?.leading?.name === listItem.name;
                                                                return (
                                                                    <div
                                                                        key={listItem.listItemId}
                                                                        className={`border rounded-lg p-3 bg-white ${
                                                                            isAttached ? 'border-green-500 bg-green-50' : 'border-[#e6e6e6]'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex-1">
                                                                                <div className="font-medium text-sm">{listItem.name}</div>
                                                                                <div className="text-xs text-[#767676] mt-1">
                                                                                    {listItem.roleLabel}
                                                                                </div>
                                                                                {isAttached && (
                                                                                    <div className="text-xs text-green-600 mt-1 font-medium">
                                                                                        ✓ Attached
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {selectedItem && (
                                                                                <Button
                                                                                    variant={isAttached ? "outline" : "default"}
                                                                                    size="sm"
                                                                                    className="ml-2 h-8"
                                                                                    onClick={() => {
                                                                                        if (isAttached) {
                                                                                            detachLeaderFromUnit(selectedItem.listItemId);
                                                                                        } else {
                                                                                            attachLeaderToUnit(selectedItem.listItemId, listItem.listItemId);
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    {isAttached ? "Detach" : "Attach"}
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Units Not in List */}
                                                {unitsNotInList.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-xs text-[#767676] mb-2">
                                                            Not in List ({unitsNotInList.length})
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {unitsNotInList.map((unit) => (
                                                                <div
                                                                    key={unit.id}
                                                                    className="border border-[#e6e6e6] rounded-lg p-3 bg-white"
                                                                >
                                                                    <div className="font-medium text-sm">{unit.name}</div>
                                                                    <div className="text-xs text-[#767676] mt-1">
                                                                        {unit.roleLabel}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-[#767676]">
                                                This unit cannot lead any units.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Abilities */}
                                {selectedItem.abilities && selectedItem.abilities.filter(ability => ability.name !== "Leader").length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-sm mb-2">Abilities</h3>
                                        <div className="space-y-3">
                                            {selectedItem.abilities
                                                .filter(ability => ability.name !== "Leader")
                                                .map((ability, idx) => (
                                                <div key={idx} className="border border-[#e6e6e6] rounded-lg p-3 bg-white">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <div className="font-medium text-sm">{ability.name}</div>
                                                        {ability.type && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {ability.type}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {ability.legend && (
                                                        <p className="text-xs text-[#767676] italic mb-2">{ability.legend}</p>
                                                    )}
                                                    {ability.description && (
                                                        <div className="text-sm" dangerouslySetInnerHTML={{ __html: ability.description }} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Enhancements */}
                                {detachmentEnhancements.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-sm mb-2">Enhancement Options</h3>
                                        <div className="space-y-3">
                                            {detachmentEnhancements.map((enhancement, idx) => (
                                                <div key={enhancement.id || idx} className="border border-[#e6e6e6] rounded-lg p-3 bg-white">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <div className="font-medium text-sm">{enhancement.name}</div>
                                                        {enhancement.cost && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {enhancement.cost} pts
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {enhancement.legend && (
                                                        <p className="text-xs text-[#767676] italic mb-2" dangerouslySetInnerHTML={{ __html: enhancement.legend }} />
                                                    )}
                                                    {enhancement.description && (
                                                        <div className="text-sm" dangerouslySetInnerHTML={{ __html: enhancement.description }} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <p className="text-[#767676] mb-2">
                                        Select a unit from the list to view details
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

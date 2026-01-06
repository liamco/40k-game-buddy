import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, X, Search } from "lucide-react";
import { Popover, PopoverTrigger, PopoverPortal, PopoverContent } from "@radix-ui/react-popover";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./ui/command";

import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { getAllFactions, loadFactionData, getFactionBySlug, loadDatasheetData } from "../utils/depotDataLoader";
import type { Faction, FactionIndex, ArmyList, ArmyListItem, Datasheet, Detachment } from "../types";

const STORAGE_KEY = "battle-cogitator-army-lists";

export function ListsManager() {
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
                const newItem: ArmyListItem = {
                    ...fullDatasheet,
                    name: `${baseName} ${getSuffixLetter(newSuffixIndex)}`,
                    listItemId: `${datasheet.id}-${Date.now()}`,
                    pointsCost: datasheet.modelCosts,
                };
                
                updatedItems.push(newItem);
            } else {
                // No duplicates, add as-is
                const newItem: ArmyListItem = {
                    ...fullDatasheet,
                    listItemId: `${datasheet.id}-${Date.now()}`,
                    pointsCost: datasheet.modelCosts,
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

        const updatedList: ArmyList = {
            ...selectedList,
            items: selectedList.items.filter((item) => item.listItemId !== itemId),
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

    const deleteList = (listId: string) => {
        const updatedLists = lists.filter((l) => l.id !== listId);
        setLists(updatedLists);
        if (selectedList?.id === listId) {
            setSelectedList(null);
        }
    };

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
                                            {selectedList.factionName} | {selectedList.detachmentName}
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
                                                {selectedList.items.map((item) => {
                                                    const isSelected = selectedItem?.listItemId === item.listItemId;
                                                    return (
                                                        <div
                                                            key={item.listItemId}
                                                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                                                                isSelected
                                                                    ? "bg-blue-50 border-blue-300"
                                                                    : "bg-white border-[#e6e6e6] hover:border-blue-200"
                                                            }`}
                                                            onClick={() => setSelectedItem(item)}
                                                        >
                                                            <div className="flex-col flex flex-1">
                                                                <span className="font-medium text-sm">{item.name}</span>
                                                                <span className="text-sm">{item.modelCosts?.[0]?.cost} points</span>
                                                            </div>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() =>
                                                                    removeItemFromList(item.listItemId)
                                                                }
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
                                    {selectedItem.roleLabel} • {selectedItem.modelCosts?.[0]?.cost} points
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
                                            <div className="space-y-2">
                                                {bodyguardUnits.map((unit) => (
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
                                        ) : (
                                            <p className="text-sm text-[#767676]">
                                                This unit cannot lead any units.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Abilities */}
                                {selectedItem.abilities && selectedItem.abilities.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-sm mb-2">Abilities</h3>
                                        <div className="space-y-3">
                                            {selectedItem.abilities.map((ability, idx) => (
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

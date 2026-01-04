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

    const addDatasheetToList = (datasheet: Datasheet) => {
        if (!selectedList) return;
        
        // Load the full datasheet JSON file
        loadDatasheetData(selectedList.factionSlug, datasheet.id).then((fullDatasheet) => {
            if (!fullDatasheet) {
                console.error("Failed to load full datasheet data");
                return;
            }
            
            const newItem: ArmyListItem = {
                ...fullDatasheet,
                listItemId: `${datasheet.id}-${Date.now()}`,
                pointsCost: datasheet.modelCosts,
                quantity: 1,
            };
            
            const updatedList: ArmyList = {
                ...selectedList,
                items: [...selectedList.items, newItem],
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
    };

    const deleteList = (listId: string) => {
        const updatedLists = lists.filter((l) => l.id !== listId);
        setLists(updatedLists);
        if (selectedList?.id === listId) {
            setSelectedList(null);
        }
    };

    const updateItemQuantity = (itemId: string, quantity: number) => {
        if (!selectedList || quantity < 1) return;

        const updatedList: ArmyList = {
            ...selectedList,
            items: selectedList.items.map((item) =>
                item.listItemId === itemId ? { ...item, quantity } : item
            ),
            updatedAt: Date.now(),
        };

        const updatedLists = lists.map((l) => (l.id === selectedList.id ? updatedList : l));
        setLists(updatedLists);
        setSelectedList(updatedList);
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] p-6">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Army Lists</h1>
                    <p className="text-[#767676]">Create and manage your army lists</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                                    onClick={() => setSelectedList(list)}
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

                    {/* Right Column - List Details */}
                    <div className="lg:col-span-2">
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
                                                        console.log(item);
                                                        return (
                                                            <div
                                                                key={item.listItemId}
                                                                className="flex items-center justify-between p-3 bg-white border border-[#e6e6e6] rounded-lg"
                                                            >
                                                                <div className="flex-col flex">
                                                                    <span className="font-medium text-sm">{item.name}</span>
                                                                    <span className="text-sm">{item.modelCosts?.[0]?.cost} points</span>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        value={item.quantity || 1}
                                                                        onChange={(e) =>
                                                                            updateItemQuantity(
                                                                                item.listItemId,
                                                                                parseInt(
                                                                                    e.target.value
                                                                                ) || 1
                                                                            )
                                                                        }
                                                                        className="w-16 h-8"
                                                                    />
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
                </div>
            </div>
        </div>
    );
}

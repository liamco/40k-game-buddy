import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";

import { Badge } from "../../components/_ui/badge";
import { Button } from "../../components/_ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/_ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../components/_ui/command";
import { Input } from "../../components/_ui/input";
import { Label } from "../../components/_ui/label";

import { loadFactionData } from "../../utils/depotDataLoader";
import type { Faction, FactionIndex, Detachment } from "../../types";

import { useListManager } from "./ListManagerContext";

export function NewList() {
    const navigate = useNavigate();
    const { factions, createList } = useListManager();

    const [factionSearchOpen, setFactionSearchOpen] = useState(false);
    const [detachmentSearchOpen, setDetachmentSearchOpen] = useState(false);
    const [selectedFaction, setSelectedFaction] = useState<FactionIndex | null>(null);
    const [selectedDetachment, setSelectedDetachment] = useState<Detachment | null>(null);
    const [factionData, setFactionData] = useState<Faction | null>(null);
    const [factionSearchValue, setFactionSearchValue] = useState("");
    const [detachmentSearchValue, setDetachmentSearchValue] = useState("");
    const [newListName, setNewListName] = useState("");

    // Load faction data when a faction is selected
    useEffect(() => {
        if (selectedFaction) {
            loadFactionData(selectedFaction.slug).then((data) => {
                if (data) {
                    setFactionData(data);
                }
            });
            setSelectedDetachment(null);
        } else {
            setFactionData(null);
            setSelectedDetachment(null);
        }
    }, [selectedFaction]);

    const filteredFactions = useMemo(() => {
        if (!factionSearchValue) return factions;
        const search = factionSearchValue.toLowerCase();
        return factions.filter((f) => f.name.toLowerCase().includes(search) || f.slug.toLowerCase().includes(search));
    }, [factions, factionSearchValue]);

    const filteredDetachments = useMemo(() => {
        if (!factionData?.detachments || !detachmentSearchValue) {
            return factionData?.detachments || [];
        }
        const search = detachmentSearchValue.toLowerCase();
        return factionData.detachments.filter((d) => d.name.toLowerCase().includes(search) || d.slug.toLowerCase().includes(search));
    }, [factionData, detachmentSearchValue]);

    const handleCreateList = () => {
        if (!selectedFaction || !newListName.trim()) return;

        const newList = createList(newListName, selectedFaction, selectedDetachment?.slug, selectedDetachment?.name);
        navigate(`/lists/view/${newList.id}`);
    };

    const handleCancel = () => {
        navigate("/lists");
    };

    return (
        <Card className="max-w-lg">
            <CardHeader>
                <CardTitle>Create New List</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="list-name">List Name</Label>
                        <Input id="list-name" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Enter list name" className="mt-1" />
                    </div>
                    <div>
                        <Label>Select Faction</Label>
                        <Popover open={factionSearchOpen} onOpenChange={setFactionSearchOpen}>
                            <PopoverTrigger className="w-full">
                                <Button variant="outline" role="combobox" aria-expanded={factionSearchOpen} className="w-full justify-between">
                                    {selectedFaction ? selectedFaction.name : "Select faction..."}
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
                                    <CommandInput placeholder="Search factions..." value={factionSearchValue} onValueChange={setFactionSearchValue} />
                                    <CommandList>
                                        <CommandEmpty>No faction found.</CommandEmpty>
                                        <CommandGroup>
                                            {filteredFactions.map((faction) => (
                                                <CommandItem
                                                    key={faction.id}
                                                    value={faction.name}
                                                    onSelect={() => {
                                                        setSelectedFaction(faction);
                                                        setFactionSearchOpen(false);
                                                        setFactionSearchValue("");
                                                    }}
                                                >
                                                    {faction.name}
                                                    <Badge variant="secondary" className="ml-2">
                                                        {faction.datasheetCount} units
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
                            <Popover open={detachmentSearchOpen} onOpenChange={setDetachmentSearchOpen}>
                                <PopoverTrigger className="w-full">
                                    <Button variant="outline" role="combobox" aria-expanded={detachmentSearchOpen} className="w-full justify-between">
                                        {selectedDetachment ? selectedDetachment.name : "Select detachment..."}
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
                                        <CommandInput placeholder="Search detachments..." value={detachmentSearchValue} onValueChange={setDetachmentSearchValue} />
                                        <CommandList>
                                            <CommandEmpty>No detachment found.</CommandEmpty>
                                            <CommandGroup>
                                                {filteredDetachments.map((detachment) => (
                                                    <CommandItem
                                                        key={detachment.slug}
                                                        value={detachment.name}
                                                        onSelect={() => {
                                                            setSelectedDetachment(detachment);
                                                            setDetachmentSearchOpen(false);
                                                            setDetachmentSearchValue("");
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
                    <div className="flex gap-2 pt-4">
                        <Button onClick={handleCreateList} disabled={!selectedFaction || !selectedDetachment || !newListName.trim()} className="flex-1">
                            Create List
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default NewList;

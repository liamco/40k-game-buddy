import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Badge } from "../../components/_ui/badge";
import { Button } from "../../components/_ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/_ui/card";
import { Input } from "../../components/_ui/input";
import { Label } from "../../components/_ui/label";
import SearchableDropdown, { type SearchableDropdownOption } from "../../components/SearchableDropdown/SearchableDropdown";

import { loadFactionData } from "../../utils/depotDataLoader";
import type { Faction, FactionIndex, Detachment } from "../../types";

import { useListManager } from "./ListManagerContext";

export function NewList() {
    const navigate = useNavigate();
    const { factions, createList } = useListManager();

    const [selectedFaction, setSelectedFaction] = useState<FactionIndex | null>(null);
    const [selectedDetachment, setSelectedDetachment] = useState<Detachment | null>(null);
    const [factionData, setFactionData] = useState<Faction | null>(null);
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

    // Convert factions to dropdown options
    const factionOptions = useMemo((): SearchableDropdownOption<FactionIndex>[] => {
        return factions.map((faction) => ({
            id: faction.id,
            searchValue: `${faction.name} ${faction.slug}`,
            data: faction,
        }));
    }, [factions]);

    // Convert detachments to dropdown options
    const detachmentOptions = useMemo((): SearchableDropdownOption<Detachment>[] => {
        if (!factionData?.detachments) return [];
        return factionData.detachments.map((detachment) => ({
            id: detachment.slug,
            searchValue: `${detachment.name} ${detachment.slug}`,
            data: detachment,
        }));
    }, [factionData]);

    const handleCreateList = () => {
        if (!selectedFaction || !newListName.trim()) return;

        const newList = createList(newListName, selectedFaction, selectedDetachment?.slug, selectedDetachment?.name);
        navigate(`/lists/view/${newList.id}`);
    };

    const handleCancel = () => {
        navigate("/lists");
    };

    return (
        <div className="w-full py-24">
            <Card className="max-w-lg m-auto">
                <CardHeader>
                    <CardTitle>Create New List</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="list-name">List Name</Label>
                            <Input id="list-name" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Enter list name" className="mt-1" />
                        </div>
                        <div className="space-y-1">
                            <Label>Select Faction</Label>
                            <SearchableDropdown
                                options={factionOptions}
                                selectedLabel={selectedFaction?.name}
                                placeholder="Select faction..."
                                searchPlaceholder="Search factions..."
                                emptyMessage="No faction found."
                                onSelect={setSelectedFaction}
                                renderOption={(faction) => (
                                    <div className="flex items-center justify-between w-full">
                                        {faction.name}
                                        <Badge variant="secondary" className="ml-2">
                                            {faction.datasheetCount} units
                                        </Badge>
                                    </div>
                                )}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Select Detachment</Label>
                            <SearchableDropdown
                                options={detachmentOptions}
                                selectedLabel={selectedDetachment?.name}
                                placeholder="Select detachment..."
                                searchPlaceholder="Search detachments..."
                                emptyMessage="No detachment found."
                                onSelect={setSelectedDetachment}
                                renderOption={(detachment) => detachment.name}
                                disabled={selectedFaction && factionData?.detachments && factionData.detachments.length ? false : true}
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button variant="ghostSecondary" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateList} disabled={!selectedFaction || !selectedDetachment || !newListName.trim()} className="flex-1">
                                Create List
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default NewList;

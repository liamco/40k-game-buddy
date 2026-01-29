import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { loadFactionData } from "../../utils/depotDataLoader";
import type { Detachment } from "#types/Detachments.tsx";
import type { Faction, FactionIndex } from "#types/Factions.tsx";

import { useListManager } from "./ListManagerContext";

import { Badge } from "#components/Badge/Badge.tsx";
import { Button } from "#components/Button/Button.tsx";
import { Input } from "#components/Input/Input.tsx";
import Dropdown, { DropdownOption } from "#components/Dropdown/Dropdown.tsx";
import IconCrossedSwords from "#components/icons/IconCrossedSwords.tsx";
import BaseIcon from "#components/icons/BaseIcon.tsx";

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
    const factionOptions = useMemo((): DropdownOption<FactionIndex>[] => {
        return factions.map((faction) => ({
            id: faction.id,
            label: faction.name,
            data: faction,
        }));
    }, [factions]);

    // Convert detachments to dropdown options
    const detachmentOptions = useMemo((): DropdownOption<Detachment>[] => {
        if (!factionData?.detachments) return [];
        return factionData.detachments.map((detachment) => ({
            id: detachment.slug,
            label: detachment.name,
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
        <div className="space-y-12 w-full h-full items-center justify-center flex flex-col border-1 border-skarsnikGreen">
            <div className="text-center space-y-4">
                <BaseIcon size="large">
                    <IconCrossedSwords />
                </BaseIcon>
                <h1 className="text-title-xl">New roster</h1>
            </div>
            <div className="space-y-6 w-full max-w-[400px]">
                <div className="space-y-2">
                    <label htmlFor="list-name" className="block">
                        List Name
                    </label>
                    <Input id="list-name" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Enter list name" className="mt-1" />
                </div>
                <div className="space-y-2">
                    <label className="block">Select Faction</label>
                    <Dropdown
                        searchable
                        options={factionOptions}
                        selectedLabel={selectedFaction?.name}
                        placeholder="Select faction..."
                        searchPlaceholder="Search factions..."
                        emptyMessage="No faction found."
                        onSelect={setSelectedFaction}
                        renderOption={(faction: FactionIndex) => (
                            <div className="flex items-center justify-between w-full">
                                {faction.name}
                                <Badge variant="secondary" className="ml-2">
                                    {faction.datasheetCount} units
                                </Badge>
                            </div>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block">Select Detachment</label>
                    <Dropdown
                        options={detachmentOptions}
                        searchable
                        selectedLabel={selectedDetachment?.name}
                        placeholder="Select detachment..."
                        searchPlaceholder="Search detachments..."
                        emptyMessage="No detachment found."
                        onSelect={setSelectedDetachment}
                        renderOption={(detachment: Detachment) => detachment.name}
                        disabled={selectedFaction && factionData?.detachments && factionData.detachments.length ? false : true}
                    />
                </div>

                <div className="flex gap-2">
                    <Button variant="ghostSecondary" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateList} disabled={!selectedFaction || !selectedDetachment || !newListName.trim()} className="flex-1">
                        Create List
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default NewList;

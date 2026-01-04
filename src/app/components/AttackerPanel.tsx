import React, { useState, useEffect, useMemo } from "react";
import { Info, Search } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { Button } from "./ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./ui/command";
import type { Weapon, Modifiers, ArmyList, Datasheet, Faction, WeaponProfile, GamePhase } from "../types";
import { loadFactionData } from "../utils/depotDataLoader";
import { parseAttributes } from "../utils/parseAttributes";
import WeaponProfileCard from "./WeaponProfileCard/WeaponProfileCard";
import { Switch } from "./ui/switch";

interface AttackerPanelProps {
    gamePhase: GamePhase;
    unit: Datasheet | null;
    onUnitChange: (unit: Datasheet) => void;
    selectedWeaponProfile: WeaponProfile | null;
    onWeaponProfileChange: (weapon: WeaponProfile | null) => void;
    modifiers: Modifiers;
    onModifiersChange: (modifiers: Modifiers) => void;
    selectedList: ArmyList | null;
}

export function AttackerPanel({
    gamePhase,
    unit,
    onUnitChange,
    selectedWeaponProfile,
    onWeaponProfileChange,
    modifiers,
    onModifiersChange,
    selectedList,
}: AttackerPanelProps) {
    const [factionData, setFactionData] = useState<Faction | null>(null);
    const [unitSearchOpen, setUnitSearchOpen] = useState(false);
    const [unitSearchValue, setUnitSearchValue] = useState("");

    // Load faction data when list changes
    useEffect(() => {
        if (selectedList) {
            loadFactionData(selectedList.factionSlug).then((data) => {
                if (data) {
                    setFactionData(data);
                }
            });
        } else {
            setFactionData(null);
        }
    }, [selectedList]);

    // Get datasheets from the selected list
    const availableDatasheets = useMemo(() => {
        if (!factionData || !selectedList) return [];
        const listDatasheetIds = new Set(selectedList.items.map((item) => item.id));
        return factionData.datasheets.filter((ds) => listDatasheetIds.has(ds.id));
    }, [factionData, selectedList]);

    // Filter datasheets based on search
    const filteredDatasheets = useMemo(() => {
        if (!unitSearchValue) return availableDatasheets;
        const search = unitSearchValue.toLowerCase();
        return availableDatasheets.filter(
            (ds) =>
                ds.name.toLowerCase().includes(search) ||
                ds.roleLabel.toLowerCase().includes(search)
        );
    }, [availableDatasheets, unitSearchValue]);

    return (
        <div className="bg-[#e6e6e6] rounded-[8px] p-6 space-y-4">
            <div className="space-y-2">
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-[#1e1e1e]">
                    Attacking unit
                </p>
                {!selectedList ? (
                    <div className="w-full bg-white rounded-[8px] border border-[#d9d9d9] px-4 py-3 font-['Inter:Regular',sans-serif] text-[14px] text-[#767676]">
                        Select an attacker list above
                    </div>
                ) : (
                    <Popover open={unitSearchOpen} onOpenChange={setUnitSearchOpen} modal={true}>
                        <PopoverTrigger className="w-full">
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={unitSearchOpen}
                                className="w-full justify-between bg-white rounded-[8px] border border-[#d9d9d9] px-4 py-3 h-auto font-['Inter:Regular',sans-serif] text-[14px]"
                            >
                                <span className="text-muted-foreground">
                                    {unit ? unit.name : "Search for a unit..."}
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
                                    placeholder="Search units..."
                                    value={unitSearchValue}
                                    onValueChange={setUnitSearchValue}
                                />
                                <CommandList>
                                    <CommandEmpty>No unit found.</CommandEmpty>
                                    <CommandGroup>
                                        {filteredDatasheets.map((datasheet) => (
                                            <CommandItem
                                                key={datasheet.id}
                                                value={datasheet.name}
                                                onSelect={() => {
                                                    onUnitChange(datasheet);
                                                    onWeaponProfileChange(null);
                                                    setUnitSearchOpen(false);
                                                    setUnitSearchValue("");
                                                }}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div>
                                                        <div className="font-medium">
                                                            {datasheet.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {datasheet.roleLabel}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            {unit && unit.wargear.length > 0 && (
                <div className="space-y-2">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[12px] text-[#1e1e1e]">
                        Select weapon
                    </p>
                    {unit.wargear.filter((weapon) => weapon.type === "Ranged").map((weapon:Weapon) => (
                        <div>
                            {
                                weapon.profiles.map((profile:WeaponProfile)=>{
                                    const isSelected = selectedWeaponProfile?.name === profile.name;

                                    return (
                                        <WeaponProfileCard 
                                            key={profile.name} 
                                            profile={profile} 
                                            isSelected={isSelected} 
                                            onWeaponProfileChange={onWeaponProfileChange}
                                        />
                                    )
                                })
                            }
                        </div>
                    ))}
                </div>
            )}
            
            <hr className="border-[#d9d9d9] border-1" />

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <label htmlFor="stationary-this-turn" className="text-xs font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#1e1e1e]">stationary this turn</label>
                    <Switch id="stationary-this-turn" onCheckedChange={(e) => {onModifiersChange({ ...modifiers, stationaryThisTurn: e })}} />
                </div>
                <div className="flex items-center justify-between gap-2">
                    <label htmlFor="in-objective-range" className="text-xs font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#1e1e1e]">In range of objective</label>
                    <Switch id="in-objective-range"  onCheckedChange={(e) => {onModifiersChange({ ...modifiers, inRangeOfObjective: e })}}  />
                </div>    
            </div>
            

        </div>
    );
}

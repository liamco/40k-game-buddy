import React, { useState, useEffect, useMemo, Fragment } from "react";
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
import type { Weapon, Modifiers, ArmyList, Datasheet, Faction, WeaponProfile, GamePhase, ArmyListItem } from "../types";
import { loadFactionData } from "../utils/depotDataLoader";
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

    // Combine leaders with their attached units into single items
    const combinedListItems = useMemo(() => {
        if (!selectedList) return [];
        
        const items = selectedList.items;
        const processed = new Set<string>();
        const combined: Array<{ item: ArmyListItem; displayName: string; isCombined: boolean }> = [];
        
        // First pass: Process all leaders and their attached units
        items.forEach(item => {
            // Skip if already processed
            if (processed.has(item.listItemId)) return;
            
            // If this is a leader with an attached unit
            if (item.leading) {
                // Find the attached unit (without checking processed, since we process leaders first)
                const attachedUnit = items.find(u => 
                    u.id === item.leading?.id && 
                    u.name === item.leading?.name
                );
                
                if (attachedUnit && !processed.has(attachedUnit.listItemId)) {
                    // Combine leader and attached unit
                    combined.push({
                        item: item, // Use leader as the main item
                        displayName: `${item.name} + ${attachedUnit.name}`,
                        isCombined: true
                    });
                    processed.add(item.listItemId);
                    processed.add(attachedUnit.listItemId);
                } else {
                    // Leader but attached unit not found or already processed, show leader alone
                    combined.push({
                        item: item,
                        displayName: item.name,
                        isCombined: false
                    });
                    processed.add(item.listItemId);
                }
            }
        });
        
        // Second pass: Process remaining items (units being led, regular units)
        items.forEach(item => {
            // Skip if already processed
            if (processed.has(item.listItemId)) return;
            
            // If this unit is being led, skip it (it should have been added with its leader in first pass)
            if (item.leadBy) {
                // Check if the leader exists
                const leader = items.find(l => 
                    l.id === item.leadBy?.id && 
                    l.name === item.leadBy?.name
                );
                
                if (!leader || !processed.has(leader.listItemId)) {
                    // Leader not found or not processed, show this unit alone
                    combined.push({
                        item: item,
                        displayName: item.name,
                        isCombined: false
                    });
                    processed.add(item.listItemId);
                } else {
                    // Leader was processed, this unit should have been added with it
                    // Mark as processed to skip it
                    processed.add(item.listItemId);
                }
            }
            // Regular unit, not a leader and not being led
            else {
                combined.push({
                    item: item,
                    displayName: item.name,
                    isCombined: false
                });
                processed.add(item.listItemId);
            }
        });
        
        return combined;
    }, [selectedList]);
    
    // Filter combined items based on search
    const filteredListItems = useMemo(() => {
        if (!unitSearchValue) return combinedListItems;
        const search = unitSearchValue.toLowerCase();
        return combinedListItems.filter(
            (combined) =>
                combined.displayName.toLowerCase().includes(search) ||
                combined.item.roleLabel.toLowerCase().includes(search)
        );
    }, [combinedListItems, unitSearchValue]);

    // Get display name for selected unit
    const selectedUnitDisplayName = useMemo(() => {
        if (!unit) return null;
        
        // Try to find by listItemId first (if unit is an ArmyListItem)
        const listItemId = (unit as any).listItemId;
        if (listItemId) {
            const combinedItem = combinedListItems.find(c => c.item.listItemId === listItemId);
            if (combinedItem) return combinedItem.displayName;
        }
        
        // Fallback: try to find by id and name (for backwards compatibility)
        const combinedItem = combinedListItems.find(c => 
            c.item.id === unit.id && c.item.name === unit.name
        );
        
        return combinedItem ? combinedItem.displayName : unit.name;
    }, [unit, combinedListItems]);

    // Get combined wargear from leader and attached unit if combined unit is selected
    const availableWargear = useMemo(() => {
        if (!unit || !selectedList) return unit?.wargear || [];
        
        // Check if this is a combined unit (leader with attached unit)
        const listItemId = (unit as any).listItemId;
        const combinedItem = listItemId 
            ? combinedListItems.find(c => c.item.listItemId === listItemId)
            : combinedListItems.find(c => c.item.id === unit.id && c.item.name === unit.name);
        
        if (combinedItem?.isCombined && combinedItem.item.leading) {
            // Find the attached unit
            const attachedUnit = selectedList.items.find(u => 
                u.id === combinedItem.item.leading?.id && 
                u.name === combinedItem.item.leading?.name
            );
            
            if (attachedUnit) {
                // Combine wargear from both units with source unit labels
                const leaderWargear = (combinedItem.item.wargear || []).map(weapon => ({
                    ...weapon,
                    sourceUnit: combinedItem.item.name
                }));
                const attachedWargear = (attachedUnit.wargear || []).map(weapon => ({
                    ...weapon,
                    sourceUnit: attachedUnit.name
                }));
                return [...leaderWargear, ...attachedWargear];
            }
        }
        
        // Return leader's wargear or regular unit's wargear
        return unit.wargear || [];
    }, [unit, selectedList, combinedListItems]);
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
                                    {selectedUnitDisplayName || "Search for a unit..."}
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
                                        {filteredListItems.map((combined) => (
                                            <CommandItem
                                                key={combined.item.listItemId}
                                                value={combined.displayName}
                                                onSelect={() => {
                                                    onUnitChange(combined.item);
                                                    onWeaponProfileChange(null);
                                                    setUnitSearchOpen(false);
                                                    setUnitSearchValue("");
                                                }}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div>
                                                        <div className="font-medium">
                                                            {combined.displayName}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {combined.item.roleLabel}
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

            {unit && availableWargear.length > 0 && (() => {
                // Filter weapons by game phase
                const filteredWeapons = availableWargear.filter((weapon) => 
                    (gamePhase === "SHOOTING") ? weapon.type === "Ranged" : weapon.type === "Melee"
                ) as Array<Weapon & { sourceUnit?: string }>;
                
                // Check if this is a combined unit
                const listItemId = (unit as any).listItemId;
                const combinedItem = listItemId 
                    ? combinedListItems.find(c => c.item.listItemId === listItemId)
                    : combinedListItems.find(c => c.item.id === unit.id && c.item.name === unit.name);
                
                if (combinedItem?.isCombined && combinedItem.item.leading) {
                    // Find the attached unit to get its name
                    const attachedUnit = selectedList?.items.find(u => 
                        u.id === combinedItem.item.leading?.id && 
                        u.name === combinedItem.item.leading?.name
                    );
                    
                    if (attachedUnit) {
                        const leaderName = combinedItem.item.name;
                        const attachedName = attachedUnit.name;
                        
                        // Group weapons by source unit
                        const groupedWeapons = filteredWeapons.reduce((acc, weapon) => {
                            const source = weapon.sourceUnit || 'default';
                            if (!acc[source]) {
                                acc[source] = [];
                            }
                            acc[source].push(weapon);
                            return acc;
                        }, {} as Record<string, Array<Weapon & { sourceUnit?: string }>>);
                        
                        // Order: leader first, then attached unit
                        const orderedSources = [leaderName, attachedName].filter(source => 
                            groupedWeapons[source] && groupedWeapons[source].length > 0
                        );
                        
                        return (
                            <div className="space-y-2">
                                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[12px] text-[#1e1e1e]">
                                    Select weapon
                                </p>
                                {orderedSources.map((source) => (
                                    <div key={source} className="space-y-2">
                                        <p className="text-[10px] text-[#767676] italic font-medium">
                                            from {source}
                                        </p>
                                        {groupedWeapons[source].map((weapon) => (
                                            <Fragment key={weapon.name}>
                                                {weapon.profiles.map((profile: WeaponProfile) => {
                                                    const isSelected = selectedWeaponProfile?.name === profile.name;
                                                    const profileKey = `${source}-${weapon.name}-${profile.name}`;
                                                    return (
                                                        <WeaponProfileCard 
                                                            key={profileKey}
                                                            profile={profile} 
                                                            isSelected={isSelected} 
                                                            onWeaponProfileChange={onWeaponProfileChange}
                                                        />
                                                    );
                                                })}
                                            </Fragment>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        );
                    }
                }
                
                // Regular unit: show weapons without grouping
                return (
                    <div className="space-y-2">
                        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[12px] text-[#1e1e1e]">
                            Select weapon
                        </p>
                        {filteredWeapons.map((weapon) => (
                            <Fragment key={weapon.name}>
                                {weapon.profiles.map((profile: WeaponProfile) => {
                                    const isSelected = selectedWeaponProfile?.name === profile.name;
                                    return (
                                        <WeaponProfileCard 
                                            key={profile.name}
                                            profile={profile} 
                                            isSelected={isSelected} 
                                            onWeaponProfileChange={onWeaponProfileChange}
                                        />
                                    );
                                })}
                            </Fragment>
                        ))}
                    </div>
                );
            })()}
            
            <hr className="border-[#d9d9d9] border-1" />

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <label htmlFor="stationary-this-turn" className="text-xs font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#1e1e1e]">Stationary this turn</label>
                    <Switch id="stationary-this-turn" onCheckedChange={(e) => {onModifiersChange({ ...modifiers, stationaryThisTurn: e })}} />
                </div>
                <div className="flex items-center justify-between gap-2">
                    <label htmlFor="in-objective-range" className="text-xs font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#1e1e1e]">In objective range</label>
                    <Switch id="in-objective-range"  onCheckedChange={(e) => {onModifiersChange({ ...modifiers, inRangeOfObjective: e })}}  />
                </div>    
            </div>
            

        </div>
    );
}

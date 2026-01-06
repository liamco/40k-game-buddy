import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search } from "lucide-react";
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
import type { Modifiers, ArmyList, Datasheet, Faction, Model, GamePhase, Ability, ArmyListItem, WeaponProfile } from "../types";
import { loadFactionData } from "../utils/depotDataLoader";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";

interface DefenderPanelProps {
    gamePhase: GamePhase;
    unit: Datasheet | null;
    onUnitChange: (unit: Datasheet) => void;
    selectedUnitModel: Model | null;
    onUnitModelChange: (weapon: Model | null) => void;
    modifiers: Modifiers;
    onModifiersChange: (modifiers: Modifiers) => void;
    selectedList: ArmyList | null;
    selectedWeaponProfile: WeaponProfile | null;
}

export function DefenderPanel({
    gamePhase,
    unit,
    onUnitChange,
    selectedUnitModel,
    onUnitModelChange,
    modifiers,
    onModifiersChange,
    selectedList,
    selectedWeaponProfile,
}: DefenderPanelProps) {
    const [factionData, setFactionData] = useState<Faction | null>(null);
    const [unitSearchOpen, setUnitSearchOpen] = useState(false);
    const [unitSearchValue, setUnitSearchValue] = useState("");
    const lastProcessedUnitRef = useRef<string | null>(null);
    
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

    // Get combined models from leader and attached unit if combined unit is selected
    const availableModels = useMemo(() => {
        if (!unit || !selectedList) return unit?.models || [];
        
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
                // Combine models from both units with labels
                const leaderModels = (combinedItem.item.models || []).map(model => ({
                    ...model,
                    sourceUnit: combinedItem.item.name,
                    isLeader: true
                }));
                const attachedModels = (attachedUnit.models || []).map(model => ({
                    ...model,
                    sourceUnit: attachedUnit.name,
                    isLeader: false
                }));
                return [...leaderModels, ...attachedModels];
            }
        }
        
        // Return leader's models or regular unit's models
        return unit.models || [];
    }, [unit, selectedList, combinedListItems]);

    // Auto-select first non-leader model when combined unit is first selected
    useEffect(() => {
        if (!unit || !selectedList) {
            lastProcessedUnitRef.current = null;
            return;
        }
        
        // Get unique identifier for this unit
        const unitId = (unit as any).listItemId || unit.id;
        
        // Only process if this is a new unit (not already processed)
        if (lastProcessedUnitRef.current === unitId) {
            return;
        }
        
        // Mark this unit as processed
        lastProcessedUnitRef.current = unitId;
        
        // Check if this is a combined unit
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
            
            if (attachedUnit && attachedUnit.models && attachedUnit.models.length > 0) {
                // Auto-select the first model from the attached unit (non-leader)
                // This only happens when the unit first changes, not on subsequent model selections
                onUnitModelChange(attachedUnit.models[0]);
            }
        }
    }, [unit, selectedList, combinedListItems, onUnitModelChange]);

    // Check if weapon has precision attribute
    const hasPrecision = useMemo(() => {
        if (!selectedWeaponProfile || !selectedWeaponProfile.attributes) {
            return false;
        }
        
        // Check for PRECISION in attributes array
        return selectedWeaponProfile.attributes.includes("PRECISION");
    }, [selectedWeaponProfile]);
    
    return (
        <div className="bg-[#e6e6e6] rounded-[8px] p-6 space-y-4">
            <div className="space-y-2">
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-[#1e1e1e]">
                    Target unit
                </p>
                {!selectedList ? (
                    <div className="w-full bg-white rounded-[8px] border border-[#d9d9d9] px-4 py-3 font-['Inter:Regular',sans-serif] text-[14px] text-[#767676]">
                        Select a defender list above
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

            {
                (unit && unit.abilities) && unit?.abilities.length > 0 && (
                    <div className="flex items-start flex-wrap gap-2">
                        {unit?.abilities.map((ability:Ability)=>{
                            return (
                                <span key={ability.id} className="text-[10px] inline-block font-bold uppercase p-1 px-2 rounded-s bg-[#B3B3B3]">{ability.name}{ability.parameter ? ` ${ability.parameter}` : ''}</span>
                            )
                        })}
                    </div>
                )
            }

            {unit && availableModels.length > 0 && availableModels.map((model:Model & { sourceUnit?: string; isLeader?: boolean })=>{

                const isSelected = selectedUnitModel?.name === model.name;
                const modelKey = model.sourceUnit ? `${model.sourceUnit}-${model.name}` : model.name;
                const isLeaderModel = model.isLeader === true;
                // Leader models are only disabled if precision is NOT present
                const isDisabled = isLeaderModel && !hasPrecision;

                return (
                    <div key={modelKey}
                    className={`bg-[#ccc] rounded-[4px] p-2 space-y-2 border-2 transition-colors ${
                        isDisabled 
                            ? "opacity-50 cursor-not-allowed border-gray-300" 
                            : isSelected 
                                ? "border-[#2b344c] cursor-pointer" 
                                : "border-transparent cursor-pointer"
                    }`}
                    onClick={() => {
                        if (!isDisabled) {
                            onUnitModelChange(isSelected ? null : model);
                        }
                    }}
                    >

                        <div className="flex items-center justify-between">
                            
                            <div className="flex items-center gap-2">
                                <p className=" font-bold text-[12px] ">
                                    {model.name}
                                </p>
                                {model.isLeader && (
                                    <Badge variant="outline" className="text-[10px] bg-green-100 border-green-300 text-green-700">
                                        Leader
                                    </Badge>
                                )}
                            </div>
                            
                            <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    isSelected
                                        ? "border-[#2c2c2c] bg-[#e6e6e6]"
                                        : "border-[#757575] bg-white"
                                }`}
                            >
                                {isSelected && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#1e1e1e]" />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-2 text-center">
                            <p className=" font-bold text-[12px] ">
                                M
                            </p>
                            <p className=" font-bold text-[12px] ">
                                T
                            </p>
                            <p className=" font-bold text-[12px] ">
                                Sv
                            </p>
                            <p className=" font-bold text-[12px] ">
                                W
                            </p>
                            <p className=" font-bold text-[12px] ">
                                Ld
                            </p>
                            <p className=" font-bold text-[12px] ">
                                OC
                            </p>
                            <p className=" font-bold text-[12px] ">
                                {model.m}
                            </p>
                            <p className=" font-bold text-[12px] ">
                                {model.t}
                            </p>
                            <p className=" font-bold text-[12px] ">
                                {model.sv}
                            </p>
                            <p className=" font-bold text-[12px] ">
                                {model.w}
                            </p>
                            <p className=" font-bold text-[12px] ">
                                {model.ld}
                            </p>
                            <p className=" font-bold text-[12px] ">
                                {model.oc}
                            </p>
                            {
                                (model.invSv) &&
                                <div className="col-start-3">
                                    <p className="font-bold text-[12px] inline-block p-2 bg-amber-300 rounded-b-full">
                                        {model.invSv}
                                    </p>
                                </div>
                            }
                        </div>
                    
                    </div>
                )

            })}

            <hr className="border-[#d9d9d9] border-1" />

            <div className="flex items-center justify-between gap-2">
                <label htmlFor="benefit-of-cover" className="text-xs font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#1e1e1e]">Benefit of cover</label>
                <Switch id="benefit-of-cover" onCheckedChange={(e) => {onModifiersChange({ ...modifiers, inCover: e })}} />
            </div>

        </div>
    );
}

import React, { useState, useEffect, useMemo } from "react";
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
import type { Modifiers, ArmyList, Datasheet, Faction, Model, GamePhase, Ability } from "../types";
import { loadFactionData } from "../utils/depotDataLoader";
import { Switch } from "./ui/switch";

interface DefenderPanelProps {
    gamePhase: GamePhase;
    unit: Datasheet | null;
    onUnitChange: (unit: Datasheet) => void;
    selectedUnitModel: Model | null;
    onUnitModelChange: (weapon: Model | null) => void;
    modifiers: Modifiers;
    onModifiersChange: (modifiers: Modifiers) => void;
    selectedList: ArmyList | null;
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
}: DefenderPanelProps) {
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

            {unit && unit.models?.map((model:Model)=>{

                const isSelected = selectedUnitModel?.name === model.name;

                return (
                    <div key={model.name}
                    className={`bg-[#ccc] rounded-[4px] p-2 space-y-2 cursor-pointer border-2 transition-colors ${
                        isSelected ? "border-[#2b344c]" : "border-transparent"
                    }`}
                    onClick={() => onUnitModelChange(isSelected ? null : model)}
                    >

                        <div className="flex items-center justify-between">
                            <p className=" font-bold text-[12px] ">
                                {model.name}
                            </p>
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

import React, { useState, useMemo, ReactNode } from "react";
import { Search } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { Button } from "../_ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../_ui/command";

export interface SearchableDropdownOption<T> {
    /** Unique identifier for this option */
    id: string;
    /** The value used for filtering/searching */
    searchValue: string;
    /** The underlying data for this option */
    data: T;
}

interface SearchableDropdownProps<T> {
    /** Array of options to display */
    options: SearchableDropdownOption<T>[];
    /** Currently selected value (for display in trigger) */
    selectedLabel?: string | null;
    /** Placeholder text when nothing is selected */
    placeholder?: string;
    /** Placeholder text for the search input */
    searchPlaceholder?: string;
    /** Message shown when no results match the search */
    emptyMessage?: string;
    /** Called when an option is selected */
    onSelect: (option: T) => void;
    /** Custom render function for each option */
    renderOption: (option: T) => ReactNode;
    /** Optional className for the trigger button */
    triggerClassName?: string;
    /** Whether the dropdown is disabled */
    disabled?: boolean;
    /** Use outline variant for trigger (default: false uses custom bg-deathWorldForest style) */
    variant?: "default" | "outline";
}

export function SearchableDropdown<T>({ options, selectedLabel, placeholder = "Select...", searchPlaceholder = "Search...", emptyMessage = "No results found.", onSelect, renderOption, triggerClassName = "", disabled = false, variant = "default" }: SearchableDropdownProps<T>) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const filteredOptions = useMemo(() => {
        if (!searchValue) return options;
        const search = searchValue.toLowerCase();
        return options.filter((option) => option.searchValue.toLowerCase().includes(search));
    }, [options, searchValue]);

    const handleSelect = (option: SearchableDropdownOption<T>) => {
        onSelect(option.data);
        setOpen(false);
        setSearchValue("");
    };

    const triggerContent = (
        <>
            <span className={!selectedLabel ? "" : ""}>{selectedLabel || placeholder}</span>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </>
    );

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            {variant === "outline" ? (
                <PopoverTrigger asChild disabled={disabled}>
                    <Button variant="outline" role="combobox" aria-expanded={open} className={`w-full justify-between ${triggerClassName}`} disabled={disabled}>
                        {triggerContent}
                    </Button>
                </PopoverTrigger>
            ) : (
                <PopoverTrigger className={`w-full flex p-3 bg-deathWorldForest justify-between items-center rounded ${triggerClassName}`} disabled={disabled}>
                    {triggerContent}
                </PopoverTrigger>
            )}
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
                    <CommandInput placeholder={searchPlaceholder} value={searchValue} onValueChange={setSearchValue} />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {filteredOptions.map((option) => (
                                <CommandItem key={option.id} value={option.searchValue} onSelect={() => handleSelect(option)}>
                                    {renderOption(option.data)}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default SearchableDropdown;

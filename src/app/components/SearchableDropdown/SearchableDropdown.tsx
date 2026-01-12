import React, { useState, useMemo, ReactNode } from "react";
import { Search } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../_ui/popover";
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
}

export function SearchableDropdown<T>({ options, selectedLabel, placeholder = "Select...", searchPlaceholder = "Search...", emptyMessage = "No results found.", onSelect, renderOption, triggerClassName = "", disabled = false }: SearchableDropdownProps<T>) {
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

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger className={`w-full flex p-3 bg-deathWorldForest justify-between items-center rounded ${triggerClassName} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`} disabled={disabled}>
                <span>{selectedLabel || placeholder}</span>
                <Search className="strole-skarsnikGreen ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent
                className="p-0 border-0"
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

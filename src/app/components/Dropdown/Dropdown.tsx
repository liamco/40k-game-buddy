import React, { useState, useMemo, ReactNode } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "#components/Popover/Popover.tsx";

export interface DropdownOption<T> {
    /** Unique identifier for this option */
    id: string;
    /** Display label for this option */
    label: string;
    /** The underlying data for this option */
    data: T;
    /** Whether this option is disabled */
    disabled?: boolean;
    /** Reason why this option is disabled (shown as tooltip and inline text) */
    disabledReason?: string;
}

type DropdownVariant = "default" | "minimal";

const variantStyles: Record<DropdownVariant, { trigger: string; content: string }> = {
    default: {
        trigger: "p-3 bg-deathWorldForest",
        content: "bg-deathWorldForest",
    },
    minimal: {
        trigger: "p-0 bg-transparent",
        content: "bg-deathWorldForest",
    },
};

interface DropdownProps<T> {
    /** Array of options to display */
    options: DropdownOption<T>[];
    /** Currently selected value (for display in trigger) */
    selectedLabel?: string | null;
    /** Placeholder text when nothing is selected */
    placeholder?: string;
    /** Called when an option is selected */
    onSelect: (option: T) => void;
    /** Custom render function for each option (optional, defaults to label) */
    renderOption?: (option: T, label: string) => ReactNode;
    /** Optional className for the trigger button */
    triggerClassName?: string;
    /** Optional className for option wrapper - can be a string or function that receives the option data */
    optionClassName?: string | ((option: T) => string);
    /** Whether the dropdown is disabled */
    disabled?: boolean;
    /** Enable search functionality */
    searchable?: boolean;
    /** Placeholder text for the search input */
    searchPlaceholder?: string;
    /** Message shown when no results match the search */
    emptyMessage?: string;
    /** Visual variant of the dropdown */
    variant?: DropdownVariant;
}

export function Dropdown<T>({ options, selectedLabel, placeholder = "Select...", onSelect, renderOption, optionClassName, triggerClassName = "", disabled = false, searchable = false, searchPlaceholder = "Search...", emptyMessage = "No results found.", variant = "default" }: DropdownProps<T>) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const filteredOptions = useMemo(() => {
        if (!searchable || !searchValue) return options;
        const search = searchValue.toLowerCase();
        return options.filter((option) => option.label.toLowerCase().includes(search));
    }, [options, searchValue, searchable]);

    const handleSelect = (option: DropdownOption<T>) => {
        onSelect(option.data);
        setOpen(false);
        setSearchValue("");
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setSearchValue("");
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
            <PopoverTrigger className={`w-full flex justify-between items-center rounded ${variantStyles[variant].trigger} ${triggerClassName} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`} disabled={disabled}>
                <span className="text-blockcaps-s text-left">{selectedLabel || placeholder}</span>
                {searchable ? <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" /> : <ChevronDown className={`ml-2 h-4 w-4 shrink-0 ${variant === "minimal" ? "hidden" : "opacity-50"}`} />}
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
                <div className={`${variantStyles[variant].content} text-skarsnikGreen rounded overflow-hidden`}>
                    {searchable && (
                        <div className="p-2 border-b border-skarsnikGreen/30">
                            <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder={searchPlaceholder} className="w-full bg-transparent outline-none placeholder:text-skarsnikGreen/50" autoFocus />
                        </div>
                    )}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="p-2 text-skarsnikGreen/50">{emptyMessage}</div>
                        ) : (
                            filteredOptions.map((option) => {
                                const resolvedOptionClassName = typeof optionClassName === "function" ? optionClassName(option.data) : optionClassName || "";
                                const isDisabled = option.disabled === true;
                                return (
                                    <div
                                        key={option.id}
                                        className={`${resolvedOptionClassName} p-2 transition-colors ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-skarsnikGreen hover:text-deathWorldForest"}`}
                                        onClick={() => !isDisabled && handleSelect(option)}
                                        title={isDisabled ? option.disabledReason : undefined}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="flex-1">{renderOption ? renderOption(option.data, option.label) : option.label}</span>
                                            {isDisabled && option.disabledReason && <span className="ml-2 text-xs opacity-70 shrink-0">{option.disabledReason}</span>}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default Dropdown;

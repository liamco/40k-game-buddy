import React, { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../_ui/popover";

export interface DropdownOption<T> {
    /** Unique identifier for this option */
    id: string;
    /** Display label for this option */
    label: string;
    /** The underlying data for this option */
    data: T;
}

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
    /** Whether the dropdown is disabled */
    disabled?: boolean;
}

export function Dropdown<T>({ options, selectedLabel, placeholder = "Select...", onSelect, renderOption, triggerClassName = "", disabled = false }: DropdownProps<T>) {
    const [open, setOpen] = useState(false);

    const handleSelect = (option: DropdownOption<T>) => {
        onSelect(option.data);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger className={`w-full flex p-3 bg-deathWorldForest justify-between items-center rounded ${triggerClassName} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`} disabled={disabled}>
                <span>{selectedLabel || placeholder}</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                <div className="bg-deathWorldForest text-skarsnikGreen rounded overflow-hidden">
                    {options.map((option) => (
                        <div key={option.id} className="p-2 cursor-pointer hover:bg-skarsnikGreen hover:text-deathWorldForest transition-colors" onClick={() => handleSelect(option)}>
                            {renderOption ? renderOption(option.data, option.label) : option.label}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default Dropdown;

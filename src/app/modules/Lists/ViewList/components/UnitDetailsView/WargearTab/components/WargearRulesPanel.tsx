/**
 * WargearRulesPanel Component
 *
 * Displays the raw wargear option text for reference.
 * Always visible on the right side of the wargear tab.
 */

import { Fragment } from "react";

interface DatasheetOption {
    datasheetId: string;
    line: number;
    button: string;
    description: string;
}

interface Props {
    options: DatasheetOption[] | undefined;
}

export function WargearRulesPanel({ options }: Props) {
    if (!options || options.length === 0) {
        return (
            <div className="bg-stone-900 rounded-lg p-4">
                <h3 className="text-sm font-medium text-stone-400 mb-2">
                    Wargear Rules
                </h3>
                <p className="text-sm text-stone-500 italic">
                    No wargear options available
                </p>
            </div>
        );
    }

    // Filter out footnotes (button === "*")
    const mainOptions = options.filter((opt) => opt.button !== "*");
    const footnotes = options.filter((opt) => opt.button === "*");

    return (
        <div className="bg-stone-900 rounded-lg p-4">
            <h3 className="text-sm font-medium text-stone-400 mb-3">
                Wargear Rules
            </h3>
            <ul className="space-y-2 text-sm text-stone-300">
                {mainOptions.map((opt, idx) => (
                    <li key={opt.line} className="flex gap-2">
                        <span className="text-stone-500 shrink-0">
                            {opt.button}
                        </span>
                        <span>{opt.description}</span>
                    </li>
                ))}
            </ul>
            {footnotes.length > 0 && (
                <div className="mt-4 pt-3 border-t border-stone-700">
                    {footnotes.map((opt) => (
                        <p
                            key={opt.line}
                            className="text-xs text-stone-500 italic"
                        >
                            * {opt.description}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

export default WargearRulesPanel;

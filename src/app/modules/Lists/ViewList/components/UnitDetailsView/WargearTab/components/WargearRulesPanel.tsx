/**
 * WargearRulesPanel Component
 *
 * Displays the raw wargear option text for reference.
 * Always visible on the right side of the wargear tab.
 */

import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";
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
            <div className="bg-mournfangBrown rounded p-4">
                <SplitHeading label="Wargear rules" />
                <p>No wargear options available</p>
            </div>
        );
    }

    // Filter out footnotes (button === "*")
    const mainOptions = options.filter((opt) => opt.button !== "*");
    const footnotes = options.filter((opt) => opt.button === "*");

    return (
        <div className="bg-stone-900 rounded-lg p-4">
            <SplitHeading label="Wargear rules" />
            <ul className="space-y-2">
                {mainOptions.map((opt, idx) => (
                    <li key={opt.line} className="flex gap-2">
                        <span className="shrink-0">{opt.button}</span>
                        <span>{opt.description}</span>
                    </li>
                ))}
            </ul>
            {footnotes.length > 0 && (
                <div className="mt-4 pt-3">
                    {footnotes.map((opt) => (
                        <p key={opt.line}>* {opt.description}</p>
                    ))}
                </div>
            )}
        </div>
    );
}

export default WargearRulesPanel;

/**
 * UnparsedOptionsWarning Component
 *
 * Displays a warning when some wargear options could not be parsed.
 * Shows the raw text for manual reference.
 */

import { AlertTriangle } from "lucide-react";
import { WargearOptionDef } from "../parser";

interface Props {
    unparsedOptions: WargearOptionDef[];
}

export function UnparsedOptionsWarning({ unparsedOptions }: Props) {
    if (unparsedOptions.length === 0) return null;

    return (
        <div className="bg-amber-950/50 border border-amber-700/50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-medium text-amber-400 mb-1">
                        Wargear Options Pending Support
                    </h4>
                    <p className="text-xs text-amber-300/70 mb-3">
                        Some wargear options for this unit use complex rules
                        that aren't fully supported yet. The raw options text is
                        shown below for reference.
                    </p>
                    <div className="space-y-2">
                        {unparsedOptions.map((opt) => (
                            <div
                                key={opt.line}
                                className="bg-stone-900/50 rounded p-2 text-xs text-stone-400 font-mono"
                            >
                                "{opt.rawText}"
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UnparsedOptionsWarning;

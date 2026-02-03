/**
 * useParsedOptions Hook
 *
 * Returns pre-parsed wargear options from the datasheet JSON.
 *
 * Pre-parsed data is generated at build time by:
 *   npm run parse-wargear-options
 */

import { useMemo } from "react";
import { WargearOptionDef } from "../parser";

/**
 * Hook to get parsed wargear options.
 *
 * Returns pre-parsed options from the datasheet JSON (generated at build time).
 * If no pre-parsed data is available, returns an empty array.
 *
 * @param parsedWargearOptions - Pre-parsed options from the datasheet
 * @returns Parsed WargearOptionDef array
 */
export function useParsedOptions(parsedWargearOptions?: WargearOptionDef[]): WargearOptionDef[] {
    return useMemo(() => {
        if (parsedWargearOptions && parsedWargearOptions.length > 0) {
            return parsedWargearOptions;
        }
        return [];
    }, [parsedWargearOptions]);
}

/**
 * Categorize parsed options by scope.
 */
export interface CategorizedOptions {
    /** Options that apply to all models equally */
    unitWide: WargearOptionDef[];
    /** Options with ratio-based targeting */
    ratio: WargearOptionDef[];
    /** Options for specific models */
    perModel: WargearOptionDef[];
    /** Options that failed to parse */
    unparsed: WargearOptionDef[];
}

export function useCategorizedOptions(parsedOptions: WargearOptionDef[]): CategorizedOptions {
    return useMemo(() => {
        const unitWide: WargearOptionDef[] = [];
        const ratio: WargearOptionDef[] = [];
        const perModel: WargearOptionDef[] = [];
        const unparsed: WargearOptionDef[] = [];

        for (const opt of parsedOptions) {
            if (!opt.wargearParsed) {
                unparsed.push(opt);
                continue;
            }

            const { targeting } = opt;
            switch (targeting.type) {
                case "all-models":
                case "any-number":
                case "this-unit":
                    unitWide.push(opt);
                    break;
                case "ratio":
                case "ratio-capped":
                    ratio.push(opt);
                    break;
                default:
                    perModel.push(opt);
            }
        }

        return { unitWide, ratio, perModel, unparsed };
    }, [parsedOptions]);
}

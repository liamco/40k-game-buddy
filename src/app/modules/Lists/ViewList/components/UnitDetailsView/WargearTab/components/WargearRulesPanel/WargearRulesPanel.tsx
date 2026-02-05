/**
 * WargearRulesPanel Component
 *
 * Displays the default loadout and raw wargear option text for reference.
 * Always visible on the right side of the wargear tab.
 */

import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";

import styles from "./WargearRulesPanel.module.css";

interface DatasheetOption {
    datasheetId: string;
    line: number;
    button: string;
    description: string;
}

interface Props {
    defaultLoadout?: string;
    options: DatasheetOption[] | undefined;
}

/**
 * Check if an option description indicates no wargear options available
 */
function isNoneOption(description: string): boolean {
    const normalized = description.trim().toLowerCase();
    return normalized === "none" || normalized === "none.";
}

export function WargearRulesPanel({ defaultLoadout, options }: Props) {
    const hasOptions = options && options.length > 0;

    // Filter out footnotes (button === "*") and "None" entries
    const mainOptions = hasOptions ? options.filter((opt) => opt.button !== "*" && !isNoneOption(opt.description)) : [];
    const footnotes = hasOptions ? options.filter((opt) => opt.button === "*") : [];

    return (
        <div className="bg-deathWorldForest rounded p-4 space-y-4">
            {defaultLoadout && (
                <div>
                    <SplitHeading label="Default loadout" />
                    <div className={`${styles.WargearRulesList} text-paragraph-s space-y-2`} dangerouslySetInnerHTML={{ __html: defaultLoadout }} />
                </div>
            )}

            <div>
                <SplitHeading label="Wargear options" />
                {mainOptions.length === 0 ? (
                    <p className="text-paragraph-s text-fireDragonBright/60">No wargear options available</p>
                ) : (
                    <ul className={`${styles.WargearRulesList} space-y-4 text-paragraph-s`}>
                        {mainOptions.map((opt) => (
                            <li key={opt.line}>
                                <p dangerouslySetInnerHTML={{ __html: opt.description }} />
                            </li>
                        ))}
                        {footnotes.length > 0 && (
                            <div className="mt-4 pt-3">
                                {footnotes.map((opt) => (
                                    <p key={opt.line}>* {opt.description}</p>
                                ))}
                            </div>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default WargearRulesPanel;

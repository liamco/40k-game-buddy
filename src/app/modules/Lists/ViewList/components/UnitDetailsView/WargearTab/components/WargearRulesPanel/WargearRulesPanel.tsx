/**
 * WargearRulesPanel Component
 *
 * Displays the raw wargear option text for reference.
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
        <div className="bg-deathWorldForest rounded p-4">
            <SplitHeading label="Wargear rules" />
            <ul className={`${styles.WargearRulesList} space-y-4 text-paragraph-s`}>
                {mainOptions.map((opt, idx) => (
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
        </div>
    );
}

export default WargearRulesPanel;

/**
 * InvalidLoadoutWarning Component
 *
 * Displays a warning when a model's loadout doesn't match any valid configuration.
 * Shows which items may be causing the issue without blocking selection.
 */

import { AlertTriangle } from "lucide-react";
import { UnitLoadoutValidation } from "../hooks";

interface Props {
    validation: UnitLoadoutValidation;
    weapons: Array<{ id: string; name: string }>;
    abilities: Array<{ id?: string; name: string }>;
}

/**
 * Get display name for a weapon/ability ID
 */
function getItemName(
    itemId: string,
    weapons: Array<{ id: string; name: string }>,
    abilities: Array<{ id?: string; name: string }>
): string {
    // Check if it's a wargear ability
    if (itemId.startsWith("wargear-ability:")) {
        const slug = itemId.replace("wargear-ability:", "");
        const ability = abilities.find(
            (a) => a.name.toLowerCase().replace(/\s+/g, "-") === slug
        );
        return ability?.name || slug.replace(/-/g, " ");
    }

    // Check weapons
    const weapon = weapons.find((w) => w.id === itemId);
    return weapon?.name || itemId.split(":").pop()?.replace(/-/g, " ") || itemId;
}

export function InvalidLoadoutWarning({ validation, weapons, abilities }: Props) {
    if (!validation.hasAnyInvalid) return null;

    // Collect unique extra items across all invalid models
    const extraItemIds = new Set<string>();
    validation.modelValidations.forEach((result) => {
        if (!result.isValid) {
            result.extraItems.forEach((id) => extraItemIds.add(id));
        }
    });

    const extraItemNames = Array.from(extraItemIds).map((id) =>
        getItemName(id, weapons, abilities)
    );

    return (
        <div className="bg-red-950/30 border border-red-700/40 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-medium text-red-300 mb-1">
                        Invalid Loadout Configuration
                    </h4>
                    <p className="text-xs text-red-300/70">
                        {validation.invalidCount === 1
                            ? "1 model has"
                            : `${validation.invalidCount} models have`}{" "}
                        a loadout that doesn't match any valid configuration.
                        {extraItemNames.length > 0 && (
                            <>
                                {" "}
                                Check:{" "}
                                <span className="text-red-300">
                                    {extraItemNames.join(", ")}
                                </span>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default InvalidLoadoutWarning;

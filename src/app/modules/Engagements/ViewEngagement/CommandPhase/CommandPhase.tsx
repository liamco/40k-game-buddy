import { useState, useEffect, useMemo } from "react";
import type { EngagementForce } from "#types/Engagements.tsx";
import type { FactionAbility } from "#types/Factions.tsx";
import { useEngagementManager } from "../../EngagementManagerContext";
import { loadFactionConfig } from "#utils/depotDataLoader.ts";
import { Dropdown, type DropdownOption } from "#components/Dropdown/Dropdown.tsx";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";
import { Checkbox } from "#components/Checkbox/Checkbox.tsx";

interface Props {
    attackingForce: EngagementForce;
    defendingForce: EngagementForce;
    engagementId: string;
}

const CommandPhase = ({ attackingForce, defendingForce, engagementId }: Props) => {
    const { getEngagementById, updateUnitStateFlag } = useEngagementManager();
    const [commandAbilities, setCommandAbilities] = useState<FactionAbility[]>([]);

    // Determine which engagement force key the defending force is
    const defendingForceKey = useMemo(() => {
        const engagement = getEngagementById(engagementId);
        if (!engagement) return "engagementForceB" as const;
        return engagement.engagementForceA.sourceListId === defendingForce.sourceListId
            ? ("engagementForceA" as const)
            : ("engagementForceB" as const);
    }, [engagementId, defendingForce.sourceListId, getEngagementById]);

    // Load faction config to get command phase abilities
    useEffect(() => {
        let cancelled = false;
        loadFactionConfig(attackingForce.factionSlug).then((config) => {
            if (cancelled) return;
            if (!config?.abilities) {
                setCommandAbilities([]);
                return;
            }
            const filtered = config.abilities.filter((a) => a.phase?.includes("command") && a.interface);
            setCommandAbilities(filtered);
        });
        return () => {
            cancelled = true;
        };
    }, [attackingForce.factionSlug]);

    // Build dropdown options from non-destroyed defending units
    const unitOptions: DropdownOption<string>[] = useMemo(() => {
        return defendingForce.items
            .filter((item) => !item.combatState.isDestroyed)
            .map((item) => ({
                id: item.listItemId,
                label: item.name,
                data: item.listItemId,
            }));
    }, [defendingForce.items]);

    // Find which unit currently has a given state flag set
    const getSelectedUnitId = (flagName: string): string | null => {
        for (const item of defendingForce.items) {
            if (item.combatState.stateFlags?.[flagName]) {
                return item.listItemId;
            }
        }
        return null;
    };

    const handleSelect = (flagName: string, unitId: string) => {
        const currentTarget = getSelectedUnitId(flagName);
        // If selecting the same unit, deselect
        if (currentTarget === unitId) {
            updateUnitStateFlag(engagementId, defendingForceKey, unitId, flagName, false);
        } else {
            updateUnitStateFlag(engagementId, defendingForceKey, unitId, flagName, true);
        }
    };

    if (commandAbilities.length === 0) {
        return (
            <div className="p-6">
                <h2 className="text-title-m">Command Phase</h2>
                <p className="mt-2 text-skarsnikGreen/60">No command phase abilities for this faction.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SplitHeading label="Command Phase" />
            {commandAbilities.map((ability) => {
                const selectedUnitId = ability.interface ? getSelectedUnitId(ability.interface.value) : null;
                const selectedUnit = selectedUnitId ? defendingForce.items.find((i) => i.listItemId === selectedUnitId) : null;
                const isComplete = selectedUnitId !== null;

                return (
                    <div key={ability.id} className="border border-skarsnikGreen/30 rounded p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <Checkbox checked={isComplete} className="mt-0.5 pointer-events-none" />
                            <div className="flex-1 space-y-1">
                                <h3 className="text-blockcaps-s">{ability.name}</h3>
                                {ability.legend && <p className="text-xs text-skarsnikGreen/60 line-clamp-2">{ability.legend}</p>}
                            </div>
                        </div>

                        {ability.interface?.type === "singleSelect" && ability.interface.scope === "opposingUnit" && (
                            <div className="space-y-2">
                                <label className="text-xs text-skarsnikGreen/80">Select target enemy unit</label>
                                <Dropdown
                                    options={unitOptions}
                                    selectedLabel={selectedUnit?.name}
                                    placeholder="Choose an enemy unit..."
                                    searchable={unitOptions.length > 6}
                                    onSelect={(unitId) => handleSelect(ability.interface!.value, unitId)}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CommandPhase;

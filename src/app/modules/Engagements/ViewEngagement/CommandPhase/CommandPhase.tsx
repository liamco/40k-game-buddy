import { useState, useEffect, useMemo } from "react";
import type { EngagementForce } from "#types/Engagements.tsx";
import type { FactionAbility } from "#types/Factions.tsx";
import { useEngagementManager } from "../../EngagementManagerContext";
import { loadFactionConfig } from "#utils/depotDataLoader.ts";
import { Dropdown, type DropdownOption } from "#components/Dropdown/Dropdown.tsx";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";
import { Checkbox } from "#components/Checkbox/Checkbox.tsx";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Badge } from "#components/Badge/Badge";
import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconShock from "#components/icons/IconShock.tsx";

interface Props {
    attackingForce: EngagementForce;
    defendingForce: EngagementForce;
    engagementId: string;
}

const CommandPhase = ({ attackingForce, defendingForce, engagementId }: Props) => {
    const { getEngagementById, updateUnitStateFlag, updateUnitCombatState } = useEngagementManager();
    const [commandAbilities, setCommandAbilities] = useState<FactionAbility[]>([]);

    // Determine which engagement force key the defending force is
    const defendingForceKey = useMemo(() => {
        const engagement = getEngagementById(engagementId);
        if (!engagement) return "engagementForceB" as const;
        return engagement.engagementForceA.sourceListId === defendingForce.sourceListId ? ("engagementForceA" as const) : ("engagementForceB" as const);
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

    // Units eligible for battle-shock tests (active player's units below half strength)
    const battleShockUnits = useMemo(() => {
        return attackingForce.items.filter((item) => !item.combatState.isDestroyed && item.combatState.unitStrength === "belowHalf");
    }, [attackingForce.items]);

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

    const handleBattleShockResult = (unitId: string, result: "passed" | "failed") => {
        updateUnitCombatState(engagementId, "attacking", unitId, {
            isBattleShocked: result === "failed",
        });
    };

    return (
        <div className="space-y-6 FullScreenHeight">
            <SplitHeading label="Command Phase" />

            {/* Battle-shock Tests */}
            <div className="space-y-3">
                <h3 className="text-blockcaps-s">Battle-shock Tests</h3>
                {battleShockUnits.length === 0 ? (
                    <p className="text-xs text-skarsnikGreen/60">No units below half strength — no tests required.</p>
                ) : (
                    <div className="space-y-3">
                        {battleShockUnits.map((item) => {
                            const ld = item.models?.[0]?.ld;
                            const isShocked = item.combatState.isBattleShocked;
                            const radioValue = isShocked ? "failed" : isShocked === false ? "passed" : "";

                            return (
                                <div key={item.listItemId} className={`border rounded p-4 space-y-3 ${isShocked ? "border-wildRiderRed/50" : "border-skarsnikGreen/30"}`}>
                                    <div className="flex justify-between items-center gap-2">
                                        <h4 className="text-blockcaps-s">{item.name}</h4>
                                        <div className="flex items-center gap-2">
                                            {isShocked && (
                                                <Badge variant="destructive">
                                                    <span className="flex items-center gap-1">
                                                        <BaseIcon size="small" color="wildRiderRed">
                                                            <IconShock />
                                                        </BaseIcon>
                                                        Shocked
                                                    </span>
                                                </Badge>
                                            )}
                                            <span className="text-blockcaps-l rounded p-2 bg-rhinoxHide text-fireDragonBright">Ld {ld}+</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-skarsnikGreen/60">Roll 2D6 — {ld}+ to pass</p>

                                    <RadioGroupPrimitive.Root value={radioValue} onValueChange={(value) => handleBattleShockResult(item.listItemId, value as "passed" | "failed")} className={`grid grid-cols-2 border-1 rounded ${isShocked ? "border-wildRiderRed" : "border-fireDragonBright"}`}>
                                        <RadioGroupPrimitive.Item value="passed" className="px-2 py-3 cursor-pointer data-[state=checked]:bg-mournfangBrown data-[state=checked]:text-fireDragonBright">
                                            <span className="text-blockcaps-xs">Pass</span>
                                        </RadioGroupPrimitive.Item>
                                        <RadioGroupPrimitive.Item value="failed" className={`px-2 py-3 border-l-1 ${isShocked ? "border-wildRiderRed" : "border-fireDragonBright"} cursor-pointer data-[state=checked]:bg-wordBearersRed data-[state=checked]:text-wildRiderRed`}>
                                            <span className="text-blockcaps-xs">Fail</span>
                                        </RadioGroupPrimitive.Item>
                                    </RadioGroupPrimitive.Root>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Faction Abilities */}
            {commandAbilities.length > 0 && (
                <div className="space-y-6">
                    <SplitHeading label="Faction Abilities" />
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
                                        <Dropdown options={unitOptions} selectedLabel={selectedUnit?.name} placeholder="Choose an enemy unit..." searchable={unitOptions.length > 6} onSelect={(unitId) => handleSelect(ability.interface!.value, unitId)} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CommandPhase;

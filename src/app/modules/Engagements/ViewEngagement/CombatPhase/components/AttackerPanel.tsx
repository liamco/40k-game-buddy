import React, { useMemo, Fragment } from "react";

import type { EngagementForce, EngagementForceItemCombatState, EngagementWargear } from "#types/Engagements";
import type { WeaponProfile, GamePhase } from "#types/index";

import { type UnitSelectItem, filterWargearByAliveModels, groupWargearBySource } from "../utils/combatUtils";

import Dropdown, { type DropdownOption } from "#components/Dropdown/Dropdown.tsx";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";
import WeaponProfileCard from "#components/WeaponProfileCard/WeaponProfileCard.tsx";
import CombatStatusPanel from "./CombatStatusPanel.tsx";

interface AttackerPanelProps {
    gamePhase: GamePhase;
    force: EngagementForce;
    unitItems: UnitSelectItem[];
    selectedUnit: UnitSelectItem | undefined;
    onUnitChange: (unit: UnitSelectItem) => void;
    selectedWeaponProfile: WeaponProfile | null;
    onWeaponProfileChange: (profile: WeaponProfile | null) => void;
    onCombatStatusChange: (updates: Partial<EngagementForceItemCombatState>) => void;
}

export function AttackerPanel({ gamePhase, force, unitItems, selectedUnit, onUnitChange, selectedWeaponProfile, onWeaponProfileChange, onCombatStatusChange }: AttackerPanelProps) {
    // Convert unit items to dropdown options
    const unitOptions = useMemo((): DropdownOption<UnitSelectItem>[] => {
        return unitItems.map((unit) => ({
            id: unit.item.listItemId,
            label: unit.displayName,
            data: unit,
        }));
    }, [unitItems]);

    const combatState = selectedUnit?.item.combatState;
    const startingStrength = selectedUnit?.item.modelInstances?.length || 0;

    // Get available wargear for the selected unit, filtered to alive models only
    const availableWargear = useMemo(() => {
        if (!selectedUnit) return [];
        return filterWargearByAliveModels(selectedUnit.item);
    }, [selectedUnit, combatState?.deadModelIds]);

    // Filter weapons by game phase
    const filteredWeapons = useMemo(() => {
        const weaponType = gamePhase === "shooting" ? "Ranged" : "Melee";
        return availableWargear.filter((weapon) => weapon.type === weaponType);
    }, [availableWargear, gamePhase]);

    // Group weapons by source unit name (for combined units)
    const groupedWeapons = useMemo(() => {
        const groups = groupWargearBySource(filteredWeapons);
        const sourceNames = Object.keys(groups);
        const isCombined = sourceNames.length > 1;
        return { groups, sourceNames, isCombined };
    }, [filteredWeapons]);

    const handleUnitSelect = (unit: UnitSelectItem) => {
        onUnitChange(unit);
        onWeaponProfileChange(null);
    };

    return (
        <section className="grid p-4 pr-[2px] space-y-6 grid-rows-[auto_auto_1fr_auto] border-1 border-skarsnikGreen rounded overflow-auto h-[calc(100vh-161.5px)]" style={{ scrollbarGutter: "stable" }}>
            <Dropdown
                options={unitOptions}
                selectedLabel={selectedUnit?.displayName}
                placeholder="Select attacking unit..."
                searchable
                searchPlaceholder="Search units..."
                emptyMessage="No units found"
                onSelect={handleUnitSelect}
                renderOption={(unit) => <span className="text-blockcaps-m">{unit.displayName}</span>}
                triggerClassName="grow-1 rounded-l-none border-l-0"
            />

            {combatState && selectedUnit && <CombatStatusPanel side="attacker" combatState={combatState} modelCount={combatState.modelCount} startingStrength={startingStrength} onModelCountChange={() => {}} onCombatStatusChange={onCombatStatusChange} unit={selectedUnit.item} />}

            {selectedUnit ? (
                <div className="space-y-4">
                    <SplitHeading label="Select weapon" />

                    {groupedWeapons.isCombined ? (
                        // Combined unit: show weapons grouped by source
                        <div className="space-y-6">
                            {groupedWeapons.sourceNames.map((source) => (
                                <div key={source} className="space-y-2">
                                    <span className="inline-block text-blockcaps-s opacity-75">{source}</span>
                                    {groupedWeapons.groups[source].map((weapon: EngagementWargear) => (
                                        <Fragment key={weapon.id}>
                                            {weapon.profiles.map((profile: WeaponProfile) => {
                                                const isSelected = selectedWeaponProfile?.datasheetId === profile.datasheetId && selectedWeaponProfile?.line === profile.line;
                                                return <WeaponProfileCard key={`${profile.datasheetId}-${profile.line}`} profile={profile} isSelected={isSelected} onWeaponProfileChange={onWeaponProfileChange} />;
                                            })}
                                        </Fragment>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Single unit: show weapons without grouping
                        <div className="space-y-2">
                            {filteredWeapons.map((weapon) => (
                                <Fragment key={weapon.id}>
                                    {weapon.profiles.map((profile: WeaponProfile) => {
                                        const isSelected = selectedWeaponProfile?.datasheetId === profile.datasheetId && selectedWeaponProfile?.line === profile.line;
                                        return <WeaponProfileCard key={`${profile.datasheetId}-${profile.line}`} profile={profile} isSelected={isSelected} onWeaponProfileChange={onWeaponProfileChange} />;
                                    })}
                                </Fragment>
                            ))}
                        </div>
                    )}

                    {filteredWeapons.length === 0 && <p className="text-blockcaps-s opacity-50">No {gamePhase === "shooting" ? "ranged" : "melee"} weapons available</p>}
                </div>
            ) : (
                <div className="flex items-center justify-center p-8">
                    <p className="text-blockcaps-m opacity-50">Select an attacking unit</p>
                </div>
            )}
        </section>
    );
}

export default AttackerPanel;

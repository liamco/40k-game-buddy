import React, { useMemo, Fragment } from "react";

import type { EngagementForce, EngagementForceItem, EngagementForceItemCombatState } from "#types/Engagements";
import type { WeaponProfile, GamePhase, Weapon } from "#types/index";

import { type CombinedUnitItem, getCombinedWargear } from "../utils/combatUtils";

import Dropdown, { type DropdownOption } from "#components/Dropdown/Dropdown.tsx";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";
import WeaponProfileCard from "#components/WeaponProfileCard/WeaponProfileCard.tsx";
import CombatStatusPanel from "./CombatStatusPanel.tsx";
import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconSkull from "#components/icons/IconSkull.tsx";

interface AttackerPanelProps {
    gamePhase: GamePhase;
    force: EngagementForce;
    combinedItems: CombinedUnitItem[];
    selectedCombined: CombinedUnitItem | undefined;
    onUnitChange: (combined: CombinedUnitItem) => void;
    selectedWeaponProfile: WeaponProfile | null;
    onWeaponProfileChange: (profile: WeaponProfile | null) => void;
    modelCount: number;
    startingStrength: number;
    onModelCountChange: (count: number) => void;
    onCombatStatusChange: (updates: Partial<EngagementForceItemCombatState>) => void;
}

export function AttackerPanel({ gamePhase, force, combinedItems, selectedCombined, onUnitChange, selectedWeaponProfile, onWeaponProfileChange, modelCount, startingStrength, onModelCountChange, onCombatStatusChange }: AttackerPanelProps) {
    // Convert combined items to dropdown options
    const unitOptions = useMemo((): DropdownOption<CombinedUnitItem>[] => {
        return combinedItems.map((combined) => ({
            id: combined.item.listItemId,
            label: combined.displayName,
            data: combined,
        }));
    }, [combinedItems]);

    // Get available wargear for the selected unit
    const availableWargear = useMemo(() => {
        if (!selectedCombined) return [];
        return getCombinedWargear(selectedCombined);
    }, [selectedCombined]);

    // Filter weapons by game phase
    const filteredWeapons = useMemo(() => {
        const weaponType = gamePhase === "shooting" ? "Ranged" : "Melee";
        return availableWargear.filter((weapon) => weapon.type === weaponType);
    }, [availableWargear, gamePhase]);

    // Group weapons by source unit for combined units
    const groupedWeapons = useMemo(() => {
        if (!selectedCombined?.isCombined) {
            return null; // Single unit, no grouping needed
        }

        const grouped = filteredWeapons.reduce(
            (acc, weapon) => {
                const source = (weapon as Weapon & { sourceUnit?: string }).sourceUnit || "default";
                if (!acc[source]) {
                    acc[source] = [];
                }
                acc[source].push(weapon);
                return acc;
            },
            {} as Record<string, typeof filteredWeapons>
        );

        // Order: all leaders first (in order), then bodyguard unit
        const leaderNames = selectedCombined.allLeaders.map((l) => l.name);
        const bodyguardName = selectedCombined.bodyguardUnit?.name || "";
        const orderedSources = [...leaderNames, bodyguardName].filter((source) => grouped[source] && grouped[source].length > 0);

        return { grouped, orderedSources };
    }, [filteredWeapons, selectedCombined]);

    const handleUnitSelect = (combined: CombinedUnitItem) => {
        onUnitChange(combined);
        onWeaponProfileChange(null);
    };

    const combatState = selectedCombined?.item.combatState;

    return (
        <section className="grid p-6 space-y-6 grid-rows-[auto_auto_1fr_auto] border-1 border-skarsnikGreen rounded overflow-hidden">
            <Dropdown
                options={unitOptions}
                selectedLabel={selectedCombined?.displayName}
                placeholder="Select attacking unit..."
                searchable
                searchPlaceholder="Search units..."
                emptyMessage="No units found"
                onSelect={handleUnitSelect}
                renderOption={(combined) => <span className="text-blockcaps-m">{combined.displayName}</span>}
                triggerClassName="grow-1 rounded-l-none border-l-0"
            />

            {combatState && <CombatStatusPanel side="attacker" combatState={combatState} modelCount={modelCount} startingStrength={startingStrength} onModelCountChange={onModelCountChange} onCombatStatusChange={onCombatStatusChange} unit={selectedCombined.item} />}

            {selectedCombined ? (
                <div className="overflow-auto">
                    <div className="space-y-4">
                        <SplitHeading label="Select weapon" />

                        {groupedWeapons ? (
                            // Combined unit: show weapons grouped by source
                            <div className="space-y-6">
                                {groupedWeapons.orderedSources.map((source) => (
                                    <div key={source} className="space-y-2">
                                        <span className="inline-block text-blockcaps-s opacity-75">{source}</span>
                                        {groupedWeapons.grouped[source].map((weapon) => (
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

import React, { useMemo, Fragment } from "react";

import type { EngagementForce, EngagementForceItemCombatState, EngagementWargear } from "#types/Engagements";
import type { WeaponProfile, GamePhase } from "#types/index";

import { type UnitSelectItem, type SelectedWeapon, filterWargearByAliveModels, groupWargearBySource, canFireWeapon, getLeaderGrantedWeaponAbilities } from "../utils/combatUtils";

import Dropdown, { type DropdownOption } from "#components/Dropdown/Dropdown.tsx";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";
import WeaponProfileCard from "#components/WeaponProfileCard/WeaponProfileCard.tsx";
import CombatStatusPanel from "./CombatStatusPanel.tsx";
import EmptyState from "#components/EmptyState/EmptyState.tsx";
import IconSkull from "#components/icons/IconSkull.tsx";
import { Badge } from "#components/Badge/Badge.tsx";

interface AttackerPanelProps {
    gamePhase: GamePhase;
    force: EngagementForce;
    unitItems: UnitSelectItem[];
    selectedUnit: UnitSelectItem | undefined;
    onUnitChange: (unit: UnitSelectItem) => void;
    selectedWeapon: SelectedWeapon | null;
    onWeaponChange: (weapon: SelectedWeapon | null) => void;
    onCombatStatusChange: (updates: Partial<EngagementForceItemCombatState>) => void;
}

export function AttackerPanel({ gamePhase, force, unitItems, selectedUnit, onUnitChange, selectedWeapon, onWeaponChange, onCombatStatusChange }: AttackerPanelProps) {
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

    // Get leader-granted weapon abilities (e.g., LETHAL HITS from Lieutenant)
    const leaderGrantedAbilities = useMemo(() => {
        return getLeaderGrantedWeaponAbilities(selectedUnit?.item);
    }, [selectedUnit?.item, combatState?.deadModelIds]);

    const handleUnitSelect = (unit: UnitSelectItem) => {
        onUnitChange(unit);
        onWeaponChange(null);
    };

    const handleWeaponProfileSelect = (profile: WeaponProfile | null, wargearId?: string) => {
        if (profile && wargearId) {
            onWeaponChange({ profile, wargearId });
        } else {
            onWeaponChange(null);
        }
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
                optionClassName={(unit) => (unit.item.combatState.isDestroyed ? "bg-wordBearersRed hover:bg-wordBearersRed hover:text-wildRiderRed text-wildRiderRed" : "")}
                renderOption={(unit) => (
                    <div className="flex p-2 items-center justify-between">
                        <span className="text-blockcaps-m">{unit.displayName}</span> {unit.item.combatState.isDestroyed ? <Badge variant="destructive">Unit destroyed</Badge> : null}
                    </div>
                )}
                triggerClassName="grow-1 rounded-l-none border-l-0"
            />

            {/* No unit selected */}
            {!selectedUnit && (
                <div className="flex items-center justify-center p-8">
                    <p className="text-blockcaps-m opacity-50">Select an attacking unit</p>
                </div>
            )}

            {/* Combat status panel - shown when unit is selected (alive or destroyed) */}
            {selectedUnit && combatState && <CombatStatusPanel side="attacker" combatState={combatState} modelCount={combatState.modelCount} startingStrength={startingStrength} onModelCountChange={() => {}} onCombatStatusChange={onCombatStatusChange} unit={selectedUnit.item} />}

            {/* Unit selected and alive - show weapon selection */}
            {selectedUnit && !combatState?.isDestroyed && (
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
                                                const isSelected = selectedWeapon?.wargearId === weapon.id && selectedWeapon?.profile.line === profile.line;
                                                const { canFire, reason } = gamePhase === "shooting" ? canFireWeapon(profile, combatState?.movementBehaviour || "hold") : { canFire: true, reason: undefined };
                                                return (
                                                    <WeaponProfileCard
                                                        key={`${weapon.id}-${profile.line}`}
                                                        profile={profile}
                                                        wargearId={weapon.id}
                                                        isSelected={isSelected && canFire}
                                                        isDisabled={!canFire}
                                                        onWeaponProfileChange={canFire ? handleWeaponProfileSelect : undefined}
                                                        bonusAttributes={leaderGrantedAbilities}
                                                    />
                                                );
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
                                        const isSelected = selectedWeapon?.wargearId === weapon.id && selectedWeapon?.profile.line === profile.line;
                                        const { canFire, reason } = gamePhase === "shooting" ? canFireWeapon(profile, combatState?.movementBehaviour || "hold") : { canFire: true, reason: undefined };
                                        return (
                                            <WeaponProfileCard
                                                key={`${weapon.id}-${profile.line}`}
                                                profile={profile}
                                                wargearId={weapon.id}
                                                isSelected={isSelected && canFire}
                                                isDisabled={!canFire}
                                                onWeaponProfileChange={canFire ? handleWeaponProfileSelect : undefined}
                                                bonusAttributes={leaderGrantedAbilities}
                                            />
                                        );
                                    })}
                                </Fragment>
                            ))}
                        </div>
                    )}

                    {filteredWeapons.length === 0 && <p className="text-blockcaps-s opacity-50">No {gamePhase === "shooting" ? "ranged" : "melee"} weapons available</p>}
                </div>
            )}

            {/* Unit selected but destroyed */}
            {selectedUnit && combatState?.isDestroyed && (
                <div className="flex items-center justify-center p-8 text-wildRiderRed border-2 border-wildRiderRed">
                    <EmptyState variant="red" label="Everyones dead Dave" leadingIcon={<IconSkull />} />
                </div>
            )}
        </section>
    );
}

export default AttackerPanel;

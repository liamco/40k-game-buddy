import React, { useState, useEffect, Fragment } from "react";
import { ArrowLeftRight } from "lucide-react";

import type { GamePhase, ArmyList, Datasheet, WeaponProfile, Model, ArmyListItem } from "./types";

/**
 * Calculate the total model count from an ArmyListItem's composition.
 * For combined units (leader + attached), sums both.
 */
function calculateModelCount(item: ArmyListItem, attachedItem?: ArmyListItem | null): number {
    let total = 0;

    // Calculate from compositionCounts if available
    if (item.compositionCounts) {
        total += Object.values(item.compositionCounts).reduce((sum, count) => sum + count, 0);
    } else if (item.unitComposition && item.unitComposition.length > 0) {
        // Fall back to minimum values from unitComposition
        total += item.unitComposition.reduce((sum, comp) => sum + (comp.min ?? 1), 0);
    } else {
        // Last resort: count from models array (assumes 1 of each)
        total += item.models?.length ?? 1;
    }

    // Add attached unit's models if present
    if (attachedItem) {
        if (attachedItem.compositionCounts) {
            total += Object.values(attachedItem.compositionCounts).reduce((sum, count) => sum + count, 0);
        } else if (attachedItem.unitComposition && attachedItem.unitComposition.length > 0) {
            total += attachedItem.unitComposition.reduce((sum, comp) => sum + (comp.min ?? 1), 0);
        } else {
            total += attachedItem.models?.length ?? 1;
        }
    }

    return total;
}
import { createDefaultCombatStatus, type CombatStatus, type CombatStatusFlag } from "../../game-engine";

import { loadDatasheetData } from "../../utils/depotDataLoader";

import AttackResolver from "../../modules/AttackResolver/AttackResolver.tsx";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/_ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/_ui/select";

import { GamePhaseSelector } from "../../components/GamePhaseSelector/GamePhaseSelector.tsx";
import { AttackerPanel } from "../../components/AttackerPanel";
import { DefenderPanel } from "../../components/DefenderPanel";
import StratagemList from "../../components/Stratagems/StratagemList";

const STORAGE_KEY = "battle-cogitator-army-lists";
const SESSION_STORAGE_KEY = "battle-cogitator-selected-lists";

export const TheCage = () => {
    const [gamePhase, setGamePhase] = useState<GamePhase>("SHOOTING");
    const [lists, setLists] = useState<ArmyList[]>([]);
    const [attackerListId, setAttackerListId] = useState<string | null>(null);
    const [defenderListId, setDefenderListId] = useState<string | null>(null);

    // Load lists from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsedLists = JSON.parse(stored);
                setLists(parsedLists);
            } catch (error) {
                console.error("Error loading lists:", error);
            }
        }
    }, []);

    // Load selected lists from sessionStorage on mount
    useEffect(() => {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.attackerListId) {
                    setAttackerListId(parsed.attackerListId);
                }
                if (parsed.defenderListId) {
                    setDefenderListId(parsed.defenderListId);
                }
            } catch (error) {
                console.error("Error loading selected lists:", error);
            }
        }
    }, []);

    // Save selected lists to sessionStorage whenever they change
    useEffect(() => {
        const data = {
            attackerListId,
            defenderListId,
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
    }, [attackerListId, defenderListId]);

    // Listen for storage changes (when lists are updated in ListsManager)
    useEffect(() => {
        const handleStorageChange = () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const parsedLists = JSON.parse(stored);
                    setLists(parsedLists);
                    // Clear selected lists if they no longer exist
                    if (attackerListId && !parsedLists.find((l: ArmyList) => l.id === attackerListId)) {
                        setAttackerListId(null);
                    }
                    if (defenderListId && !parsedLists.find((l: ArmyList) => l.id === defenderListId)) {
                        setDefenderListId(null);
                    }
                } catch (error) {
                    console.error("Error loading lists:", error);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        // Also listen to custom event for same-window updates
        window.addEventListener("listsUpdated", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("listsUpdated", handleStorageChange);
        };
    }, [attackerListId, defenderListId]);

    const attackerList = lists.find((l) => l.id === attackerListId) || null;
    const defenderList = lists.find((l) => l.id === defenderListId) || null;

    // Filter lists to exclude the selected list from the opposite side
    const availableAttackerLists = lists.filter((l) => l.id !== defenderListId);
    const availableDefenderLists = lists.filter((l) => l.id !== attackerListId);

    const [attackingUnit, setAttackingUnit] = useState<Datasheet | null>(null);
    const [attackerAttachedUnit, setAttackerAttachedUnit] = useState<Datasheet | null>(null);
    const [defendingUnit, setDefendingUnit] = useState<Datasheet | null>(null);
    const [defenderAttachedUnit, setDefenderAttachedUnit] = useState<Datasheet | null>(null);
    const [selectedWeaponProfile, setSelectedWeaponProfile] = useState<WeaponProfile | null>(null);
    const [selectedUnitModel, setSelectedUnitModel] = useState<Model | null>(null);

    const [attackerCombatStatus, setAttackerCombatStatus] = useState<CombatStatus>(createDefaultCombatStatus());
    const [defenderCombatStatus, setDefenderCombatStatus] = useState<CombatStatus>(createDefaultCombatStatus());

    // Track current model counts for attacker (for calculating total attacks and strength states)
    const [attackerModelCount, setAttackerModelCount] = useState<number>(0);
    const [attackerStartingStrength, setAttackerStartingStrength] = useState<number>(0);

    const handleAttackerStatusChange = (name: CombatStatusFlag, value: boolean) => {
        setAttackerCombatStatus((prev) => ({ ...prev, [name]: value }));
    };

    const handleDefenderStatusChange = (name: CombatStatusFlag, value: boolean) => {
        setDefenderCombatStatus((prev) => ({ ...prev, [name]: value }));
    };

    // Auto-calculate "below starting strength" and "below half strength" based on model count
    useEffect(() => {
        if (attackerStartingStrength === 0) return;

        const isBelowStartingStrength = attackerModelCount < attackerStartingStrength;
        const isBelowHalfStrength = attackerModelCount <= Math.floor(attackerStartingStrength / 2);

        setAttackerCombatStatus((prev) => ({
            ...prev,
            isBelowStartingStrength,
            isBelowHalfStrength,
        }));
    }, [attackerModelCount, attackerStartingStrength]);

    const [activeAttackerStratagems, setActiveAttackerStratagems] = useState<string[]>([]);
    const [activeDefenderStratagems, setActiveDefenderStratagems] = useState<string[]>([]);

    const handleSwapSides = () => {
        // Swap lists
        const tempListId = attackerListId;
        setAttackerListId(defenderListId);
        setDefenderListId(tempListId);

        // Swap units
        const tempUnit = attackingUnit;
        setAttackingUnit(defendingUnit);
        setDefendingUnit(tempUnit);

        // Swap attached units
        const tempAttached = attackerAttachedUnit;
        setAttackerAttachedUnit(defenderAttachedUnit);
        setDefenderAttachedUnit(tempAttached);

        // Swap combat statuses
        const tempStatus = attackerCombatStatus;
        setAttackerCombatStatus(defenderCombatStatus);
        setDefenderCombatStatus(tempStatus);

        // Auto-select first weapon profile for new attacking unit
        if (defendingUnit) {
            const firstRangedWeapon = defendingUnit.wargear.find((weapon) => weapon.type === "Ranged");
            if (firstRangedWeapon && firstRangedWeapon.profiles.length > 0) {
                setSelectedWeaponProfile(firstRangedWeapon.profiles[0]);
            } else {
                setSelectedWeaponProfile(null);
            }
        } else {
            setSelectedWeaponProfile(null);
        }

        // Auto-select first model for new defending unit
        if (attackingUnit) {
            if (attackingUnit.models && attackingUnit.models.length > 0) {
                setSelectedUnitModel(attackingUnit.models[0]);
            } else {
                setSelectedUnitModel(null);
            }
        } else {
            setSelectedUnitModel(null);
        }
    };

    const changeAttackingUnit = async (unit: Datasheet) => {
        if (unit) {
            // Cast to ArmyListItem to check for leader attachment
            const listItem = unit as ArmyListItem;

            // Load the main unit data
            const data = await loadDatasheetData(unit.factionSlug, unit.id);
            if (data) {
                setAttackingUnit(data);

                // Check if this is a leader with an attached unit
                let attachedListItem: ArmyListItem | null = null;
                if (listItem.leading && attackerList) {
                    attachedListItem = attackerList.items.find((u) => u.id === listItem.leading?.id && u.name === listItem.leading?.name) || null;
                    if (attachedListItem) {
                        const attachedData = await loadDatasheetData(attachedListItem.factionSlug, attachedListItem.id);
                        setAttackerAttachedUnit(attachedData);
                    } else {
                        setAttackerAttachedUnit(null);
                    }
                } else {
                    setAttackerAttachedUnit(null);
                }

                // Calculate and set starting strength based on unit composition
                const startingStrength = calculateModelCount(listItem, attachedListItem);
                setAttackerStartingStrength(startingStrength);
                setAttackerModelCount(startingStrength);

                // Auto-select the first weapon profile from the first ranged weapon
                const firstRangedWeapon = data.wargear.find((weapon) => weapon.type === "Ranged");
                if (firstRangedWeapon && firstRangedWeapon.profiles.length > 0) {
                    setSelectedWeaponProfile(firstRangedWeapon.profiles[0]);
                } else {
                    setSelectedWeaponProfile(null);
                }
            }
        } else {
            setAttackingUnit(null);
            setAttackerAttachedUnit(null);
            setSelectedWeaponProfile(null);
            setAttackerStartingStrength(0);
            setAttackerModelCount(0);
        }
    };

    const changeDefendingUnit = async (unit: Datasheet) => {
        if (unit) {
            // Cast to ArmyListItem to check for leader attachment
            const listItem = unit as ArmyListItem;

            // Load the main unit data
            const data = await loadDatasheetData(unit.factionSlug, unit.id);
            if (data) {
                setDefendingUnit(data);

                // Check if this is a leader with an attached unit
                if (listItem.leading && defenderList) {
                    const attachedListItem = defenderList.items.find((u) => u.id === listItem.leading?.id && u.name === listItem.leading?.name);
                    if (attachedListItem) {
                        const attachedData = await loadDatasheetData(attachedListItem.factionSlug, attachedListItem.id);
                        setDefenderAttachedUnit(attachedData);
                    } else {
                        setDefenderAttachedUnit(null);
                    }
                } else {
                    setDefenderAttachedUnit(null);
                }

                // Auto-select the first model option
                if (data.models && data.models.length > 0) {
                    setSelectedUnitModel(data.models[0]);
                } else {
                    setSelectedUnitModel(null);
                }
            }
        } else {
            setDefendingUnit(null);
            setDefenderAttachedUnit(null);
            setSelectedUnitModel(null);
        }
    };

    return (
        <main className="grid grid-cols-2 grid-rows-[auto_1fr_auto] gap-6 px-6 pb-6 h-[calc(100vh-88px)]">
            <nav className="bg-mournfangBrown text-fireDragonBright shadow-glow-orange border-tuskorFur border-1 rounded w-full flex justify-between items-center p-3 col-span-2">
                <div className="flex gap-4 items-center">
                    <Select value={attackerListId || undefined} onValueChange={(value) => setAttackerListId(value || null)}>
                        <SelectTrigger className="w-full bg-transparent p-0">
                            <SelectValue placeholder="Select attacker list..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableAttackerLists.length === 0 ? (
                                <SelectItem value="none" disabled>
                                    No lists available
                                </SelectItem>
                            ) : (
                                availableAttackerLists.map((list) => (
                                    <SelectItem key={list.id} value={list.id}>
                                        <p className="leading-3 text-left">
                                            <span className="text-blockcaps-m block">{list.name}</span>
                                            <span className="text-blockcaps-xs">{list.factionName} - </span>
                                            <span className="text-blockcaps-xs">{list.detachmentName}</span>
                                        </p>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <span className="text-blockcaps-m">VS</span>
                    <Select value={defenderListId || undefined} onValueChange={(value) => setDefenderListId(value || null)}>
                        <SelectTrigger className="w-full bg-transparent p-0 ">
                            <SelectValue placeholder="Select defender list..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableDefenderLists.length === 0 ? (
                                <SelectItem value="none" disabled>
                                    No lists available
                                </SelectItem>
                            ) : (
                                availableDefenderLists.map((list) => (
                                    <SelectItem key={list.id} value={list.id}>
                                        <p className="leading-3 text-left">
                                            <span className="text-blockcaps-m block">{list.name}</span>
                                            <span className="text-blockcaps-xs">{list.factionName} - </span>
                                            <span className="text-blockcaps-xs">{list.detachmentName}</span>
                                        </p>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <GamePhaseSelector currentPhase={gamePhase} onPhaseChange={setGamePhase} />
            </nav>
            <AttackerPanel gamePhase={gamePhase} unit={attackingUnit} attachedUnit={attackerAttachedUnit} onUnitChange={changeAttackingUnit} selectedWeaponProfile={selectedWeaponProfile} onWeaponProfileChange={setSelectedWeaponProfile} combatStatus={attackerCombatStatus} onCombatStatusChange={handleAttackerStatusChange} selectedList={attackerList} modelCount={attackerModelCount} startingStrength={attackerStartingStrength} onModelCountChange={setAttackerModelCount} />
            <DefenderPanel gamePhase={gamePhase} unit={defendingUnit} attachedUnit={defenderAttachedUnit} onUnitChange={changeDefendingUnit} selectedUnitModel={selectedUnitModel} onUnitModelChange={setSelectedUnitModel} combatStatus={defenderCombatStatus} onCombatStatusChange={handleDefenderStatusChange} selectedList={defenderList} selectedWeaponProfile={selectedWeaponProfile} />
            <AttackResolver gamePhase={gamePhase} attackingUnit={attackingUnit} attackerAttachedUnit={attackerAttachedUnit} defendingUnit={defendingUnit} defenderAttachedUnit={defenderAttachedUnit} selectedWeaponProfile={selectedWeaponProfile} selectedDefendingModel={selectedUnitModel} attackerCombatStatus={attackerCombatStatus} defenderCombatStatus={defenderCombatStatus} activeAttackerStratagems={activeAttackerStratagems} activeDefenderStratagems={activeDefenderStratagems} attackerModelCount={attackerModelCount} />
            {/*<StratagemList scope="Attacker" gamePhase={gamePhase} gameTurn="YOURS" selectedList={attackerList} />
            <StratagemList scope="Defender" gamePhase={gamePhase} gameTurn="OPPONENTS" selectedList={defenderList} />*/}
        </main>
    );
};

export default TheCage;

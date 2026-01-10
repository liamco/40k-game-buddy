import React, { useState, useEffect, Fragment } from "react";
import { ArrowLeftRight } from "lucide-react";

import type { GamePhase, ArmyList, Datasheet, WeaponProfile, Model, ArmyListItem } from "./types";
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

    const handleAttackerStatusChange = (name: CombatStatusFlag, value: boolean) => {
        setAttackerCombatStatus((prev) => ({ ...prev, [name]: value }));
    };

    const handleDefenderStatusChange = (name: CombatStatusFlag, value: boolean) => {
        setDefenderCombatStatus((prev) => ({ ...prev, [name]: value }));
    };

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
                if (listItem.leading && attackerList) {
                    const attachedListItem = attackerList.items.find((u) => u.id === listItem.leading?.id && u.name === listItem.leading?.name);
                    if (attachedListItem) {
                        const attachedData = await loadDatasheetData(attachedListItem.factionSlug, attachedListItem.id);
                        setAttackerAttachedUnit(attachedData);
                    } else {
                        setAttackerAttachedUnit(null);
                    }
                } else {
                    setAttackerAttachedUnit(null);
                }

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
                <div className="flex gap-4">
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
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs">{list.detachmentName}</span>
                                            <span className="font-medium">{list.factionName}</span>
                                        </div>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <button onClick={handleSwapSides} className="p-1 rounded-full hover:bg-[#e6e6e6] transition-colors" title="Swap attacker and defender" disabled={!attackerListId || !defenderListId}>
                        <ArrowLeftRight className="size-6 " />
                    </button>
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
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs">{list.detachmentName}</span>
                                            <span className="font-medium">{list.factionName}</span>
                                        </div>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <GamePhaseSelector currentPhase={gamePhase} onPhaseChange={setGamePhase} />
            </nav>
            <AttackerPanel gamePhase={gamePhase} unit={attackingUnit} attachedUnit={attackerAttachedUnit} onUnitChange={changeAttackingUnit} selectedWeaponProfile={selectedWeaponProfile} onWeaponProfileChange={setSelectedWeaponProfile} combatStatus={attackerCombatStatus} onCombatStatusChange={handleAttackerStatusChange} selectedList={attackerList} />
            <DefenderPanel gamePhase={gamePhase} unit={defendingUnit} attachedUnit={defenderAttachedUnit} onUnitChange={changeDefendingUnit} selectedUnitModel={selectedUnitModel} onUnitModelChange={setSelectedUnitModel} combatStatus={defenderCombatStatus} onCombatStatusChange={handleDefenderStatusChange} selectedList={defenderList} selectedWeaponProfile={selectedWeaponProfile} />
            <AttackResolver gamePhase={gamePhase} attackingUnit={attackingUnit} attackerAttachedUnit={attackerAttachedUnit} defendingUnit={defendingUnit} defenderAttachedUnit={defenderAttachedUnit} selectedWeaponProfile={selectedWeaponProfile} selectedDefendingModel={selectedUnitModel} attackerCombatStatus={attackerCombatStatus} defenderCombatStatus={defenderCombatStatus} activeAttackerStratagems={activeAttackerStratagems} activeDefenderStratagems={activeDefenderStratagems} />
            {/*<StratagemList scope="Attacker" gamePhase={gamePhase} gameTurn="YOURS" selectedList={attackerList} />
            <StratagemList scope="Defender" gamePhase={gamePhase} gameTurn="OPPONENTS" selectedList={defenderList} />*/}
        </main>
    );
};

export default TheCage;

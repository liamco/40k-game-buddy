import React, { useState, useEffect, useMemo, Fragment } from "react";
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
import type { Weapon } from "../../types";

/**
 * Get the first weapon profile matching the current game phase.
 */
function getFirstWeaponProfileForPhase(wargear: Weapon[], phase: GamePhase): WeaponProfile | null {
    const weaponType = phase === "SHOOTING" ? "Ranged" : "Melee";
    const weapon = wargear.find((w) => w.type === weaponType);
    if (weapon && weapon.profiles.length > 0) {
        return weapon.profiles[0];
    }
    return null;
}

/**
 * Check if a weapon profile has the PRECISION attribute.
 */
function hasPrecisionAttribute(profile: WeaponProfile | null): boolean {
    if (!profile || !profile.attributes) return false;
    return profile.attributes.includes("PRECISION");
}

/**
 * Get the first valid model for the defender, respecting precision rules.
 * For combined units, prefer non-leader models unless weapon has PRECISION.
 */
function getFirstValidModel(unit: Datasheet | null, attachedUnit: Datasheet | null, weaponProfile: WeaponProfile | null): Model | null {
    if (!unit || !unit.models || unit.models.length === 0) return null;

    const hasPrecision = hasPrecisionAttribute(weaponProfile);

    // If there's an attached unit (combined unit scenario)
    if (attachedUnit && attachedUnit.models && attachedUnit.models.length > 0) {
        // If weapon has PRECISION, we can target leader models - return first model (leader)
        if (hasPrecision) {
            return unit.models[0];
        }
        // Otherwise, return first model from attached unit (non-leader)
        return attachedUnit.models[0];
    }

    // Single unit - return first model
    return unit.models[0];
}

import AttackResolver from "../../modules/AttackResolver/AttackResolver.tsx";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/_ui/tabs";
import Dropdown, { type DropdownOption } from "../../components/Dropdown/Dropdown";

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

    // Available lists for the panel dropdowns (both selected lists)
    const panelAvailableLists = useMemo(() => {
        const result: ArmyList[] = [];
        if (attackerList) result.push(attackerList);
        if (defenderList) result.push(defenderList);
        return result;
    }, [attackerList, defenderList]);

    // Handler for attacker panel list change - auto-populate defender with the other list
    const handleAttackerPanelListChange = (listId: string) => {
        setAttackerListId(listId);
        // Auto-populate defender with the other list
        const otherList = panelAvailableLists.find((l) => l.id !== listId);
        if (otherList && defenderListId !== otherList.id) {
            setDefenderListId(otherList.id);
        }
        // Clear selected units when list changes
        setDefendingUnit(null);
        setDefenderAttachedUnit(null);
        setSelectedUnitModel(null);
        setAttackingUnit(null);
        setAttackerAttachedUnit(null);
        setSelectedWeaponProfile(null);
    };

    // Handler for defender panel list change - auto-populate attacker with the other list
    const handleDefenderPanelListChange = (listId: string) => {
        setDefenderListId(listId);
        // Auto-populate attacker with the other list
        const otherList = panelAvailableLists.find((l) => l.id !== listId);
        if (otherList && attackerListId !== otherList.id) {
            setAttackerListId(otherList.id);
        }
        // Clear selected units when list changes
        setDefendingUnit(null);
        setDefenderAttachedUnit(null);
        setSelectedUnitModel(null);
        setAttackingUnit(null);
        setAttackerAttachedUnit(null);
        setSelectedWeaponProfile(null);
    };

    // Convert lists to Dropdown options
    const attackerListOptions = useMemo((): DropdownOption<ArmyList>[] => {
        return availableAttackerLists.map((list) => ({
            id: list.id,
            label: list.name,
            data: list,
        }));
    }, [availableAttackerLists]);

    const defenderListOptions = useMemo((): DropdownOption<ArmyList>[] => {
        return availableDefenderLists.map((list) => ({
            id: list.id,
            label: list.name,
            data: list,
        }));
    }, [availableDefenderLists]);

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

    // Track current model counts for defender (for calculating strength states)
    const [defenderModelCount, setDefenderModelCount] = useState<number>(0);
    const [defenderStartingStrength, setDefenderStartingStrength] = useState<number>(0);

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

    // Auto-calculate defender "below starting strength" and "below half strength" based on model count
    useEffect(() => {
        if (defenderStartingStrength === 0) return;

        const isBelowStartingStrength = defenderModelCount < defenderStartingStrength;
        const isBelowHalfStrength = defenderModelCount <= Math.floor(defenderStartingStrength / 2);

        setDefenderCombatStatus((prev) => ({
            ...prev,
            isBelowStartingStrength,
            isBelowHalfStrength,
        }));
    }, [defenderModelCount, defenderStartingStrength]);

    // Re-select weapon and model when game phase changes
    useEffect(() => {
        // Re-select weapon profile for the current phase if attacking unit exists
        if (attackingUnit) {
            const currentWeaponType = selectedWeaponProfile ? attackingUnit.wargear.find((w) => w.profiles.some((p) => p.name === selectedWeaponProfile.name))?.type : null;
            const expectedType = gamePhase === "SHOOTING" ? "Ranged" : "Melee";

            // Only re-select if current weapon is wrong type or no weapon selected
            if (!selectedWeaponProfile || currentWeaponType !== expectedType) {
                const newWeaponProfile = getFirstWeaponProfileForPhase(attackingUnit.wargear, gamePhase);
                setSelectedWeaponProfile(newWeaponProfile);

                // Also update model selection based on new weapon's precision status
                if (defendingUnit) {
                    const validModel = getFirstValidModel(defendingUnit, defenderAttachedUnit, newWeaponProfile);
                    setSelectedUnitModel(validModel);
                }
            }
        }
    }, [gamePhase]); // Only trigger on phase change

    // Re-select model when weapon profile changes and current selection is invalid
    useEffect(() => {
        if (!defendingUnit || !selectedUnitModel) return;

        // Check if current model is a leader model in a combined unit
        const isLeaderModel = defenderAttachedUnit && defendingUnit.models?.some((m) => m.name === selectedUnitModel.name);

        // If it's a leader model and weapon doesn't have precision, re-select
        if (isLeaderModel && !hasPrecisionAttribute(selectedWeaponProfile)) {
            const validModel = getFirstValidModel(defendingUnit, defenderAttachedUnit, selectedWeaponProfile);
            if (validModel && validModel.name !== selectedUnitModel.name) {
                setSelectedUnitModel(validModel);
            }
        }
    }, [selectedWeaponProfile]); // Trigger when weapon changes

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

        // Auto-select first weapon profile for new attacking unit based on phase
        const newWeaponProfile = defendingUnit ? getFirstWeaponProfileForPhase(defendingUnit.wargear, gamePhase) : null;
        setSelectedWeaponProfile(newWeaponProfile);

        // Auto-select first valid model for new defending unit (respecting precision)
        // Note: after swap, attackingUnit becomes the defender, defenderAttachedUnit becomes attackerAttachedUnit
        const newModel = getFirstValidModel(attackingUnit, defenderAttachedUnit, newWeaponProfile);
        setSelectedUnitModel(newModel);
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

                // Auto-select the first weapon profile based on current game phase
                const newWeaponProfile = getFirstWeaponProfileForPhase(data.wargear, gamePhase);
                setSelectedWeaponProfile(newWeaponProfile);
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
                let attachedListItem: ArmyListItem | null = null;
                let attachedData: Datasheet | null = null;
                if (listItem.leading && defenderList) {
                    attachedListItem = defenderList.items.find((u) => u.id === listItem.leading?.id && u.name === listItem.leading?.name) || null;
                    if (attachedListItem) {
                        attachedData = await loadDatasheetData(attachedListItem.factionSlug, attachedListItem.id);
                        setDefenderAttachedUnit(attachedData);
                    } else {
                        setDefenderAttachedUnit(null);
                    }
                } else {
                    setDefenderAttachedUnit(null);
                }

                // Calculate and set starting strength based on unit composition
                const startingStrength = calculateModelCount(listItem, attachedListItem);
                setDefenderStartingStrength(startingStrength);
                setDefenderModelCount(startingStrength);

                // Auto-select the first valid model (respecting precision rules)
                const validModel = getFirstValidModel(data, attachedData, selectedWeaponProfile);
                setSelectedUnitModel(validModel);
            }
        } else {
            setDefendingUnit(null);
            setDefenderAttachedUnit(null);
            setSelectedUnitModel(null);
            setDefenderStartingStrength(0);
            setDefenderModelCount(0);
        }
    };

    return (
        <main className="grid grid-cols-2 grid-rows-[auto_1fr_auto] gap-6 px-6 pb-6 h-[calc(100vh-80px)]">
            <nav className="bg-mournfangBrown text-fireDragonBright shadow-glow-orange border-tuskorFur border-1 rounded w-full flex justify-between items-center p-3 col-span-2">
                <div className="flex gap-4 items-center">
                    <Dropdown
                        options={attackerListOptions}
                        selectedLabel={attackerList?.name}
                        placeholder="Select attacker list..."
                        onSelect={(list) => setAttackerListId(list.id)}
                        triggerClassName="!w-[200px] bg-mournfangBrown !p-0"
                        renderOption={(list) => (
                            <p className="text-left">
                                <span className="text-blockcaps-m block">{list.name}</span>
                                <span className="text-blockcaps-s">{list.factionName} - </span>
                                <span className="text-blockcaps-s">{list.detachmentName}</span>
                            </p>
                        )}
                    />
                    <span className="text-blockcaps-m">VS</span>
                    <Dropdown
                        options={defenderListOptions}
                        selectedLabel={defenderList?.name}
                        placeholder="Select defender list..."
                        onSelect={(list) => setDefenderListId(list.id)}
                        triggerClassName="!w-[200px] bg-mournfangBrown !p-0"
                        renderOption={(list) => (
                            <p className="text-left">
                                <span className="text-blockcaps-m block">{list.name}</span>
                                <span className="text-blockcaps-s">{list.factionName} - </span>
                                <span className="text-blockcaps-s">{list.detachmentName}</span>
                            </p>
                        )}
                    />
                </div>
                <GamePhaseSelector currentPhase={gamePhase} onPhaseChange={setGamePhase} />
            </nav>
            <AttackerPanel gamePhase={gamePhase} unit={attackingUnit} attachedUnit={attackerAttachedUnit} onUnitChange={changeAttackingUnit} selectedWeaponProfile={selectedWeaponProfile} onWeaponProfileChange={setSelectedWeaponProfile} combatStatus={attackerCombatStatus} onCombatStatusChange={handleAttackerStatusChange} selectedList={attackerList} modelCount={attackerModelCount} startingStrength={attackerStartingStrength} onModelCountChange={setAttackerModelCount} availableLists={panelAvailableLists} onListChange={handleAttackerPanelListChange} />
            <DefenderPanel gamePhase={gamePhase} unit={defendingUnit} attachedUnit={defenderAttachedUnit} onUnitChange={changeDefendingUnit} selectedUnitModel={selectedUnitModel} onUnitModelChange={setSelectedUnitModel} combatStatus={defenderCombatStatus} onCombatStatusChange={handleDefenderStatusChange} selectedList={defenderList} selectedWeaponProfile={selectedWeaponProfile} modelCount={defenderModelCount} startingStrength={defenderStartingStrength} onModelCountChange={setDefenderModelCount} availableLists={panelAvailableLists} onListChange={handleDefenderPanelListChange} />
            <AttackResolver gamePhase={gamePhase} attackingUnit={attackingUnit} attackerAttachedUnit={attackerAttachedUnit} defendingUnit={defendingUnit} defenderAttachedUnit={defenderAttachedUnit} selectedWeaponProfile={selectedWeaponProfile} selectedDefendingModel={selectedUnitModel} attackerCombatStatus={attackerCombatStatus} defenderCombatStatus={defenderCombatStatus} activeAttackerStratagems={activeAttackerStratagems} activeDefenderStratagems={activeDefenderStratagems} attackerModelCount={attackerModelCount} />
            {/*<StratagemList scope="Attacker" gamePhase={gamePhase} gameTurn="YOURS" selectedList={attackerList} />
            <StratagemList scope="Defender" gamePhase={gamePhase} gameTurn="OPPONENTS" selectedList={defenderList} />*/}
        </main>
    );
};

export default TheCage;

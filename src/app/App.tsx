import React, { useState, useEffect, Fragment } from "react";
import { ArrowLeftRight } from "lucide-react";

const STORAGE_KEY = "battle-cogitator-army-lists";
const SESSION_STORAGE_KEY = "battle-cogitator-selected-lists";

import { loadDatasheetData } from "./utils/depotDataLoader";

import type { GamePhase, ArmyList, Datasheet, WeaponProfile, Model } from "./types";

import AttackResolver from "./modules/AttackResolver/AttackResolver";
import StratagemList from "./modules/Stratagems/StratagemList";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./components/ui/select";

import { GamePhaseSelector } from "./components/GamePhaseSelector";
import { AttackerPanel } from "./components/AttackerPanel";
import { DefenderPanel } from "./components/DefenderPanel";
import { ListsManager } from "./components/ListsManager";

function CombatResolver() {
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
    const [defendingUnit, setDefendingUnit] = useState<Datasheet | null>(null);
    const [selectedWeaponProfile, setSelectedWeaponProfile] = useState<WeaponProfile | null>(null);
    const [selectedUnitModel, setSelectedUnitModel] = useState<Model | null>(null);

    const [modifiers, setModifiers] = useState({
        remainedStationary: false,
        inCover: false,
    });

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

    const changeAttackingUnit = (unit:Datasheet) => {
        
        if (unit) {
            loadDatasheetData(unit.factionSlug,unit.id).then((data) => {
                
                if (data) {
                    setAttackingUnit(data);
                    // Auto-select the first weapon profile from the first ranged weapon
                    const firstRangedWeapon = data.wargear.find((weapon) => weapon.type === "Ranged");
                    if (firstRangedWeapon && firstRangedWeapon.profiles.length > 0) {
                        setSelectedWeaponProfile(firstRangedWeapon.profiles[0]);
                    } else {
                        setSelectedWeaponProfile(null);
                    }
                }
            });
        } else {
            setAttackingUnit(null);
            setSelectedWeaponProfile(null);
        }
    }

    const changeDefendingUnit = (unit:Datasheet) => {
        
        if (unit) {
            loadDatasheetData(unit.factionSlug,unit.id).then((data) => {
                
                if (data) {
                    setDefendingUnit(data);
                    // Auto-select the first model option
                    if (data.models && data.models.length > 0) {
                        setSelectedUnitModel(data.models[0]);
                    } else {
                        setSelectedUnitModel(null);
                    }
                }
            });
        } else {
            setDefendingUnit(null);
            setSelectedUnitModel(null);
        }
    }

    return (
        <Fragment>
            <nav className="bg-[#2b344c] w-full flex justify-between items-end px-4">
                <div className="pb-4">
                    <div className="flex gap-4 border-slate-600 border-1 rounded-sm p-2">
                        <Select
                            value={attackerListId || undefined}
                            onValueChange={(value) => setAttackerListId(value || null)}
                            
                        >
                            <SelectTrigger className="w-full bg-transparent p-0 text-white">
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
                        <button
                            onClick={handleSwapSides}
                            className="p-1 rounded-full hover:bg-[#e6e6e6] transition-colors"
                            title="Swap attacker and defender"
                            disabled={!attackerListId || !defenderListId}
                        >
                            <ArrowLeftRight className="size-6 text-[#767676]" />
                        </button>
                        <Select
                            value={defenderListId || undefined}
                            onValueChange={(value) => setDefenderListId(value || null)}
                        >
                            <SelectTrigger className="w-full bg-transparent p-0 text-white">
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
                </div>
                <GamePhaseSelector currentPhase={gamePhase} onPhaseChange={setGamePhase} />
            </nav>
            <main className="font-['Inter:Bold',sans-serif] min-h-screen bg-[#f5f5f5]">
 
                <div className="grid grid-cols-[3fr_3fr_3fr] gap-6 p-6">
                    <AttackerPanel
                        gamePhase={gamePhase}
                        unit={attackingUnit}
                        onUnitChange={changeAttackingUnit}
                        selectedWeaponProfile={selectedWeaponProfile}
                        onWeaponProfileChange={setSelectedWeaponProfile}
                        modifiers={modifiers}
                        onModifiersChange={setModifiers}
                        selectedList={attackerList}
                    />
                    <AttackResolver
                        gamePhase={gamePhase}
                        attackingUnit={attackingUnit}
                        defendingUnit={defendingUnit}
                        selectedWeaponProfile={selectedWeaponProfile}
                        selectedDefendingModel={selectedUnitModel}
                        modifiers={modifiers}
                        activeAttackerStratagems={activeAttackerStratagems}
                        activeDefenderStratagems={activeDefenderStratagems}
                    />
                    <DefenderPanel
                        gamePhase={gamePhase}
                        unit={defendingUnit}
                        onUnitChange={changeDefendingUnit}
                        selectedUnitModel={selectedUnitModel}
                        onUnitModelChange={setSelectedUnitModel}
                        modifiers={modifiers}
                        onModifiersChange={setModifiers}
                        selectedList={defenderList}
                    />
                    <StratagemList
                        scope="Attacker"
                        gamePhase={gamePhase}
                        gameTurn="YOURS"
                        selectedList={attackerList}
                    />
                    <div />
                    <StratagemList
                        scope="Defender"
                        gamePhase={gamePhase}
                        gameTurn="OPPONENTS"
                        selectedList={defenderList}
                    />
                </div>
                
            </main>
        </Fragment>    
    );
}

export default function App() {
    const [activeTab, setActiveTab] = useState("combat");

    return (

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <nav className="bg-[#2b344c] text-white flex justify-between items-center p-4">
                <h1>Holodeck </h1>
                <TabsList className="bg-transparent">  
                    <TabsTrigger
                        value="combat"
                        className="data-[state=active]:bg-white data-[state=active]: data-[state=inactive]:text-[#767676] data-[state=inactive]:hover:text-[#999]"
                    >
                        Battle Cogitatorium
                    </TabsTrigger>
                    <TabsTrigger
                        value="lists"
                        className="data-[state=active]:bg-white data-[state=active]: data-[state=inactive]:text-[#767676] data-[state=inactive]:hover:text-[#999]"
                    >
                        Muster armies
                    </TabsTrigger>
                </TabsList>
            </nav>
            <TabsContent value="combat" className="mt-0">
                <CombatResolver />
            </TabsContent>
            <TabsContent value="lists" className="mt-0">
                <ListsManager />
            </TabsContent>
        </Tabs>  
            
    );
}
